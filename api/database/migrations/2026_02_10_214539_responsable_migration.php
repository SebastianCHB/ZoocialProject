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
    Schema::create('responsables', function (Blueprint $table) {
        $table->id('id_responsable');

        $table->foreignId('id_usuario')
              ->constrained('usuarios', 'id_usuario')
              ->onDelete('cascade');

        $table->tinyInteger('tipo_responsable');
        $table->string('nombre_refugio', 30)->nullable();
        $table->string('direccion', 30)->nullable();

        $table->timestamps();
    });
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('responsables');
        
    }
};
