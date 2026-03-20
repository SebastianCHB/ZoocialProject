<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    protected $fillable = ['id_usuario', 'content', 'image_url', 'likes'];
    
    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario', 'id_usuario');
    }

    public function comments()
    {
        return $this->hasMany(Comment::class, 'id_post')->orderBy('created_at', 'desc');
    }

    public function likesCount() // Changed from likes to avoid property conflict
    {
        return $this->hasMany(PostLike::class, 'id_post');
    }
}
