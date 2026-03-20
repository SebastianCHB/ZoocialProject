<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
    
         
        $this->call(ClasificacionSeeder::class);
        $this->call(UsersSeeder::class);
        $this->call(ResponsableSeeder::class);
        $this->call(RazaSeeder::class);
        $this->call(AnimalitoSeeder::class);
        $this->call(FichaSaludSeeder::class);
        $this->call(FotoSeeder::class);
        $this->call(ProcesoAdopcionSeeder::class);
        $this->call(IdentidadSeeder::class);
        $this->call(PublicidadSeeder::class);
        $this->call(PostSeeder::class);
    }
}
