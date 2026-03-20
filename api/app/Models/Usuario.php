<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class Usuario extends Authenticatable
{
    use HasApiTokens;
    protected $table = 'usuarios';
    protected $primaryKey = 'id_usuario';
    protected $fillable = [
        'nombre_completo', 'correo_e', 'password', 'telefono', 'ciudad', 'fecha_registro', 'rol', 'edad'
    ];

    protected $hidden = ['password'];

    public function identidad()
    {
        return $this->hasOne(Identidad::class, 'id_usuario', 'id_usuario');
    }

    public function responsable()
    {
        return $this->hasOne(Responsable::class, 'id_usuario', 'id_usuario');
    }

    public function procesosAdopcion()
    {
        return $this->hasMany(ProcesoAdopcion::class, 'id_usuario', 'id_usuario');
    }

    public function validaciones()
    {
        return $this->hasMany(UserValidation::class, 'id_usuario', 'id_usuario');
    }

    public function sentMessages()
    {
        return $this->hasMany(Message::class, 'sender_id', 'id_usuario');
    }

    public function receivedMessages()
    {
        return $this->hasMany(Message::class, 'receiver_id', 'id_usuario');
    }
}
