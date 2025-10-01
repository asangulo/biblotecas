<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\BookController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\LoanController;
use App\Http\Controllers\StatisticsController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Rutas públicas (sin autenticación)
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

/*
|--------------------------------------------------------------------------
| LIBROS - CRUD Completo
|--------------------------------------------------------------------------
*/
Route::prefix('libros')->group(function () {
    Route::get('/', [BookController::class, 'index']); // GET /api/libros - Listado de libros con estadísticas
    Route::post('/', [BookController::class, 'store']); // POST /api/libros - Crear nuevo libro
    Route::get('/search', [BookController::class, 'search']); // GET /api/libros/search - Buscar libros
    Route::get('/disponibles', [BookController::class, 'disponibles']); // GET /api/libros/disponibles - Libros disponibles
    Route::get('/{id}', [BookController::class, 'show']); // GET /api/libros/{id} - Mostrar libro específico
    Route::put('/{id}', [BookController::class, 'update']); // PUT /api/libros/{id} - Actualizar libro
    Route::delete('/{id}', [BookController::class, 'destroy']); // DELETE /api/libros/{id} - Eliminar libro
});

/*
|--------------------------------------------------------------------------
| USUARIOS - CRUD Completo
|--------------------------------------------------------------------------
*/
Route::prefix('usuarios')->group(function () {
    Route::get('/', [UserController::class, 'index']); // GET /api/usuarios - Listado de usuarios
    Route::post('/', [UserController::class, 'store']); // POST /api/usuarios - Crear nuevo usuario
    Route::get('/search', [UserController::class, 'search']); // GET /api/usuarios/search - Buscar usuarios
    Route::get('/{id}', [UserController::class, 'show']); // GET /api/usuarios/{id} - Mostrar usuario específico
    Route::put('/{id}', [UserController::class, 'update']); // PUT /api/usuarios/{id} - Actualizar usuario
    Route::delete('/{id}', [UserController::class, 'destroy']); // DELETE /api/usuarios/{id} - Eliminar usuario
    Route::get('/{id}/prestamos', [UserController::class, 'loans']); // GET /api/usuarios/{id}/prestamos - Préstamos del usuario
});

/*
|--------------------------------------------------------------------------
| PRÉSTAMOS - Gestión de Préstamos y Devoluciones
|--------------------------------------------------------------------------
*/
Route::prefix('prestamos')->group(function () {
    Route::get('/', [LoanController::class, 'index']); // GET /api/prestamos - Listado de préstamos
    Route::post('/', [LoanController::class, 'store']); // POST /api/prestamos - Registrar nuevo préstamo
    Route::get('/vencidos', [LoanController::class, 'vencidos']); // GET /api/prestamos/vencidos - Préstamos vencidos
    Route::get('/{id}', [LoanController::class, 'show']); // GET /api/prestamos/{id} - Mostrar préstamo específico
    Route::put('/{id}', [LoanController::class, 'update']); // PUT /api/prestamos/{id} - Actualizar préstamo
    Route::put('/{id}/devolucion', [LoanController::class, 'devolucion']); // PUT /api/prestamos/{id}/devolucion - Registrar devolución
    Route::delete('/{id}', [LoanController::class, 'destroy']); // DELETE /api/prestamos/{id} - Eliminar préstamo
});

/*
|--------------------------------------------------------------------------
| ESTADÍSTICAS - Métricas y Reportes
|--------------------------------------------------------------------------
*/
Route::prefix('estadistica')->group(function () {
    Route::get('/viewlibros', [StatisticsController::class, 'viewlibros']); // GET /api/estadistica/viewlibros - Estadísticas generales
    Route::get('/periodo', [StatisticsController::class, 'periodo']); // GET /api/estadistica/periodo - Estadísticas por período
    Route::get('/metricas', [StatisticsController::class, 'metricas']); // GET /api/estadistica/metricas - Métricas específicas
});

/*
|--------------------------------------------------------------------------
| RUTAS ADICIONALES PARA FILTROS Y CONSULTAS
|--------------------------------------------------------------------------
*/

// Rutas con filtros para préstamos
Route::prefix('prestamos')->group(function () {
    Route::get('/activos', function (Request $request) {
        return app(LoanController::class)->index($request->merge(['estado' => 'prestado']));
    }); // GET /api/prestamos/activos - Préstamos activos
    
    Route::get('/pendientes', function (Request $request) {
        return app(LoanController::class)->index($request->merge(['estado' => 'pendiente']));
    }); // GET /api/prestamos/pendientes - Préstamos pendientes
    
});

Route::get('/health', function () {
    return response()->json([
        'status' => 'OK',
        'message' => 'Sistema de Biblioteca funcionando correctamente',
        'timestamp' => now(),
        'version' => '1.0.0'
    ]);
});

Route::get('/status', function () {
    try {
        // Verificar conexión a la base de datos
        DB::connection()->getPdo();
        
        return response()->json([
            'database' => 'Connected',
            'status' => 'Healthy',
            'timestamp' => now()
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'database' => 'Disconnected',
            'status' => 'Unhealthy',
            'error' => $e->getMessage(),
            'timestamp' => now()
        ], 503);
    }
});
