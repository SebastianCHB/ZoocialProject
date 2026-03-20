<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('usuarios')->insert([
    [
        'id_usuario' => 1,
        'nombre_completo' => 'Admin General',
        'correo_e' => 'admin@adopcion.com',
        'password' => bcrypt('123456'),
        'telefono' => '8112345678',
        'ciudad' => 'Monterrey',
        'fecha_registro' => now(),
        'rol' => 'admin',
        'edad' => 30
    ],
    [
        'id_usuario' => 2,
        'nombre_completo' => 'Juan Perez',
        'correo_e' => 'juan@gmail.com',
        'password' => bcrypt('123456'),
        'telefono' => '8123456789',
        'ciudad' => 'Monterrey',
        'fecha_registro' => now(),
        'rol' => 'normal',
        'edad' => 25
    ]
]);

    }
}
