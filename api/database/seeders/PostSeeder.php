<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PostSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('posts')->insert([
            [
                'id_usuario' => 2, // Juan
                'content' => '¡Miren a mi hermoso Firulais jugando en el parque! 🐶❤️',
                'image_url' => '/perrowbp.webp',
                'likes' => 15,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id_usuario' => 2, 
                'content' => 'Mishi siempre encuentra el lugar más cómodo de la casa para dormir. 🐱💤',
                'image_url' => '/gatowbp.webp',
                'likes' => 32,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id_usuario' => 1, // Admin
                'content' => 'Demos la bienvenida a Hamtaro al refugio, ¡esperando una familia! 🐹✨',
                'image_url' => '/hamsterwbp.webp',
                'likes' => 45,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);
    }
}
