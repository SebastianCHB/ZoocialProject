<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;
use Srmklive\PayPal\Services\PayPal as PayPalClient;

class PaymentController extends Controller
{
    private function getPayPalClient(): PayPalClient
    {
        $provider = new PayPalClient;
        $provider->setApiCredentials(config('paypal'));
        $token = $provider->getAccessToken();

        // Validar que el token sea válido (patrón del controller de referencia)
        if (isset($token['error']) || !isset($token['access_token'])) {
            throw new \Exception('No se pudo obtener el token de PayPal: ' . json_encode($token));
        }

        $provider->setAccessToken($token);
        return $provider;
    }

    public function index($amount)
    {
        $mode      = config('paypal.mode');
        $client_id = config("paypal.{$mode}.client_id");
        return view('paypal.payment', compact('amount', 'client_id'));
    }

    public function createOrder(Request $request)
    {
        try {
            $provider = $this->getPayPalClient();
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }

        $order = $provider->createOrder([
            'intent' => 'CAPTURE',
            'purchase_units' => [
                [
                    'amount' => [
                        'currency_code' => config('paypal.currency', 'MXN'),
                        'value'         => $request->amount,
                    ],
                ],
            ],
        ]);

        return response()->json($order);
    }
    public function captureOrder(Request $request)
    {
        try {
            $provider = $this->getPayPalClient();
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }

        $result = $provider->capturePaymentOrder($request->orderID);

        // Guardar en DB si el pago fue exitoso
        if (isset($result['status']) && $result['status'] === 'COMPLETED') {
            $capturedAmount = $result['purchase_units'][0]['payments']['captures'][0]['amount']['value']
                ?? $request->amount
                ?? 0;

            Payment::create([
                'id_usuario'      => $request->user()?->id_usuario ?? null,
                'paypal_order_id' => $result['id'],
                'amount'          => $capturedAmount,
                'type'            => $request->type ?? 'purchase',
                'description'     => $request->description ?? 'Zoocial - Pago',
                'status'          => 'completed',
            ]);
        }

        return response()->json($result);
    }

    public function createOrderApi(Request $request)
    {
        $request->validate([
            'amount'      => 'required|numeric|min:1',
            'description' => 'nullable|string|max:255',
            'type'        => 'required|in:purchase,donation',
        ]);

        try {
            $provider = $this->getPayPalClient();
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }

        $amount      = number_format((float) $request->amount, 2, '.', '');
        $description = $request->description ?? 'Zoocial - Pago';
        $currency    = config('paypal.currency', 'MXN');

        $response = $provider->createOrder([
            'intent' => 'CAPTURE',
            'purchase_units' => [
                [
                    'amount' => [
                        'currency_code' => $currency,
                        'value'         => $amount,
                    ],
                    'description' => $description,
                ],
            ],
        ]);

        if (isset($response['id'])) {
            return response()->json([
                'success'  => true,
                'order_id' => $response['id'],
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'No se pudo crear la orden en PayPal.',
            'details' => $response,
        ], 500);
    }
    public function captureOrderApi(Request $request)
    {
        $request->validate([
            'order_id'    => 'required|string',
            'type'        => 'required|in:purchase,donation',
            'description' => 'nullable|string|max:255',
        ]);

        try {
            $provider = $this->getPayPalClient();
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }

        $response = $provider->capturePaymentOrder($request->order_id);

        if (isset($response['status']) && $response['status'] === 'COMPLETED') {
            $capturedAmount = $response['purchase_units'][0]['payments']['captures'][0]['amount']['value']
                ?? 0;

            $payment = Payment::create([
                'id_usuario'      => $request->user()->id_usuario,
                'paypal_order_id' => $response['id'],
                'amount'          => $capturedAmount,
                'type'            => $request->type,
                'description'     => $request->description ?? 'Zoocial - Pago',
                'status'          => 'completed',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Pago completado exitosamente.',
                'payment' => $payment,
            ], 201);
        }

        return response()->json([
            'success' => false,
            'message' => 'El pago no pudo completarse.',
            'status'  => $response['status'] ?? 'UNKNOWN',
            'details' => $response,
        ], 422);
    }

    // ================================================================
    // POST /api/payments/record   (flujo legado — frontend JS SDK)
    // Registra un pago ya procesado por el frontend
    // ================================================================
    public function record(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'paypal_order_id' => 'required|string|unique:payments,paypal_order_id',
            'amount'          => 'required|numeric|min:0.01',
            'type'            => 'required|in:purchase,donation',
            'description'     => 'nullable|string|max:255',
        ]);

        $payment = Payment::create([
            'id_usuario'      => $user->id_usuario,
            'paypal_order_id' => $request->paypal_order_id,
            'amount'          => $request->amount,
            'type'            => $request->type,
            'description'     => $request->description,
            'status'          => 'completed',
        ]);

        return response()->json($payment, 201);
    }

    public function myOrders(Request $request)
    {
        $payments = Payment::where('id_usuario', $request->user()->id_usuario)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($payments);
    }
}
