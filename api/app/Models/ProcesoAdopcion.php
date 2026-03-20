<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProcesoAdopcion extends Model
{
    protected $table = 'proceso_adopcion';
    protected $primaryKey = 'id_solicitud';
    protected $fillable = ['id_usuario', 'id_animalito', 'estado_solicitud', 'nota', 'fecha_creacion'];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario', 'id_usuario');
    }

    public function animalito()
    {
        return $this->belongsTo(Animalito::class, 'id_animalito', 'id_animalito');
    }
}
