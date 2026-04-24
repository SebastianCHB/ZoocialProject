<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Streak extends Model
{
    protected $table = 'streaks';
    protected $fillable = ['id_usuario', 'current_streak', 'max_streak', 'last_interaction_date'];

    protected $casts = [
        'last_interaction_date' => 'date',
        'current_streak' => 'integer',
        'max_streak' => 'integer',
    ];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario', 'id_usuario');
    }
}
