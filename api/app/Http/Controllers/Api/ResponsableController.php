<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Responsable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ResponsableController extends Controller
{
    // GET_ALL_RESPONSABLES
    public function index()
    {
        return response()->json(Responsable::all(), 200);
    }

    // CREATE_RESPONSABLE
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_usuario' => 'required|integer|exists:usuarios,id_usuario',
            'tipo_responsable' => 'required|string',
            'nombre_refugio' => 'nullable|string|max:255',
            'direccion' => 'nullable|string|max:255'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $responsable = Responsable::create($request->all());
        return response()->json($responsable, 201);
    }

    // GET_RESPONSABLE
    public function show($id)
    {
        $responsable = Responsable::with('usuario')->find($id);
        if (!$responsable) {
            return response()->json(['message' => 'Responsable no encontrado'], 404);
        }
        return response()->json($responsable, 200);
    }

    // UPDATE_RESPONSABLE
    public function update(Request $request, $id)
    {
        $responsable = Responsable::find($id);
        if (!$responsable) {
            return response()->json(['message' => 'Responsable no encontrado'], 404);
        }

        $validator = Validator::make($request->all(), [
            'id_usuario' => 'sometimes|integer|exists:usuarios,id_usuario',
            'tipo_responsable' => 'sometimes|string',
            'nombre_refugio' => 'nullable|string|max:255',
            'direccion' => 'nullable|string|max:255'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $responsable->update($request->all());
        return response()->json($responsable, 200);
    }

    // DELETE_RESPONSABLE
    public function destroy($id)
    {
        $responsable = Responsable::find($id);
        if (!$responsable) {
            return response()->json(['message' => 'Responsable no encontrado'], 404);
        }
        
        $responsable->delete();
        return response()->json(['message' => 'Responsable eliminado'], 200);
    }
}
