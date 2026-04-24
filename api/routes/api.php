<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\PetController;
use App\Http\Controllers\Api\AnimalitoController;
use App\Http\Controllers\Api\EspecieController;
use App\Http\Controllers\Api\RazaController;
use App\Http\Controllers\Api\ResponsableController;
use App\Http\Controllers\Api\FichaSaludController;
use App\Http\Controllers\Api\FotoController;
use App\Http\Controllers\Api\IdentidadController;
use App\Http\Controllers\Api\ProcesoAdopcionController;
use App\Http\Controllers\Api\PublicidadController;
use App\Http\Controllers\Api\UsersControllers;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ValidationController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\StreakController;
use App\Http\Controllers\Api\PaymentController;

// ============================================================
// PUBLIC ROUTES
// ============================================================
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [UsersControllers::class, 'store']);

// ============================================================
// AUTHENTICATED ROUTES
// ============================================================
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return clone $request->user()->load('validaciones');
    });

    // Identity Validations
    Route::post('/validations', [ValidationController::class, 'store']);
    Route::get('/validations/me', [ValidationController::class, 'show']);
    Route::get('/validations', [ValidationController::class, 'index']);      // Admin: list all
    Route::put('/validations/{id}', [ValidationController::class, 'update']); // Admin: approve/reject

    // Posts
    Route::get('/posts', [PostController::class, 'index']);
    Route::get('/posts/user', [PostController::class, 'userPosts']);
    Route::post('/posts', [PostController::class, 'store']);
    Route::delete('/posts/{id}', [PostController::class, 'destroy']);
    Route::post('/posts/{id}/like', [PostController::class, 'like']);

    // Comments
    Route::post('/posts/{id}/comments', [CommentController::class, 'store']);
    Route::delete('/comments/{id}', [CommentController::class, 'destroy']);

    // Messages / Chat
    Route::get('/messages/conversations', [MessageController::class, 'index']);
    Route::get('/messages/thread/{partnerId}', [MessageController::class, 'conversation']);
    Route::post('/messages/send', [MessageController::class, 'store']);

    // Gamification – Streaks
    Route::get('/streak/me', [StreakController::class, 'show']);
    Route::post('/streak/ping', [StreakController::class, 'ping']);

    // Payments (PayPal record)
    Route::post('/payments/record', [PaymentController::class, 'record']);
    Route::get('/payments/my-orders', [PaymentController::class, 'myOrders']);

    // Users (protected – admin context)
    Route::get('/usuarios', [UsersControllers::class, 'index']);
    Route::get('/usuarios/{id}', [UsersControllers::class, 'show']);
    Route::put('/usuarios/{id}', [UsersControllers::class, 'update']);
    Route::post('/usuarios/{id}', [UsersControllers::class, 'updateWithForm']); // For FormData _method PUT
    Route::delete('/usuarios/{id}', [UsersControllers::class, 'destroy']);
});

// ============================================================
// RESOURCE ROUTES (some need auth, some are public for listing)
// ============================================================
Route::apiResource('pets', PetController::class);
Route::apiResource('animalito', AnimalitoController::class);
Route::apiResource('especies', EspecieController::class);
Route::apiResource('razas', RazaController::class);
Route::apiResource('responsables', ResponsableController::class);
Route::apiResource('fichas-salud', FichaSaludController::class);
Route::apiResource('fotos', FotoController::class);
Route::apiResource('identidades', IdentidadController::class);
Route::apiResource('procesos-adopcion', ProcesoAdopcionController::class);
Route::apiResource('publicidad', PublicidadController::class);
