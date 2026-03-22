<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use App\Models\Post;
use App\Models\Foto;

class FixImageUrls extends Command
{
    // signature
    protected $signature = 'images:fix-urls';

    // description
    protected $description = 'Migra rutas relativas de imágenes a URLs absolutas usando APP_URL';

    // handle
    public function handle()
    {
        // posts
        $posts = Post::whereNotNull('image_url')
            ->where('image_url', 'not like', 'http%')
            ->get();

        $this->info("Posts a migrar: {$posts->count()}");

        foreach ($posts as $post) {
            // strip storage/ prefix to get the disk-relative path
            $diskPath = preg_replace('#^storage/#', '', $post->image_url);
            $post->image_url = Storage::disk('public')->url($diskPath);
            $post->save();
        }

        // fotos
        $fotos = Foto::whereNotNull('archivo')
            ->where('archivo', 'not like', 'http%')
            ->get();

        $this->info("Fotos a migrar: {$fotos->count()}");

        foreach ($fotos as $foto) {
            $diskPath = preg_replace('#^storage/#', '', $foto->archivo);
            $foto->archivo = Storage::disk('public')->url($diskPath);
            $foto->save();
        }

        $this->info(' Migración completada.');
    }
}
