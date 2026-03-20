<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RazaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
       DB::table('razas')->insert([
    [
        'id_raza' => 1,
        'id_especie' => 1,
        'raza' => 'Labrador'
    ],
    [
        'id_raza' => 2,
        'id_especie' => 1,
        'raza' => 'Pastor Alemán'
    ],
    [
        'id_raza' => 3,
        'id_especie' => 2,
        'raza' => 'Siames'
    ]
]);


    }
}
