<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ClasificacionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
         DB::table('especies')->insert([
    [
        'id_especie' => 1,
        'nombre' => 'Perro'
    ],
    [
        'id_especie' => 2,
        'nombre' => 'Gato'
    ]
]);
    }
}
