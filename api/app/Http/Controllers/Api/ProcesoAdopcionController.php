<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProcesoAdopcion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProcesoAdopcionController extends Controller
{
    // GET_ALL_PROCESOS
    public function index()
    {
        return response()->json(ProcesoAdopcion::all(), 200);
    }

    // CREATE_PROCESO
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_usuario' => 'required|integer|exists:usuarios,id_usuario',
            'id_animalito' => 'required|integer|exists:animalitos,id_animalito',
            'estado_solicitud' => 'required|string|max:50',
            'nota' => 'nullable|string',
            'fecha_creacion' => 'required|date'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $proceso = ProcesoAdopcion::create($request->all());
        return response()->json($proceso, 201);
    }

    // GET_PROCESO
    public function show($id)
    {
        $proceso = ProcesoAdopcion::with(['usuario', 'animalito'])->find($id);
        if (!$proceso) {
            return response()->json(['message' => 'Proceso de adopción no encontrado'], 404);
        }
        return response()->json($proceso, 200);
    }

    // UPDATE_PROCESO
    public function update(Request $request, $id)
    {
        $proceso = ProcesoAdopcion::find($id);
        if (!$proceso) {
            return response()->json(['message' => 'Proceso de adopción no encontrado'], 404);
        }

        $validator = Validator::make($request->all(), [
            'id_usuario' => 'sometimes|integer|exists:usuarios,id_usuario',
            'id_animalito' => 'sometimes|integer|exists:animalitos,id_animalito',
            'estado_solicitud' => 'sometimes|string|max:50',
            'nota' => 'nullable|string',
            'fecha_creacion' => 'sometimes|date'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $proceso->update($request->all());
        return response()->json($proceso, 200);
    }

    // DELETE_PROCESO
    public function destroy($id)
    {
        $proceso = ProcesoAdopcion::find($id);
        if (!$proceso) {
            return response()->json(['message' => 'Proceso de adopción no encontrado'], 404);
        }
        
        $proceso->delete();
        return response()->json(['message' => 'Proceso de adopción eliminado'], 200);
    }
}
