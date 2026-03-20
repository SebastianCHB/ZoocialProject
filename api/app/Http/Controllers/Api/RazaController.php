<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Raza;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RazaController extends Controller
{
    // GET_ALL_RAZAS
    public function index()
    {
        return response()->json(Raza::with('especie')->get(), 200);
    }

    // CREATE_RAZA
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_especie' => 'required|integer|exists:especies,id_especie',
            'raza' => 'required|string|max:255'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $raza = Raza::create($request->all());
        return response()->json($raza, 201);
    }

    // GET_RAZA
    public function show($id)
    {
        $raza = Raza::with('especie')->find($id);
        if (!$raza) {
            return response()->json(['message' => 'Raza no encontrada'], 404);
        }
        return response()->json($raza, 200);
    }

    // UPDATE_RAZA
    public function update(Request $request, $id)
    {
        $raza = Raza::find($id);
        if (!$raza) {
            return response()->json(['message' => 'Raza no encontrada'], 404);
        }

        $validator = Validator::make($request->all(), [
            'id_especie' => 'sometimes|integer|exists:especies,id_especie',
            'raza' => 'sometimes|string|max:255'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $raza->update($request->all());
        return response()->json($raza, 200);
    }

    // DELETE_RAZA
    public function destroy($id)
    {
        $raza = Raza::find($id);
        if (!$raza) {
            return response()->json(['message' => 'Raza no encontrada'], 404);
        }
        
        $raza->delete();
        return response()->json(['message' => 'Raza eliminada'], 200);
    }
}
