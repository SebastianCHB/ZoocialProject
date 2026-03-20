<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class IdentidadSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('identidad')->insert([
    [
        'id_identidad' => 1,
        'id_usuario' => 2,
        'tipo_documento' => 'INE',
        'numero_documento' => '1234567890',
        'foto' => 'ine_frente.jpg',
        'foto_reverso' => 'ine_reverso.jpg',
        'foto_persona' => 'selfie.jpg',
        'estado_verificacion' => 'Pendiente'
    ]
]);

    }
}
