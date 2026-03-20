<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Animalito extends Model
{
    protected $table = 'animalitos';
    protected $primaryKey = 'id_animalito';
    protected $fillable = [
        'id_responsable', 'id_raza', 'nombre', 'edad_estimado', 
        'genero', 'disponibilidad', 'fecha_ingreso'
    ];

    public function raza()
    {
        return $this->belongsTo(Raza::class, 'id_raza', 'id_raza');
    }

    public function responsable()
    {
        return $this->belongsTo(Responsable::class, 'id_responsable', 'id_responsable');
    }

    public function fichaSalud()
    {
        return $this->hasOne(FichaSalud::class, 'id_animalito', 'id_animalito');
    }

    public function fotos()
    {
        return $this->hasMany(Foto::class, 'id_animalito', 'id_animalito');
    }

    public function procesosAdopcion()
    {
        return $this->hasMany(ProcesoAdopcion::class, 'id_animalito', 'id_animalito');
    }
}
