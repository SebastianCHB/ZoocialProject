<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('streaks', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_usuario');
            $table->integer('current_streak')->default(1);
            $table->integer('max_streak')->default(1);
            $table->date('last_interaction_date');
            $table->timestamps();

            $table->foreign('id_usuario')->references('id_usuario')->on('usuarios')->onDelete('cascade');
            $table->unique('id_usuario');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('streaks');
    }
};
