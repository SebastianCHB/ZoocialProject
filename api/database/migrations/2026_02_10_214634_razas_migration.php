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
    Schema::create('razas', function (Blueprint $table) {
        $table->id('id_raza');
        $table->foreignId('id_especie')
              ->constrained('especies', 'id_especie')
              ->onDelete('cascade');
        $table->string('raza', 30);
        $table->timestamps();
    });
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('razas');
        
    }
};
