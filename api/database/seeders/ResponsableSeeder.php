<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ResponsableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('responsables')->insert([
    [
        'id_responsable' => 1,
        'id_usuario' => 2,
        'tipo_responsable' => 1,
        'nombre_refugio' => 'Huellitas Felices',
        'direccion' => 'Av. Siempre Viva 123'
    ]
]);

    }
}
