<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FichaSaludSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('ficha_salud')->insert([
    [
        'id_ficha' => 1,
        'id_animalito' => 1,
        'esterilizado' => 'Si',
        'vacunas' => 'Completas',
        'desparasitado' => 'Si',
        'nota' => 'Buen estado de salud'
    ]
]);

    }
}
