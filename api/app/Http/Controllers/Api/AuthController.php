<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    // AUTH_LOGIN
    public function login(Request $request)
    {
        $request->validate([
            'correo_e' => 'required|email',
            'password' => 'required',
        ]);

        $usuario = Usuario::where('correo_e', $request->correo_e)->first();

        if (!$usuario || !Hash::check($request->password, $usuario->password)) {
            throw ValidationException::withMessages([
                'correo_e' => ['Las credenciales proporcionadas son incorrectas.'],
            ]);
        }

        // GENERATE_TOKEN
        $token = $usuario->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $usuario->load('validaciones'),
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    // AUTH_LOGOUT
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Sesión cerrada exitosamente'
        ]);
    }
}
