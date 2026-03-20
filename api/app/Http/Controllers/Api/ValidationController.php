<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserValidation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ValidationController extends Controller
{
    // CREATE_VALIDATION
    public function store(Request $request)
    {
        $request->validate([
            'documento' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120',
            'documento_tipo' => 'required|in:identificacion,cedula_profesional',
        ]);

        $usuario = $request->user();

        $existingValidation = UserValidation::where('id_usuario', $usuario->id_usuario)
            ->whereIn('estado', ['pendiente', 'aprobado'])
            ->first();

        if ($existingValidation) {
            return response()->json([
                'message' => 'El usuario ya cuenta con una validación pendiente o aprobada.'
            ], 400);
        }

        $file = $request->file('documento');
        
        $path = $file->store('validations', 'public');

        $validation = UserValidation::create([
            'id_usuario' => $usuario->id_usuario,
            'documento_tipo' => $request->documento_tipo,
            'documento_url' => $path,
            'estado' => 'pendiente'
        ]);

        return response()->json([
            'message' => 'Documento subido correctamente. En espera de aprobación.',
            'validation' => $validation
        ], 201);
    }

    // GET_ALL_VALIDATIONS
    public function index(Request $request)
    {
        // ADMINS_ONLY
        if ($request->user()->rol !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validations = UserValidation::with('usuario:id_usuario,nombre_completo,correo_e,rol')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($validations);
    }

    // GET_VALIDATION_STATUS
    public function show(Request $request)
    {
        $validation = UserValidation::where('id_usuario', $request->user()->id_usuario)
            ->latest()
            ->first();

        return response()->json([
            'validation' => $validation
        ]);
    }

    // UPDATE_VALIDATION_STATUS
    public function update(Request $request, $id)
    {
        // ADMINS_ONLY
        if ($request->user()->rol !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'estado' => 'required|in:aprobado,rechazado',
            'notas' => 'nullable|string|max:500'
        ]);

        $validation = UserValidation::findOrFail($id);
        $validation->update([
            'estado' => $request->estado,
            'notas' => $request->notas
        ]);

        // HANDLE_APPROVAL_LOGIC
        if ($request->estado === 'aprobado') {
            $usuario = $validation->usuario;
            // AUTO_UPGRADE_ROLE
            // KEEP_UPDATED
        }

        return response()->json([
            'message' => 'Validación actualizada correctamente.',
            'validation' => $validation->load('usuario')
        ]);
    }
}
