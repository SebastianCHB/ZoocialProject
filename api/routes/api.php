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

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return clone $request->user()->load('validaciones');
    });
    
    // User Identity Validations
    Route::post('/validations', [ValidationController::class, 'store']);
    Route::get('/validations/me', [ValidationController::class, 'show']);
    Route::get('/validations', [ValidationController::class, 'index']); // Admin route
    Route::put('/validations/{id}', [ValidationController::class, 'update']); // Admin approval
    
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
});

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
Route::apiResource('usuarios', UsersControllers::class);

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
