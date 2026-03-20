<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserValidation extends Model
{
    protected $table = 'user_validations';

    protected $fillable = [
        'id_usuario',
        'documento_tipo',
        'documento_url',
        'estado',
    ];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario', 'id_usuario');
    }
}
