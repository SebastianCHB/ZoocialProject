<?php

namespace App\Http\Controllers\Api; 
use App\Http\Controllers\Controller;
use App\Models\Animalito; 
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class AnimalitoController extends Controller
{
    // GET_ALL_PETS_WITH_RELATIONS
    public function index()
    {
        $pets = Animalito::with(['raza.especie', 'responsable', 'fotos'])->get();
        return response()->json($pets, 200);
    }

    // CREATE_NEW_PET
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_responsable' => 'nullable|integer|exists:responsables,id_responsable',
            'id_raza'        => 'nullable|integer|exists:razas,id_raza',
            'nombre'         => 'required|string|max:100',
            'edad_estimado'  => 'nullable|string',
            'genero'         => 'required|string',
            'disponibilidad' => 'required|string',
            'fecha_ingreso'  => 'nullable|date',
            'image'          => 'nullable|image|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $data = $request->all();
        // ASSIGN_DEFAULT_IDS
        if (empty($data['id_responsable'])) {
            $data['id_responsable'] = \App\Models\Responsable::first()->id_responsable ?? 1;
        }
        if (empty($data['id_raza'])) {
            $data['id_raza'] = \App\Models\Raza::first()->id_raza ?? 1;
        }

        $pet = Animalito::create($data);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('pets', 'public');
            \App\Models\Foto::create([
                'id_animalito' => $pet->id_animalito,
                'cantidad'     => 1,
                'tipo'         => 'principal',
                // url
                'archivo'      => Storage::disk('public')->url($path)
            ]);
        }

        return response()->json([
            'message' => 'Mascota creada correctamente',
            'data' => $pet
        ], 201);
    }

    // GET_PET_DETAILS
    public function show($id)
    {
        $pet = Animalito::with(['raza.especie', 'responsable', 'fichaSalud', 'fotos', 'procesosAdopcion'])
            ->find($id);

        if (!$pet) {
            return response()->json(['message' => 'Mascota no encontrada'], 404);
        }

        return response()->json($pet, 200);
    }

    // UPDATE_PET_DATA
    public function update(Request $request, $id)
    {
        $pet = Animalito::find($id);

        if (!$pet) {
            return response()->json(['message' => 'Mascota no encontrada'], 404);
        }

        $validator = Validator::make($request->all(), [
            'id_responsable' => 'sometimes|integer|exists:responsables,id_responsable',
            'id_raza'        => 'sometimes|integer|exists:razas,id_raza',
            'nombre'         => 'sometimes|string|max:100',
            'edad_estimado'  => 'nullable|string',
            'genero'         => 'sometimes|string',
            'disponibilidad' => 'sometimes|string',
            'fecha_ingreso'  => 'sometimes|date',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $pet->update($request->all());

        return response()->json([
            'message' => 'Datos actualizados',
            'data' => $pet
        ], 200);
    }

    // DELETE_PET
    public function destroy($id)
    {
        $pet = Animalito::find($id);

        if (!$pet) {
            return response()->json(['message' => 'Mascota no encontrada'], 404);
        }

        $pet->delete();

        return response()->json(['message' => 'Registro de mascota eliminado'], 200);
    }
}