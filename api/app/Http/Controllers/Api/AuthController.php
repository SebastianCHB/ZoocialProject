<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Usuario;
use App\Models\Streak;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
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

        // PING STREAK on login
        $this->pingStreak($usuario->id_usuario);

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

    // Helper: ping streak on login
    private function pingStreak(int $userId): void
    {
        $today = Carbon::today();

        $streak = Streak::firstOrCreate(
            ['id_usuario' => $userId],
            [
                'current_streak' => 1,
                'max_streak' => 1,
                'last_interaction_date' => $today,
            ]
        );

        $lastDate = Carbon::parse($streak->last_interaction_date);

        if ($lastDate->isSameDay($today)) {
            return; // Already counted today
        }

        if ($lastDate->isSameDay($today->copy()->subDay())) {
            $streak->current_streak += 1;
        } else {
            $streak->current_streak = 1;
        }

        if ($streak->current_streak > $streak->max_streak) {
            $streak->max_streak = $streak->current_streak;
        }

        $streak->last_interaction_date = $today;
        $streak->save();
    }
}
