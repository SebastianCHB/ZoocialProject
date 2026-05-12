<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class MailTestController extends Controller
{
    /**
     * MAIL_TEST_ENDPOINT - Solo accesible en debug mode.
     * GET /api/mail-test?to=correo@gmail.com
     * Permite verificar si la config SMTP funciona correctamente en producción.
     */
    public function test(Request $request)
    {
        if (!config('app.debug')) {
            return response()->json(['message' => 'Not available'], 403);
        }

        $to = $request->query('to', config('mail.from.address'));

        try {
            Mail::raw('Correo de prueba desde Zoocial. Si recibes esto, el SMTP está funcionando correctamente.', function ($msg) use ($to) {
                $msg->to($to)->subject('Test SMTP - Zoocial');
            });

            return response()->json([
                'ok'     => true,
                'to'     => $to,
                'mailer' => config('mail.default'),
                'host'   => config('mail.mailers.smtp.host'),
                'port'   => config('mail.mailers.smtp.port'),
                'from'   => config('mail.from.address'),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'ok'    => false,
                'error' => $e->getMessage(),
                'host'  => config('mail.mailers.smtp.host'),
                'port'  => config('mail.mailers.smtp.port'),
            ], 500);
        }
    }
}
