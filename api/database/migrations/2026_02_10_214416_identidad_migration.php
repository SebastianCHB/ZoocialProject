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
    Schema::create('identidad', function (Blueprint $table) {
        $table->id('id_identidad');

        $table->foreignId('id_usuario')
              ->constrained('usuarios', 'id_usuario')
              ->onDelete('cascade');

        $table->string('tipo_documento', 30);
        $table->string('numero_documento', 30);
        $table->string('foto', 100);
        $table->string('foto_reverso', 100);
        $table->string('foto_persona', 100);
        $table->string('estado_verificacion', 30);

        $table->timestamps();
    });
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('identidad');
        
    }
};
