<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UsersControllers extends Controller
{
    // GET_ALL_USUARIOS
    public function index()
    {
        return response()->json(Usuario::all(), 200);
    }

    // CREATE_USUARIO
    public function store(Request $request)
    {
        $request->validate([
            'nombre_completo' => 'required|string|max:255',
            'correo_e' => 'required|email|unique:usuarios',
            'password' => 'required|string|min:6'
        ]);

        $usuario = Usuario::create([
            'nombre_completo' => $request->nombre_completo,
            'correo_e' => $request->correo_e,
            'password' => Hash::make($request->password),
            'telefono' => null,
            'ciudad' => null,
            'fecha_registro' => date('Y-m-d'),
            'rol' => 'normal',
            'edad' => null
        ]);

        return response()->json($usuario, 201);
    }

    // GET_USUARIO
    public function show($id)
    {
        $usuario = Usuario::with(['identidad', 'responsable', 'procesosAdopcion'])->find($id);
        if (!$usuario) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        }
        return response()->json($usuario, 200);
    }

    // UPDATE_USUARIO
    public function update(Request $request, $id)
    {
        $usuario = Usuario::find($id);
        if (!$usuario) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        }

        $validator = Validator::make($request->all(), [
            'nombre_completo' => 'sometimes|string|max:255',
            'correo_e' => 'sometimes|email|unique:usuarios,correo_e,'.$id.',id_usuario',
            'password' => 'sometimes|string|min:6',
            'telefono' => 'nullable|string|max:20',
            'ciudad' => 'nullable|string|max:100',
            'fecha_registro' => 'sometimes|date',
            'rol' => 'sometimes|in:normal,rescatista,veterinario,admin',
            'edad' => 'nullable|integer|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $data = $request->all();
        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        $usuario->update($data);
        return response()->json($usuario, 200);
    }

    public function updateWithForm(Request $request, $id)
    {
        $usuario = Usuario::find($id);
        if (!$usuario) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        }

        $validator = Validator::make($request->all(), [
            'nombre_completo' => 'sometimes|string|max:255',
            'telefono' => 'nullable|string|max:20',
            'ciudad' => 'nullable|string|max:100',
            'imagen_perfil' => 'nullable|image|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $data = $request->only(['nombre_completo', 'telefono', 'ciudad']);

        // Handle avatar upload
        if ($request->hasFile('imagen_perfil')) {
            $path = $request->file('imagen_perfil')->store('public/avatars');
            $data['imagen_perfil'] = str_replace('public/', 'storage/', $path);
        }

        $usuario->update(array_filter($data, fn($v) => $v !== null));
        return response()->json($usuario, 200);
    }

    // DELETE_USUARIO
    public function destroy($id)
    {
        $usuario = Usuario::find($id);
        if (!$usuario) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        }
        
        $usuario->delete();
        return response()->json(['message' => 'Usuario eliminado'], 200);
    }
}
