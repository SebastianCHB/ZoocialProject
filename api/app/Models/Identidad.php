<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Identidad extends Model
{
    protected $table = 'identidad';
    protected $primaryKey = 'id_identidad';
    protected $fillable = [
        'id_usuario', 'tipo_documento', 'numero_documento', 
        'foto', 'foto_reverso', 'foto_persona', 'estado_verificacion'
    ];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario', 'id_usuario');
    }
}
