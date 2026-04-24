<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function record(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'paypal_order_id' => 'required|string|unique:payments,paypal_order_id',
            'amount' => 'required|numeric|min:0.01',
            'type' => 'required|in:purchase,donation',
            'description' => 'nullable|string|max:255',
        ]);

        $payment = Payment::create([
            'id_usuario' => $user->id_usuario,
            'paypal_order_id' => $request->paypal_order_id,
            'amount' => $request->amount,
            'type' => $request->type,
            'description' => $request->description,
            'status' => 'completed',
        ]);

        return response()->json($payment, 201);
    }

    /**
     * GET /payments/my-orders
     * Returns the current user's payment history
     */
    public function myOrders(Request $request)
    {
        $payments = Payment::where('id_usuario', $request->user()->id_usuario)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($payments);
    }
}
