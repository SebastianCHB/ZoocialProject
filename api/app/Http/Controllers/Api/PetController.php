<?php

namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Animalito; 
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PetController extends Controller
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
            'id_responsable' => 'required|integer|exists:responsables,id_responsable',
            'id_raza'        => 'required|integer|exists:razas,id_raza',
            'nombre'         => 'required|string|max:100',
            'genero'         => 'required|string',
            'disponibilidad' => 'required|string',
            'fecha_ingreso'  => 'required|date',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $pet = Animalito::create($request->all());

        return response()->json([
            'message' => 'Mascota creada correctamente',
            'data' => $pet
        ], 201);
    }

    // GET_PET_DETAILS
    public function show($id)
    {
        $pet = Animalito::with(['raza.especie', 'responsable', 'fichaSalud', 'fotos'])
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