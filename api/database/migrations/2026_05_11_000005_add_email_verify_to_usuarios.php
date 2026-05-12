<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * ADD_EMAIL_FIELDS - Agrega email_verified_at para verificación soft de cuenta.
     * remember_token ya existe en la tabla users por defecto de Laravel, pero en
     * nuestra tabla personalizada 'usuarios' no está.
     */
    public function up(): void
    {
        Schema::table('usuarios', function (Blueprint $table) {
            // VERIFY_TOKEN - Token para verificación de email (SHA-256 de 64 chars)
            $table->string('email_verify_token', 100)->nullable()->after('correo_e');
            // VERIFIED_AT - Timestamp de verificación de cuenta
            $table->timestamp('email_verified_at')->nullable()->after('email_verify_token');
        });
    }

    public function down(): void
    {
        Schema::table('usuarios', function (Blueprint $table) {
            $table->dropColumn(['email_verify_token', 'email_verified_at']);
        });
    }
};
