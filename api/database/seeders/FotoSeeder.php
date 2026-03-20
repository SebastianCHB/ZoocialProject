<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FotoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('fotos')->insert([
            [
                'id_foto' => 1,
                'id_animalito' => 1, // Firulais
                'cantidad' => 1,
                'tipo' => 'principal',
                'archivo' => '/perrowbp.webp'
            ],
            [
                'id_foto' => 2,
                'id_animalito' => 2, // Mishi
                'cantidad' => 1,
                'tipo' => 'principal',
                'archivo' => '/gatowbp.webp'
            ],
            [
                'id_foto' => 3,
                'id_animalito' => 3, // Hamtaro
                'cantidad' => 1,
                'tipo' => 'principal',
                'archivo' => '/hamsterwbp.webp'
            ]
        ]);

    }
}
