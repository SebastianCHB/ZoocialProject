<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AnimalitoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('animalitos')->insert([
            [
                'id_animalito' => 1,
                'id_responsable' => 1,
                'id_raza' => 1, // Assuming 1 is Dog
                'nombre' => 'Firulais',
                'edad_estimado' => '2',
                'genero' => 'macho',
                'disponibilidad' => 'disponible',
                'fecha_ingreso' => now()
            ],
            [
                'id_animalito' => 2,
                'id_responsable' => 1,
                'id_raza' => 2, // Assuming 2 is Cat
                'nombre' => 'Mishi',
                'edad_estimado' => '1',
                'genero' => 'hembra',
                'disponibilidad' => 'disponible',
                'fecha_ingreso' => now()
            ],
            [
                'id_animalito' => 3,
                'id_responsable' => 1,
                'id_raza' => 1, // Any valid id_raza
                'nombre' => 'Hamtaro',
                'edad_estimado' => '0.5',
                'genero' => 'macho',
                'disponibilidad' => 'disponible',
                'fecha_ingreso' => now()
            ]
        ]);

    }
}
