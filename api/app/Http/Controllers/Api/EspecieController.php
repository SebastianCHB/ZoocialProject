<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Especie;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class EspecieController extends Controller
{
    // GET_ALL_ESPECIES
    public function index()
    {
        return response()->json(Especie::all(), 200);
    }

    // CREATE_ESPECIE
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|max:255'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $especie = Especie::create($request->all());
        return response()->json($especie, 201);
    }

    // GET_ESPECIE
    public function show($id)
    {
        $especie = Especie::with('razas')->find($id);
        if (!$especie) {
            return response()->json(['message' => 'Especie no encontrada'], 404);
        }
        return response()->json($especie, 200);
    }

    // UPDATE_ESPECIE
    public function update(Request $request, $id)
    {
        $especie = Especie::find($id);
        if (!$especie) {
            return response()->json(['message' => 'Especie no encontrada'], 404);
        }

        $validator = Validator::make($request->all(), [
            'nombre' => 'sometimes|string|max:255'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $especie->update($request->all());
        return response()->json($especie, 200);
    }

    // DELETE_ESPECIE
    public function destroy($id)
    {
        $especie = Especie::find($id);
        if (!$especie) {
            return response()->json(['message' => 'Especie no encontrada'], 404);
        }
        
        $especie->delete();
        return response()->json(['message' => 'Especie eliminada'], 200);
    }
}
