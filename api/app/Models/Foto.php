<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Foto extends Model
{
    protected $table = 'fotos';
    protected $primaryKey = 'id_foto';
    protected $fillable = ['id_animalito', 'cantidad', 'tipo', 'archivo'];

    public function animalito()
    {
        return $this->belongsTo(Animalito::class, 'id_animalito', 'id_animalito');
    }
}
