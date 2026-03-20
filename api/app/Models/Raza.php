<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Raza extends Model
{
    protected $table = 'razas';
    protected $primaryKey = 'id_raza';
    protected $fillable = ['id_especie', 'raza'];

    public function especie()
    {
        return $this->belongsTo(Especie::class, 'id_especie', 'id_especie');
    }

    public function animalitos()
    {
        return $this->hasMany(Animalito::class, 'id_raza', 'id_raza');
    }
}