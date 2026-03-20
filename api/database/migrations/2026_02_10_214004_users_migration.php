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
    Schema::create('usuarios', function (Blueprint $table) {
        $table->id('id_usuario');
        $table->string('nombre_completo', 30);
        $table->string('correo_e', 30)->unique();
        $table->string('password');
        $table->string('telefono', 30)->nullable();
        $table->string('ciudad', 30)->nullable();
        $table->date('fecha_registro');
        $table->timestamps();
    });
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('usuarios');
        
    }
};
