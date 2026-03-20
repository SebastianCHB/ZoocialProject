<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MessageController extends Controller
{
    // GET_USER_CONVERSATIONS
    public function index(Request $request)
    {
        $userId = $request->user()->id_usuario;

        // EXTRACT_CONVERSATION_MESSAGES
        $conversations = Message::where('sender_id', $userId)
            ->orWhere('receiver_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->groupBy(function ($message) use ($userId) {
                // MAP_PARTNER_INFO
                return $message->sender_id === $userId
                    ? $message->receiver_id
                    : $message->sender_id;
            })
            ->map(function ($messages, $partnerId) use ($userId) {
                $partner = Usuario::select('id_usuario', 'nombre_completo', 'rol')
                    ->find($partnerId);
                
                if (!$partner) return null;

                $latest = $messages->first();
                $unreadCount = $messages->where('receiver_id', $userId)
                    ->whereNull('read_at')
                    ->count();

                return [
                    'id_usuario' => $partner->id_usuario,
                    'nombre_completo' => $partner->nombre_completo,
                    'rol' => $partner->rol,
                    'last_message' => $latest->message,
                    'last_message_at' => $latest->created_at,
                    'unread_count' => $unreadCount,
                ];
            })
            ->filter()
            ->values();

        return response()->json($conversations, 200);
    }

    // GET_CONVERSATION_HISTORY
    public function conversation(Request $request, $partnerId)
    {
        $userId = $request->user()->id_usuario;

        $messages = Message::where(function ($q) use ($userId, $partnerId) {
                $q->where('sender_id', $userId)->where('receiver_id', $partnerId);
            })
            ->orWhere(function ($q) use ($userId, $partnerId) {
                $q->where('sender_id', $partnerId)->where('receiver_id', $userId);
            })
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function($msg) {
                return [
                    'id' => $msg->id,
                    'from_usuario' => $msg->sender_id,
                    'to_usuario' => $msg->receiver_id,
                    'content' => $msg->message,
                    'created_at' => $msg->created_at,
                ];
            });

        // MARK_MESSAGES_READ
        Message::where('sender_id', $partnerId)
            ->where('receiver_id', $userId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json($messages, 200);
    }

    // SEND_NEW_MESSAGE
    public function store(Request $request)
    {
        $request->validate([
            'to_usuario' => 'required|integer|exists:usuarios,id_usuario',
            'content' => 'required|string|max:2000',
        ]);

        $senderId = $request->user()->id_usuario;

        if ($senderId === (int)$request->to_usuario) {
            return response()->json(['message' => 'No puedes enviarte un mensaje a ti mismo.'], 400);
        }

        $msg = Message::create([
            'sender_id' => $senderId,
            'receiver_id' => $request->to_usuario,
            'message' => $request->content,
            'read_at' => null,
        ]);

        return response()->json([
            'id' => $msg->id,
            'from_usuario' => $msg->sender_id,
            'to_usuario' => $msg->receiver_id,
            'content' => $msg->message,
            'created_at' => $msg->created_at,
        ], 201);
    }
}
