<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Loan;
use App\Models\LoanDetail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class StatisticsController extends Controller
{
    /**
     * Obtener estadísticas generales de la biblioteca
     */
    public function viewlibros(): JsonResponse
    {
        try {
            // Estadísticas de libros
            $totalLibros = Book::count();
            $librosDisponibles = Book::where('estado', 'disponible')->sum('stock');
            $totalStock = Book::sum('stock');
            $librosPrestados = Book::where('estado', 'prestado')->sum('stock');
            $librosMantenimiento = Book::where('estado', 'mantenimiento')->count();
            $librosPerdidos = Book::where('estado', 'perdido')->count();

            // Estadísticas de préstamos
            $totalPrestamos = Loan::count();
            $prestamosActivos = Loan::active()->count();
            $prestamosVencidos = Loan::overdue()->count();
            $prestamosDevueltos = Loan::where('estado', 'devolucion')->count();

            // Estadísticas de usuarios
            $totalUsuarios = User::count();
            $usuariosConPrestamos = User::withActiveLoans()->count();
            $usuariosConPrestamosVencidos = User::withOverdueLoans()->count();

            // Proporción de libros devueltos con retraso
            $prestamosConRetraso = Loan::where('estado', 'devolucion')
                ->where('fecha_devolucion', '<', DB::raw('date(updated_at)'))
                ->count();
            
            $proporcionRetraso = $prestamosDevueltos > 0 
                ? round(($prestamosConRetraso / $prestamosDevueltos) * 100, 2) 
                : 0;

            // Top 5 libros más prestados
            $librosMasPrestados = Book::select('books.*')
                ->join('loan_details', 'books.id', '=', 'loan_details.book_id')
                ->selectRaw('books.*, SUM(loan_details.cantidad) as total_prestado')
                ->groupBy('books.id')
                ->orderBy('total_prestado', 'desc')
                ->limit(5)
                ->get();

            // Géneros más populares
            $generosPopulares = Book::select('generos')
                ->join('loan_details', 'books.id', '=', 'loan_details.book_id')
                ->selectRaw('generos, SUM(loan_details.cantidad) as total_prestado')
                ->groupBy('generos')
                ->orderBy('total_prestado', 'desc')
                ->limit(10)
                ->get();

            // Usuarios más activos (con más préstamos)
            $usuariosMasActivos = User::select('users.*')
                ->join('loans', 'users.id', '=', 'loans.user_id')
                ->selectRaw('users.*, COUNT(loans.id) as total_prestamos')
                ->groupBy('users.id')
                ->orderBy('total_prestamos', 'desc')
                ->limit(5)
                ->get();

            // Estadísticas por mes (últimos 6 meses)
            $estadisticasPorMes = Loan::selectRaw('
                strftime("%Y-%m", fecha_prestamo) as mes,
                COUNT(*) as total_prestamos,
                SUM(valor) as valor_total
            ')
            ->where('fecha_prestamo', '>=', now()->subMonths(6))
            ->groupBy('mes')
            ->orderBy('mes')
            ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'libros' => [
                        'total_libros' => $totalLibros,
                        'libros_disponibles' => $librosDisponibles,
                        'total_stock' => $totalStock,
                        'libros_prestados' => $librosPrestados,
                        'libros_mantenimiento' => $librosMantenimiento,
                        'libros_perdidos' => $librosPerdidos
                    ],
                    'prestamos' => [
                        'total_prestamos' => $totalPrestamos,
                        'prestamos_activos' => $prestamosActivos,
                        'prestamos_vencidos' => $prestamosVencidos,
                        'prestamos_devueltos' => $prestamosDevueltos,
                        'proporcion_retraso' => $proporcionRetraso . '%'
                    ],
                    'usuarios' => [
                        'total_usuarios' => $totalUsuarios,
                        'usuarios_con_prestamos' => $usuariosConPrestamos,
                        'usuarios_con_prestamos_vencidos' => $usuariosConPrestamosVencidos
                    ],
                    'ranking' => [
                        'libros_mas_prestados' => $librosMasPrestados,
                        'generos_populares' => $generosPopulares,
                        'usuarios_mas_activos' => $usuariosMasActivos
                    ],
                    'tendencias' => [
                        'estadisticas_por_mes' => $estadisticasPorMes
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener las estadísticas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener estadísticas de un período específico
     */
    public function periodo(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'fecha_inicio' => 'required|date',
                'fecha_fin' => 'required|date|after_or_equal:fecha_inicio'
            ]);

            $fechaInicio = $request->fecha_inicio;
            $fechaFin = $request->fecha_fin;

            // Préstamos en el período
            $prestamosPeriodo = Loan::whereBetween('fecha_prestamo', [$fechaInicio, $fechaFin])->count();
            $devolucionesPeriodo = Loan::whereBetween('updated_at', [$fechaInicio, $fechaFin])
                ->where('estado', 'devolucion')
                ->count();

            // Libros más prestados en el período
            $librosMasPrestadosPeriodo = Book::select('books.*')
                ->join('loan_details', 'books.id', '=', 'loan_details.book_id')
                ->join('loans', 'loan_details.loan_id', '=', 'loans.id')
                ->whereBetween('loans.fecha_prestamo', [$fechaInicio, $fechaFin])
                ->selectRaw('books.*, SUM(loan_details.cantidad) as total_prestado')
                ->groupBy('books.id')
                ->orderBy('total_prestado', 'desc')
                ->limit(5)
                ->get();

            // Géneros más populares en el período
            $generosPopularesPeriodo = Book::select('generos')
                ->join('loan_details', 'books.id', '=', 'loan_details.book_id')
                ->join('loans', 'loan_details.loan_id', '=', 'loans.id')
                ->whereBetween('loans.fecha_prestamo', [$fechaInicio, $fechaFin])
                ->selectRaw('generos, SUM(loan_details.cantidad) as total_prestado')
                ->groupBy('generos')
                ->orderBy('total_prestado', 'desc')
                ->get();

            // Usuarios más activos en el período
            $usuariosActivosPeriodo = User::select('users.*')
                ->join('loans', 'users.id', '=', 'loans.user_id')
                ->whereBetween('loans.fecha_prestamo', [$fechaInicio, $fechaFin])
                ->selectRaw('users.*, COUNT(loans.id) as total_prestamos')
                ->groupBy('users.id')
                ->orderBy('total_prestamos', 'desc')
                ->limit(5)
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'periodo' => [
                        'fecha_inicio' => $fechaInicio,
                        'fecha_fin' => $fechaFin
                    ],
                    'resumen' => [
                        'prestamos_en_periodo' => $prestamosPeriodo,
                        'devoluciones_en_periodo' => $devolucionesPeriodo
                    ],
                    'ranking_periodo' => [
                        'libros_mas_prestados' => $librosMasPrestadosPeriodo,
                        'generos_populares' => $generosPopularesPeriodo,
                        'usuarios_mas_activos' => $usuariosActivosPeriodo
                    ]
                ]
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener las estadísticas del período',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener métricas específicas
     */
    public function metricas(Request $request): JsonResponse
    {
        try {
            $metricas = [];

            if ($request->has('proporcion_retraso')) {
                $prestamosConRetraso = Loan::where('estado', 'devolucion')
                    ->where('fecha_devolucion', '<', DB::raw('DATE(updated_at)'))
                    ->count();
                
                $prestamosDevueltos = Loan::where('estado', 'devolucion')->count();
                
                $metricas['proporcion_retraso'] = $prestamosDevueltos > 0 
                    ? round(($prestamosConRetraso / $prestamosDevueltos) * 100, 2) 
                    : 0;
            }

            if ($request->has('libros_populares')) {
                $metricas['libros_populares'] = Book::select('books.*')
                    ->join('loan_details', 'books.id', '=', 'loan_details.book_id')
                    ->selectRaw('books.*, SUM(loan_details.cantidad) as total_prestado')
                    ->groupBy('books.id')
                    ->orderBy('total_prestado', 'desc')
                    ->limit($request->get('libros_populares', 5))
                    ->get();
            }

            if ($request->has('generos_populares')) {
                $metricas['generos_populares'] = Book::select('generos')
                    ->join('loan_details', 'books.id', '=', 'loan_details.book_id')
                    ->selectRaw('generos, SUM(loan_details.cantidad) as total_prestado')
                    ->groupBy('generos')
                    ->orderBy('total_prestado', 'desc')
                    ->get();
            }

            if ($request->has('usuarios_activos')) {
                $metricas['usuarios_activos'] = User::select('users.*')
                    ->join('loans', 'users.id', '=', 'loans.user_id')
                    ->selectRaw('users.*, COUNT(loans.id) as total_prestamos')
                    ->groupBy('users.id')
                    ->orderBy('total_prestamos', 'desc')
                    ->limit($request->get('usuarios_activos', 5))
                    ->get();
            }

            return response()->json([
                'success' => true,
                'data' => $metricas
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener las métricas',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
