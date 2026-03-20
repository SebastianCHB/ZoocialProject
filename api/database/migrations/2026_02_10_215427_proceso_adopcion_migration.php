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
    Schema::create('proceso_adopcion', function (Blueprint $table) {
        $table->id('id_solicitud');

        $table->foreignId('id_usuario')
              ->constrained('usuarios', 'id_usuario')
              ->onDelete('cascade');

        $table->foreignId('id_animalito')
              ->constrained('animalitos', 'id_animalito')
              ->onDelete('cascade');

        $table->string('estado_solicitud', 30);
        $table->string('nota', 30)->nullable();
        $table->date('fecha_creacion');

        $table->timestamps();
    });
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('proceso_adopcion');
        
    }
};
