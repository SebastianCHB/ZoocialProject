<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\AdopcionStatusMail;
use App\Models\Message;
use App\Models\ProcesoAdopcion;
use App\Models\Animalito;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class ProcesoAdopcionController extends Controller
{
    // GET_ALL_PROCESOS_WITH_RELATIONS - Carga usuario y animalito para mostrar nombres en admin
    public function index()
    {
        $procesos = ProcesoAdopcion::with(['usuario', 'animalito.fotos'])->get();
        return response()->json($procesos, 200);
    }

    // MIS_ADOPCIONES - Solicitudes del usuario autenticado
    public function misAdopciones(Request $request)
    {
        $userId = $request->user()->id_usuario;
        // ORDERBY_SAFE - Usar created_at como fallback si fecha_creacion es null
        $procesos = ProcesoAdopcion::with(['animalito.fotos', 'animalito.raza.especie'])
            ->where('id_usuario', $userId)
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($procesos, 200);
    }

    // CREATE_PROCESO_ADOPCION - Validar anti-duplicados: no permitir dos solicitudes pendientes
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_usuario'       => 'required|integer|exists:usuarios,id_usuario',
            'id_animalito'     => 'required|integer|exists:animalitos,id_animalito',
            'estado_solicitud' => 'nullable|string|max:30',
            'estado'           => 'nullable|string|max:30',   // ALIAS_ESTADO
            'notas'            => 'nullable|string',
            'nota'             => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        // ANTI_DUPLICATE_CHECK - Bloquear si ya hay solicitud pendiente del mismo usuario/mascota
        $existing = ProcesoAdopcion::where('id_usuario', $request->id_usuario)
            ->where('id_animalito', $request->id_animalito)
            ->where('estado_solicitud', 'pendiente')
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'Ya tienes una solicitud pendiente para esta mascota.',
                'id_solicitud' => $existing->id_solicitud,
            ], 409);
        }

        // MASCOTA_DISPONIBLE_CHECK - Solo se puede solicitar mascotas disponibles
        $animalito = Animalito::find($request->id_animalito);
        if ($animalito && $animalito->disponibilidad !== 'disponible') {
            return response()->json([
                'message' => 'Esta mascota ya no está disponible para adopción.',
            ], 422);
        }

        // NOTA_SAFE - Tomar la nota del campo notas o nota, sin truncar (campo es text ahora)
        $notaRaw = $request->notas ?? $request->nota ?? null;

        $proceso = ProcesoAdopcion::create([
            'id_usuario'       => $request->id_usuario,
            'id_animalito'     => $request->id_animalito,
            // ESTADO_FIELD_RESOLVE - aceptar alias 'estado' o 'estado_solicitud'
            'estado_solicitud' => $request->estado ?? $request->estado_solicitud ?? 'pendiente',
            'nota'             => $notaRaw,
            'fecha_creacion'   => now()->toDateString(),
        ]);

        return response()->json($proceso->load(['animalito.fotos', 'usuario']), 201);
    }


    // GET_PROCESO_DETAIL
    public function show($id)
    {
        $proceso = ProcesoAdopcion::with(['usuario', 'animalito.fotos'])->find($id);
        if (!$proceso) {
            return response()->json(['message' => 'Proceso de adopción no encontrado'], 404);
        }
        return response()->json($proceso, 200);
    }

    // UPDATE_PROCESO_ESTADO - Admin aprueba/rechaza. Acepta alias 'estado' o 'estado_solicitud'
    public function update(Request $request, $id)
    {
        $proceso = ProcesoAdopcion::find($id);
        if (!$proceso) {
            return response()->json(['message' => 'Proceso de adopción no encontrado'], 404);
        }

        $validator = Validator::make($request->all(), [
            'id_usuario'       => 'sometimes|integer|exists:usuarios,id_usuario',
            'id_animalito'     => 'sometimes|integer|exists:animalitos,id_animalito',
            'estado_solicitud' => 'sometimes|string|in:pendiente,aprobado,rechazado',
            'estado'           => 'sometimes|string|in:pendiente,aprobado,rechazado',
            'nota'             => 'nullable|string',
            'fecha_creacion'   => 'sometimes|date',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        // ESTADO_FIELD_NORMALIZE - si el frontend envía 'estado', mapearlo a 'estado_solicitud'
        $nuevoEstado = $request->estado_solicitud ?? $request->estado ?? null;
        if ($nuevoEstado) {
            $proceso->estado_solicitud = $nuevoEstado;

            // ADOPCION_COMPLETADA - Si aprobado, marcar animalito como 'en_proceso'
            if ($nuevoEstado === 'aprobado') {
                Animalito::where('id_animalito', $proceso->id_animalito)
                    ->update(['disponibilidad' => 'en_proceso']);
            }
            // ADOPCION_REVERTIDA - Si rechazado o pendiente, liberar animalito
            if (in_array($nuevoEstado, ['rechazado', 'pendiente'])) {
                Animalito::where('id_animalito', $proceso->id_animalito)
                    ->update(['disponibilidad' => 'disponible']);
            }
        }

        if ($request->has('nota')) {
            $proceso->nota = $request->nota;
        }

        $proceso->save();
        $proceso->load(['usuario', 'animalito']);

        // NOTIFY_USER - Si el estado cambió, enviar mensaje interno + email al solicitante
        if ($nuevoEstado && in_array($nuevoEstado, ['aprobado', 'rechazado'])) {
            $this->notificarUsuario($proceso, $nuevoEstado);
        }

        return response()->json($proceso, 200);
    }

    // NOTIFY_USER_HELPER - Envía mensaje interno y correo al usuario
    private function notificarUsuario(ProcesoAdopcion $proceso, string $estado): void
    {
        $usuario   = $proceso->usuario;
        $mascota   = $proceso->animalito;
        if (!$usuario) return;

        $emoji     = $estado === 'aprobado' ? '✅' : '❌';
        $label     = $estado === 'aprobado' ? 'aprobada' : 'rechazada';
        $nombreMascota = $mascota?->nombre ?? 'la mascota';
        $msgTexto  = "{$emoji} Tu solicitud de adopción para *{$nombreMascota}* fue {$label}.";
        if ($proceso->nota) {
            $msgTexto .= " Nota: {$proceso->nota}";
        }

        // INTERNAL_MESSAGE - Enviar desde el primer admin disponible
        $admin = Usuario::where('rol', 'admin')->first();
        if ($admin && $admin->id_usuario !== $usuario->id_usuario) {
            try {
                Message::create([
                    'sender_id'   => $admin->id_usuario,
                    'receiver_id' => $usuario->id_usuario,
                    'message'     => $msgTexto,
                    'read_at'     => null,
                ]);
            } catch (\Exception $e) {
                // Silenciar error de mensaje para no bloquear la respuesta
            }
        }

        // EMAIL_NOTIFICATION - Enviar correo al usuario
        try {
            Mail::to($usuario->correo_e)->send(
                new AdopcionStatusMail($usuario->nombre_completo, $nombreMascota, $estado, $proceso->nota)
            );
        } catch (\Exception $e) {
            // Silenciar error de correo para no bloquear la respuesta
        }
    }

    // DELETE_PROCESO
    public function destroy($id)
    {
        $proceso = ProcesoAdopcion::find($id);
        if (!$proceso) {
            return response()->json(['message' => 'Proceso de adopci\u00f3n no encontrado'], 404);
        }

        $proceso->delete();
        return response()->json(['message' => 'Proceso de adopci\u00f3n eliminado'], 200);
    }
}
