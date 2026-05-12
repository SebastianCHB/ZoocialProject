<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\VerifyAccountMail;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class UsersControllers extends Controller
{
    // GET_ALL_USUARIOS
    public function index()
    {
        return response()->json(Usuario::all(), 200);
    }

    // CREATE_USUARIO - Registro público. Acepta rol del usuario (sin exponer admin)
    public function store(Request $request)
    {
        $request->validate([
            'nombre_completo' => 'required|string|max:255',
            'correo_e'        => 'required|email|unique:usuarios',
            'password'        => 'required|string|min:6',
            // ROL_REGISTER_FIELD - Permite normal/rescatista/veterinario. admin nunca desde registro público.
            'rol'             => 'nullable|in:normal,rescatista,veterinario',
        ]);

        // ROL_SAFEGUARD - Si no se envía rol o se intenta 'admin', default a 'normal'
        $rol = in_array($request->rol, ['normal', 'rescatista', 'veterinario'])
            ? $request->rol
            : 'normal';

        $usuario = Usuario::create([
            'nombre_completo'  => $request->nombre_completo,
            'correo_e'         => $request->correo_e,
            'password'         => Hash::make($request->password),
            'telefono'         => null,
            'ciudad'           => null,
            'fecha_registro'   => date('Y-m-d'),
            'rol'              => $rol,
            'edad'             => null,
            'email_verify_token' => Str::random(64),
        ]);

        // SEND_VERIFY_EMAIL - Enviar correo de verificación (Opción A: soft, no bloquea login)
        try {
            $frontendUrl = env('FRONTEND_URL', 'https://zooocial.alwaysdata.net');
            $verifyUrl = "{$frontendUrl}/#/verify-email?token={$usuario->email_verify_token}";
            Mail::to($usuario->correo_e)->send(new VerifyAccountMail($usuario->nombre_completo, $verifyUrl));
        } catch (\Exception $e) {
            // No bloquear el registro si el correo falla
        }

        // Crear token para login automático tras registro
        $token = $usuario->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user'         => $usuario,
            'access_token' => $token,
            'token_type'   => 'Bearer',
        ], 201);
    }

    // VERIFY_EMAIL - Marca la cuenta como verificada con el token recibido por email
    public function verifyEmail(Request $request)
    {
        $token = $request->query('token');
        if (!$token) {
            return response()->json(['message' => 'Token requerido.'], 400);
        }

        $usuario = Usuario::where('email_verify_token', $token)->first();
        if (!$usuario) {
            return response()->json(['message' => 'Token inválido o cuenta ya verificada.'], 404);
        }

        $usuario->email_verified_at    = now();
        $usuario->email_verify_token   = null; // Invalidar token
        $usuario->save();

        return response()->json(['message' => '¡Cuenta verificada exitosamente! Ya puedes usar Zoocial al 100%.'], 200);
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

        // AVATAR_URL_BUILDER - Usar disco public para que el archivo sea accesible vía web
        // Guarda path relativo ("avatars/filename.jpg"); el frontend construye la URL completa
        if ($request->hasFile('imagen_perfil')) {
            // Eliminar avatar anterior si existe
            $oldPath = $usuario->imagen_perfil;
            if ($oldPath && !str_starts_with($oldPath, 'http') && Storage::disk('public')->exists($oldPath)) {
                Storage::disk('public')->delete($oldPath);
            }
            $path = $request->file('imagen_perfil')->store('avatars', 'public');
            $data['imagen_perfil'] = $path; // e.g. "avatars/abc123.jpg"
        }

        $usuario->update(array_filter($data, fn($v) => $v !== null));
        // Refrescar para devolver datos actualizados incluyendo imagen_perfil
        $usuario->refresh();
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
