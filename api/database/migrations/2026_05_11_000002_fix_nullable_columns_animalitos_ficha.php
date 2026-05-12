<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * FIX_PRODUCTION_COLUMNS - Correcciones de columnas NOT NULL que causaban errores 500:
     *
     * animalitos:
     *   - fecha_ingreso: hacer nullable (el controller ahora la pone siempre, pero en producción
     *     puede haber registros viejos sin ella)
     *   - edad_estimado: hacer nullable para no romper si llega vacío
     *
     * ficha_salud:
     *   - vacunas: hacer nullable (no siempre se tienen)
     *   - nota: ampliar de varchar(30) a varchar(255)
     *   - esterilizado/desparasitado: ya son varchar(30), están bien
     *
     * Esta migración es SEGURA: no borra datos, solo relaja constraints.
     */
    public function up(): void
    {
        // FIX_ANIMALITOS
        Schema::table('animalitos', function (Blueprint $table) {
            $table->string('edad_estimado', 30)->nullable()->change();
            $table->date('fecha_ingreso')->nullable()->change();
        });

        // FIX_FICHA_SALUD
        Schema::table('ficha_salud', function (Blueprint $table) {
            $table->string('vacunas', 30)->nullable()->change();
            $table->string('nota', 255)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('animalitos', function (Blueprint $table) {
            $table->string('edad_estimado', 30)->nullable(false)->change();
            $table->date('fecha_ingreso')->nullable(false)->change();
        });

        Schema::table('ficha_salud', function (Blueprint $table) {
            $table->string('vacunas', 30)->nullable(false)->change();
            $table->string('nota', 30)->nullable()->change();
        });
    }
};
