<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\PayPallController;

Route::get('/', function () {
    return view('welcome');
});
/*
Route::get('/payment/{amount}', [PaymentController::class, 'index']);
*/

Route::get('/payment/{amount}', [PayPallController::class, 'index']);
Route::post('/paypal/create-order', [PayPallController::class, 'createOrder']);
Route::post('/paypal/capture-order', [PayPallController::class, 'captureOrder']);

/* Route::post('/paypal/create-order',  [PaymentController::class, 'createOrder']);
Route::post('/paypal/capture-order', [PaymentController::class, 'captureOrder']);*/


Route::get('/paypal/success', function () {
    return view('paypal.success');
})->name('paypal.success');

Route::get('/paypal/cancel', function () {
    return view('paypal.cancel');
})->name('paypal.cancel');
