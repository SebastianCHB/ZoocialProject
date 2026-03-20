<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Foto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class FotoController extends Controller
{
    // GET_ALL_FOTOS
    public function index()
    {
        return response()->json(Foto::all(), 200);
    }

    // CREATE_FOTO
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_animalito' => 'required|integer|exists:animalitos,id_animalito',
            'cantidad' => 'required|integer',
            'tipo' => 'nullable|string|max:50',
            'archivo' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $foto = Foto::create($request->all());
        return response()->json($foto, 201);
    }

    // GET_FOTO
    public function show($id)
    {
        $foto = Foto::with('animalito')->find($id);
        if (!$foto) {
            return response()->json(['message' => 'Foto no encontrada'], 404);
        }
        return response()->json($foto, 200);
    }

    // UPDATE_FOTO
    public function update(Request $request, $id)
    {
        $foto = Foto::find($id);
        if (!$foto) {
            return response()->json(['message' => 'Foto no encontrada'], 404);
        }

        $validator = Validator::make($request->all(), [
            'id_animalito' => 'sometimes|integer|exists:animalitos,id_animalito',
            'cantidad' => 'sometimes|integer',
            'tipo' => 'nullable|string|max:50',
            'archivo' => 'sometimes|string'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $foto->update($request->all());
        return response()->json($foto, 200);
    }

    // DELETE_FOTO
    public function destroy($id)
    {
        $foto = Foto::find($id);
        if (!$foto) {
            return response()->json(['message' => 'Foto no encontrada'], 404);
        }
        
        $foto->delete();
        return response()->json(['message' => 'Foto eliminada'], 200);
    }
}
