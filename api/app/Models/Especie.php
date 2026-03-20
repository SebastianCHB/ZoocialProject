<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Especie extends Model
{
    protected $table = 'especies';
    protected $primaryKey = 'id_especie';
    protected $fillable = ['nombre'];

    public function razas()
    {
        return $this->hasMany(Raza::class, 'id_especie', 'id_especie');
    }
}
