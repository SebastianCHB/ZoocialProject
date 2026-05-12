<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProcesoAdopcion extends Model
{
    protected $table = 'proceso_adopcion';
    protected $primaryKey = 'id_solicitud';
    // TIMESTAMPS_ENABLED - La migración tiene ->timestamps(), así que Laravel los gestiona
    public $timestamps = true;
    protected $fillable = ['id_usuario', 'id_animalito', 'estado_solicitud', 'nota', 'fecha_creacion'];

    protected $casts = [
        'fecha_creacion' => 'date:Y-m-d',
    ];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario', 'id_usuario');
    }

    public function animalito()
    {
        return $this->belongsTo(Animalito::class, 'id_animalito', 'id_animalito');
    }
}
