<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PublicidadSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('publicidad')->insert([
    [
        'id_publicidad' => 1,
        'archivo' => 'banner1.jpg',
        'duracion' => '30 dias',
        'texto' => 'Adopta y cambia una vida',
        'estado_pago' => 'Pagado'
    ]
]);

    }
}
