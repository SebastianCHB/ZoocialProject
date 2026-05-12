<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\PayPallController;

Route::get('/', function () {
    return view('welcome');
});
Route::get('/contacto', function () {
    return view('contacto');
});
Route::get('/admin', [AdminController::class, 'index']);

Route::get('/admin/users', [UsersController::class, 'index']);
Route::post('/admin/saveusers', [UsersController::class, 'store']);

Route::get('/payment/{amount}', [PayPallController::class, 'index']);
Route::post('/paypal/create-order', [PayPallController::class, 'createOrder']);
Route::post('/paypal/capture-order', [PayPallController::class, 'captureOrder']);

