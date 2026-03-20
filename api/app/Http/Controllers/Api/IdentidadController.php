<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Identidad;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class IdentidadController extends Controller
{
    // GET_ALL_IDENTIDADES
    public function index()
    {
        return response()->json(Identidad::all(), 200);
    }

    // CREATE_IDENTIDAD
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_usuario' => 'required|integer|exists:usuarios,id_usuario',
            'tipo_documento' => 'required|string|max:50',
            'numero_documento' => 'required|string|max:255',
            'foto' => 'required|string',
            'foto_reverso' => 'nullable|string',
            'foto_persona' => 'nullable|string',
            'estado_verificacion' => 'required|string|max:50'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $identidad = Identidad::create($request->all());
        return response()->json($identidad, 201);
    }

    // GET_IDENTIDAD
    public function show($id)
    {
        $identidad = Identidad::with('usuario')->find($id);
        if (!$identidad) {
            return response()->json(['message' => 'Identidad no encontrada'], 404);
        }
        return response()->json($identidad, 200);
    }

    // UPDATE_IDENTIDAD
    public function update(Request $request, $id)
    {
        $identidad = Identidad::find($id);
        if (!$identidad) {
            return response()->json(['message' => 'Identidad no encontrada'], 404);
        }

        $validator = Validator::make($request->all(), [
            'id_usuario' => 'sometimes|integer|exists:usuarios,id_usuario',
            'tipo_documento' => 'sometimes|string|max:50',
            'numero_documento' => 'sometimes|string|max:255',
            'foto' => 'sometimes|string',
            'foto_reverso' => 'nullable|string',
            'foto_persona' => 'nullable|string',
            'estado_verificacion' => 'sometimes|string|max:50'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $identidad->update($request->all());
        return response()->json($identidad, 200);
    }

    // DELETE_IDENTIDAD
    public function destroy($id)
    {
        $identidad = Identidad::find($id);
        if (!$identidad) {
            return response()->json(['message' => 'Identidad no encontrada'], 404);
        }
        
        $identidad->delete();
        return response()->json(['message' => 'Identidad eliminada'], 200);
    }
}
