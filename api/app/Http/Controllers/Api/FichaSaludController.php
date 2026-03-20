<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FichaSalud;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class FichaSaludController extends Controller
{
    // GET_ALL_FICHAS
    public function index()
    {
        return response()->json(FichaSalud::all(), 200);
    }

    // CREATE_FICHA
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_animalito' => 'required|integer|exists:animalitos,id_animalito',
            'esterilizado' => 'required|boolean',
            'vacunas' => 'nullable|string',
            'desparasitado' => 'required|boolean',
            'nota' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $ficha = FichaSalud::create($request->all());
        return response()->json($ficha, 201);
    }

    // GET_FICHA
    public function show($id)
    {
        $ficha = FichaSalud::with('animalito')->find($id);
        if (!$ficha) {
            return response()->json(['message' => 'Ficha de salud no encontrada'], 404);
        }
        return response()->json($ficha, 200);
    }

    // UPDATE_FICHA
    public function update(Request $request, $id)
    {
        $ficha = FichaSalud::find($id);
        if (!$ficha) {
            return response()->json(['message' => 'Ficha de salud no encontrada'], 404);
        }

        $validator = Validator::make($request->all(), [
            'id_animalito' => 'sometimes|integer|exists:animalitos,id_animalito',
            'esterilizado' => 'sometimes|boolean',
            'vacunas' => 'nullable|string',
            'desparasitado' => 'sometimes|boolean',
            'nota' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $ficha->update($request->all());
        return response()->json($ficha, 200);
    }

    // DELETE_FICHA
    public function destroy($id)
    {
        $ficha = FichaSalud::find($id);
        if (!$ficha) {
            return response()->json(['message' => 'Ficha de salud no encontrada'], 404);
        }
        
        $ficha->delete();
        return response()->json(['message' => 'Ficha de salud eliminada'], 200);
    }
}
