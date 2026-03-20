<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $table = 'messages';

    protected $fillable = [
        'sender_id',
        'receiver_id',
        'message',
        'read_at',
    ];

    protected $casts = [
        'read_at' => 'datetime',
    ];

    public function sender()
    {
        return $this->belongsTo(Usuario::class, 'sender_id', 'id_usuario');
    }

    public function receiver()
    {
        return $this->belongsTo(Usuario::class, 'receiver_id', 'id_usuario');
    }
}
