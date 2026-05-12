<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * FIX_NOTA_COLUMN - Ampliar nota de varchar(30) a text para soportar notas largas.
     * También asegurar que fecha_creacion sea nullable y estado_solicitud tenga default.
     * Esta migración es segura para ejecutar en producción (no borra datos).
     */
    public function up(): void
    {
        Schema::table('proceso_adopcion', function (Blueprint $table) {
            // NOTA_TEXT_FIX - Cambiar varchar(30) a text para notas sin límite arbitrario
            $table->text('nota')->nullable()->change();
            // ESTADO_DEFAULT - Agregar default 'pendiente' si no existe
            $table->string('estado_solicitud', 30)->default('pendiente')->change();
            // FECHA_NULLABLE - Permitir null en fecha_creacion (se setea en el controller)
            $table->date('fecha_creacion')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('proceso_adopcion', function (Blueprint $table) {
            $table->string('nota', 30)->nullable()->change();
            $table->string('estado_solicitud', 30)->change();
            $table->date('fecha_creacion')->change();
        });
    }
};
