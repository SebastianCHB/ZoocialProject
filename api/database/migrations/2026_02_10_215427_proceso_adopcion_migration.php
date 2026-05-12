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

        // ESTADO_FIELD - Estado de la solicitud de adopción
        $table->string('estado_solicitud', 30)->default('pendiente');
        // NOTA_FIELD_FIX - Ampliado de varchar(30) a text para notas largas
        $table->text('nota')->nullable();
        // FECHA_CREACION - Fecha de la solicitud con default automático
        $table->date('fecha_creacion')->nullable();

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
