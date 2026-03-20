<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Responsable extends Model
{
    protected $table = 'responsables';
    protected $primaryKey = 'id_responsable';
    protected $fillable = ['id_usuario', 'tipo_responsable', 'nombre_refugio', 'direccion'];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario', 'id_usuario');
    }

    public function animalitos()
    {
        return $this->hasMany(Animalito::class, 'id_responsable', 'id_responsable');
    }
}
