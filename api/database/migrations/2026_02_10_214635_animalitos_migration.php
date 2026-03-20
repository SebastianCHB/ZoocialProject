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
    Schema::create('animalitos', function (Blueprint $table) {
        $table->id('id_animalito');

        $table->foreignId('id_responsable')
              ->constrained('responsables', 'id_responsable')
              ->onDelete('cascade');

        $table->foreignId('id_raza')
              ->constrained('razas', 'id_raza')
              ->onDelete('cascade');

        $table->string('nombre', 30);
        $table->string('edad_estimado', 30);
        $table->string('genero', 30);
        $table->string('disponibilidad', 30);
        $table->date('fecha_ingreso');

        $table->timestamps();
    });
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('animalitos');
        
    }
};
