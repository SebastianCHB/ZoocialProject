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
    Schema::create('fotos', function (Blueprint $table) {
        $table->id('id_foto');

        $table->foreignId('id_animalito')
              ->constrained('animalitos', 'id_animalito')
              ->onDelete('cascade');

        $table->integer('cantidad');
        $table->string('tipo', 30);
        $table->string('archivo', 100);

        $table->timestamps();
    });
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fotos');
        
    }
};
