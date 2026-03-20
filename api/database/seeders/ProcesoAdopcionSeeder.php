<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProcesoAdopcionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('proceso_adopcion')->insert([
    [
        'id_solicitud' => 1,
        'id_usuario' => 2,
        'id_animalito' => 1,
        'estado_solicitud' => 'Pendiente',
        'nota' => 'Quiero adoptar a Max',
        'fecha_creacion' => now()
    ]
]);

    }
}
