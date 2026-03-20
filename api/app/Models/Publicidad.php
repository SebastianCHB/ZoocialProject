<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Publicidad extends Model
{
    protected $table = 'publicidad';
    protected $primaryKey = 'id_publicidad';
    protected $fillable = ['archivo', 'duracion', 'texto', 'estado_pago'];
}
