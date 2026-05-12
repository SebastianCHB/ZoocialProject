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
        // INCLUDE_FICHA - Cargar fichaSalud para el panel veterinario
        $pets = Animalito::with(['raza.especie', 'responsable', 'fotos', 'fichaSalud'])->get();
        return response()->json($pets, 200);
    }

    // CREATE_NEW_PET
    public function store(Request $request)
    {
        // ACCEPT_PET_FORM_FIELDS - Acepta campos del form de Adoptions.tsx / VetView.tsx
        $nombre         = $request->nombre;
        $genero         = $request->genero ?? $request->sexo ?? 'macho';
        $disponibilidad = $request->disponibilidad ?? $request->estado_adopcion ?? 'disponible';

        // EDAD_ESTIMADO_FIX - La DB requiere edad_estimado NOT NULL
        $edadEstimado = $request->edad_estimado ?? $request->edad_estimada ?? 'N/D';

        if (!$nombre) {
            return response()->json(['message' => 'El nombre es requerido'], 400);
        }

        // FK_SAFE - Buscar responsable/raza válidos, fallback al primero disponible
        $idResponsable = $request->id_responsable
            ?? \App\Models\Responsable::value('id_responsable')
            ?? null;

        $idRaza = $request->id_raza
            ?? \App\Models\Raza::value('id_raza')
            ?? null;

        // FK_NULL_CHECK - Si no hay responsable ni raza en la DB, no se puede crear
        if (!$idResponsable || !$idRaza) {
            return response()->json([
                'message' => 'No hay responsables o razas registrados en el sistema. Contacta al administrador.'
            ], 422);
        }

        $pet = Animalito::create([
            'id_responsable' => $idResponsable,
            'id_raza'        => $idRaza,
            'nombre'         => $nombre,
            // EDAD_NOT_NULL - La columna edad_estimado es NOT NULL en la migración
            'edad_estimado'  => (string) $edadEstimado,
            'genero'         => $genero,
            'disponibilidad' => $disponibilidad,
            // FECHA_INGRESO_NOT_NULL - La columna fecha_ingreso es NOT NULL, se auto-asigna hoy
            'fecha_ingreso'  => now()->toDateString(),
        ]);


        // STORE_RELATIVE_PATH - Acepta 'image' o 'imagenes[]' del form
        $imageFile = $request->file('image') ?? ($request->file('imagenes')[0] ?? null);
        if ($imageFile) {
            $path = $imageFile->store('pets', 'public');
            \App\Models\Foto::create([
                'id_animalito' => $pet->id_animalito,
                'cantidad'     => 1,
                'tipo'         => 'principal',
                'archivo'      => $path, // Relativo: "pets/abc123.jpg"
            ]);
        }

        return response()->json([
            'message' => 'Mascota creada correctamente',
            'data'    => $pet->load('fotos'),
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