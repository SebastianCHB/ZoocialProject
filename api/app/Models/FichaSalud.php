<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FichaSalud extends Model
{
    protected $table = 'ficha_salud';
    protected $primaryKey = 'id_ficha';
    protected $fillable = [
        'id_animalito', 'esterilizado', 'vacunas', 
        'desparasitado', 'nota'
    ];

    public function animalito()
    {
        return $this->belongsTo(Animalito::class, 'id_animalito', 'id_animalito');
    }
}
