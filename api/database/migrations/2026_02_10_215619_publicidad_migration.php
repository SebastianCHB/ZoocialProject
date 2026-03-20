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
    Schema::create('publicidad', function (Blueprint $table) {
        $table->id('id_publicidad');

        $table->string('archivo', 100);
        $table->string('duracion', 100);
        $table->string('texto', 100);
        $table->string('estado_pago', 100);

        $table->timestamps();
    });
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('publicidad');
        
    }
};
