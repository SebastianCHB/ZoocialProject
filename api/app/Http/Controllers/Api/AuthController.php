<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\ResetPasswordMail;
use App\Models\Usuario;
use App\Models\Streak;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
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
            'user'         => $usuario->load('validaciones'),
            'access_token' => $token,
            'token_type'   => 'Bearer',
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

    // FORGOT_PASSWORD - Genera token y envía email de recuperación
    public function forgotPassword(Request $request)
    {
        $request->validate(['correo_e' => 'required|email']);

        $usuario = Usuario::where('correo_e', $request->correo_e)->first();

        // SECURITY - Siempre devolver 200 para no revelar si el email existe
        if (!$usuario) {
            return response()->json(['message' => 'Si el correo existe, recibirás un enlace de recuperación.'], 200);
        }

        // GENERATE_RESET_TOKEN
        $token = Str::random(64);

        // UPSERT_TOKEN - Reemplazar token anterior si existe
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $usuario->correo_e],
            ['token' => Hash::make($token), 'created_at' => now()]
        );

        $frontendUrl = env('FRONTEND_URL', 'https://zooocial.alwaysdata.net');
        $resetUrl    = "{$frontendUrl}/#/reset-password?token={$token}&email=" . urlencode($usuario->correo_e);

        try {
            Mail::to($usuario->correo_e)->send(new ResetPasswordMail($usuario->nombre_completo, $resetUrl));
        } catch (\Exception $e) {
            return response()->json(['message' => 'No se pudo enviar el correo. Intenta más tarde.'], 500);
        }

        return response()->json(['message' => 'Si el correo existe, recibirás un enlace de recuperación.'], 200);
    }

    // RESET_PASSWORD - Valida token y actualiza contraseña
    public function resetPassword(Request $request)
    {
        $request->validate([
            'token'        => 'required|string',
            'correo_e'     => 'required|email',
            'password'     => 'required|string|min:6|confirmed',
        ]);

        $record = DB::table('password_reset_tokens')
            ->where('email', $request->correo_e)
            ->first();

        if (!$record) {
            return response()->json(['message' => 'Token inválido o expirado.'], 422);
        }

        // TOKEN_EXPIRY - 60 minutos
        if (Carbon::parse($record->created_at)->addMinutes(60)->isPast()) {
            DB::table('password_reset_tokens')->where('email', $request->correo_e)->delete();
            return response()->json(['message' => 'El enlace ha expirado. Solicita uno nuevo.'], 422);
        }

        if (!Hash::check($request->token, $record->token)) {
            return response()->json(['message' => 'Token inválido o expirado.'], 422);
        }

        $usuario = Usuario::where('correo_e', $request->correo_e)->first();
        if (!$usuario) {
            return response()->json(['message' => 'Usuario no encontrado.'], 404);
        }

        $usuario->password = Hash::make($request->password);
        $usuario->save();

        // INVALIDATE_TOKEN - Eliminar token usado
        DB::table('password_reset_tokens')->where('email', $request->correo_e)->delete();

        return response()->json(['message' => '¡Contraseña actualizada correctamente! Ya puedes iniciar sesión.'], 200);
    }

    // Helper: ping streak on login
    private function pingStreak(int $userId): void
    {
        $today = Carbon::today();

        $streak = Streak::firstOrCreate(
            ['id_usuario' => $userId],
            [
                'current_streak'        => 1,
                'max_streak'            => 1,
                'last_interaction_date' => $today,
            ]
        );

        $lastDate = Carbon::parse($streak->last_interaction_date);

        if ($lastDate->isSameDay($today)) {
            return;
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
