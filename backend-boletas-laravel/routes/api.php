<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\BoletaController;
use App\Http\Controllers\BoletaQrController;
use App\Http\Controllers\PersonaController;
use App\Http\Controllers\UsuarioController;

// ----------- Usuarios (auth y registro) -----------
Route::post('/usuarios/registro', [UsuarioController::class, 'registrar']);
Route::post('/usuarios/login', [UsuarioController::class, 'login']);
Route::put('/usuarios/{id}', [UsuarioController::class, 'actualizarUsuario']);
Route::put('/usuarios/{id}/contrasena', [UsuarioController::class, 'cambiarContrasena']);
Route::get('/usuarios/{id}', [UsuarioController::class, 'obtenerUsuario']);

// ----------- QR ----------
Route::get('/qr/{id}', [BoletaQrController::class, 'show']);

// ----------- Boletas (usuario) ----------
Route::post('/boletas', [BoletaController::class, 'subirBoletas']);
Route::get('/boletas', [BoletaController::class, 'listarBoletas']);
Route::get('/boletas/{personaId}', [BoletaController::class, 'listarBoletasPersona']);

// ----------- Personas (usuario) ----------
Route::get('/persona/{dni}', [PersonaController::class, 'obtenerPersonaDni']);

// ----------- ADMIN ----------
Route::prefix('admin')->group(function () {
    // BOLETAS
    Route::get('/boletas', [AdminController::class, 'listarBoletas']);
    Route::get('/boletas/persona/{personaId}', [AdminController::class, 'listarBoletasPorPersona']);
    Route::post('/boletas', [AdminController::class, 'subirBoletas']);
    Route::put('/boletas/{id}', [AdminController::class, 'editarBoleta']);
    Route::delete('/boletas/{id}', [AdminController::class, 'eliminarBoleta']);

    // PERSONAS
    Route::get('/personas', [AdminController::class, 'listarPersonas']);
    Route::post('/personas', [AdminController::class, 'crearPersona']);
    Route::put('/personas/{id}', [AdminController::class, 'editarPersona']);
    Route::delete('/personas/{id}', [AdminController::class, 'eliminarPersona']);

    // USUARIOS
    Route::get('/usuarios', [AdminController::class, 'listarUsuarios']);
    Route::put('/usuarios/{id}/estado', [AdminController::class, 'cambiarEstado']);
});