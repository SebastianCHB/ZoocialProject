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
            'id_animalito'  => 'required|integer|exists:animalitos,id_animalito',
            // ESTERILIZADO_STRING - La DB usa varchar(30), no boolean
            'esterilizado'  => 'required',
            'vacunas'       => 'nullable|string|max:30',
            'desparasitado' => 'required',
            'nota'          => 'nullable|string|max:30',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        // BOOL_TO_STRING - Convertir 0/1/true/false a 'si'/'no' para varchar(30)
        $esterilizado  = filter_var($request->esterilizado, FILTER_VALIDATE_BOOLEAN) ? 'si' : 'no';
        $desparasitado = filter_var($request->desparasitado, FILTER_VALIDATE_BOOLEAN) ? 'si' : 'no';

        // VACUNAS_NOT_NULL - La columna vacunas es NOT NULL en la DB, usar string vacío como fallback
        $vacunas = $request->vacunas ?? '';

        // FICHA_UNIQUE_CHECK - No crear duplicado si ya existe una ficha para este animalito
        $existing = FichaSalud::where('id_animalito', $request->id_animalito)->first();
        if ($existing) {
            return response()->json(['message' => 'Ya existe una ficha para esta mascota. Usa PUT para actualizar.', 'id_ficha' => $existing->id_ficha], 409);
        }

        $ficha = FichaSalud::create([
            'id_animalito'  => $request->id_animalito,
            'esterilizado'  => $esterilizado,
            'vacunas'       => $vacunas,
            'desparasitado' => $desparasitado,
            'nota'          => $request->nota,
        ]);
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
            'id_animalito'  => 'sometimes|integer|exists:animalitos,id_animalito',
            'esterilizado'  => 'sometimes',
            'vacunas'       => 'nullable|string|max:30',
            'desparasitado' => 'sometimes',
            'nota'          => 'nullable|string|max:30',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        // BOOL_TO_STRING - Solo convertir si se enviaron en el request
        $updateData = [];
        if ($request->has('esterilizado')) {
            $updateData['esterilizado'] = filter_var($request->esterilizado, FILTER_VALIDATE_BOOLEAN) ? 'si' : 'no';
        }
        if ($request->has('desparasitado')) {
            $updateData['desparasitado'] = filter_var($request->desparasitado, FILTER_VALIDATE_BOOLEAN) ? 'si' : 'no';
        }
        if ($request->has('vacunas')) {
            $updateData['vacunas'] = $request->vacunas ?? '';
        }
        if ($request->has('nota')) {
            $updateData['nota'] = $request->nota;
        }

        $ficha->update($updateData);
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
