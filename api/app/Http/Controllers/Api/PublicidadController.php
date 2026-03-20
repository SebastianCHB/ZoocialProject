<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Publicidad;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PublicidadController extends Controller
{
    // GET_ALL_PUBLICIDAD
    public function index()
    {
        return response()->json(Publicidad::all(), 200);
    }

    // CREATE_PUBLICIDAD
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'archivo' => 'required|string',
            'duracion' => 'required|integer',
            'texto' => 'nullable|string',
            'estado_pago' => 'required|string|max:50'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $publicidad = Publicidad::create($request->all());
        return response()->json($publicidad, 201);
    }

    // GET_PUBLICIDAD
    public function show($id)
    {
        $publicidad = Publicidad::find($id);
        if (!$publicidad) {
            return response()->json(['message' => 'Publicidad no encontrada'], 404);
        }
        return response()->json($publicidad, 200);
    }

    // UPDATE_PUBLICIDAD
    public function update(Request $request, $id)
    {
        $publicidad = Publicidad::find($id);
        if (!$publicidad) {
            return response()->json(['message' => 'Publicidad no encontrada'], 404);
        }

        $validator = Validator::make($request->all(), [
            'archivo' => 'sometimes|string',
            'duracion' => 'sometimes|integer',
            'texto' => 'nullable|string',
            'estado_pago' => 'sometimes|string|max:50'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $publicidad->update($request->all());
        return response()->json($publicidad, 200);
    }

    // DELETE_PUBLICIDAD
    public function destroy($id)
    {
        $publicidad = Publicidad::find($id);
        if (!$publicidad) {
            return response()->json(['message' => 'Publicidad no encontrada'], 404);
        }
        
        $publicidad->delete();
        return response()->json(['message' => 'Publicidad eliminada'], 200);
    }
}
