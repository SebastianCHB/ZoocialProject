<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('ficha_salud', function (Blueprint $table) {
        $table->id('id_ficha');

        $table->foreignId('id_animalito')
              ->constrained('animalitos', 'id_animalito')
              ->onDelete('cascade');

        $table->string('esterilizado', 30);
        $table->string('vacunas', 30);
        $table->string('desparasitado', 30);
        $table->string('nota', 30)->nullable();

        $table->timestamps();
    });
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ficha_salud');
        
    }
};
