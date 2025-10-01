<?php

namespace App\Http\Controllers;

use App\Models\Loan;
use App\Models\LoanDetail;
use App\Models\Book;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;

class LoanController extends Controller
{
    /**
     * Obtener listado de préstamos
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Loan::with(['user', 'loanDetails.book']);

            // Filtrar por estado si se proporciona
            if ($request->has('estado')) {
                $query->where('estado', $request->get('estado'));
            }

            // Filtrar por usuario si se proporciona
            if ($request->has('user_id')) {
                $query->where('user_id', $request->get('user_id'));
            }

            // Filtrar préstamos vencidos
            if ($request->has('vencidos') && $request->get('vencidos')) {
                $query->overdue();
            }

            $loans = $query->orderBy('created_at', 'desc')->get();

            return response()->json([
                'success' => true,
                'data' => $loans
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener los préstamos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Registrar un nuevo préstamo
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'user_id' => 'required|exists:users,id',
                'fecha_prestamo' => 'required|date|after_or_equal:today',
                'fecha_devolucion' => 'required|date|after:fecha_prestamo',
                'valor' => 'required|numeric|min:0',
                'books' => 'required|array|min:1',
                'books.*.book_id' => 'required|exists:books,id',
                'books.*.cantidad' => 'required|integer|min:1'
            ]);

            DB::beginTransaction();

            // Verificar que todos los libros estén disponibles
            $bookIds = collect($request->books)->pluck('book_id');
            $books = Book::whereIn('id', $bookIds)->get()->keyBy('id');

            foreach ($request->books as $bookRequest) {
                $book = $books[$bookRequest['book_id']];
                $requestedQuantity = $bookRequest['cantidad'];

                if ($book->stock < $requestedQuantity) {
                    throw new \Exception("El libro '{$book->titulo}' no tiene suficiente stock. Disponible: {$book->stock}, Solicitado: {$requestedQuantity}");
                }

                if ($book->estado !== 'disponible') {
                    throw new \Exception("El libro '{$book->titulo}' no está disponible para préstamo");
                }
            }

            // Crear el préstamo
            $loan = Loan::create([
                'user_id' => $request->user_id,
                'fecha_prestamo' => $request->fecha_prestamo,
                'fecha_devolucion' => $request->fecha_devolucion,
                'valor' => $request->valor,
                'estado' => 'prestado'
            ]);

            // Crear los detalles del préstamo y actualizar stock
            foreach ($request->books as $bookRequest) {
                LoanDetail::create([
                    'loan_id' => $loan->id,
                    'book_id' => $bookRequest['book_id'],
                    'cantidad' => $bookRequest['cantidad']
                ]);

                // Actualizar stock del libro
                $book = $books[$bookRequest['book_id']];
                $newStock = $book->stock - $bookRequest['cantidad'];
                
                $book->update(['stock' => $newStock]);
                
                // Si el stock llega a 0, cambiar estado a prestado
                if ($newStock === 0) {
                    $book->update(['estado' => 'prestado']);
                }
            }

            DB::commit();

            // Cargar relaciones para la respuesta
            $loan->load(['user', 'loanDetails.book']);

            return response()->json([
                'success' => true,
                'message' => 'Préstamo registrado exitosamente',
                'data' => $loan
            ], 201);

        } catch (ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al registrar el préstamo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mostrar un préstamo específico
     */
    public function show(string $id): JsonResponse
    {
        try {
            $loan = Loan::with(['user', 'loanDetails.book'])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $loan
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Préstamo no encontrado'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener el préstamo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Registrar la devolución de un préstamo
     */
    public function devolucion(Request $request, string $id): JsonResponse
    {
        try {
            $loan = Loan::with(['loanDetails.book'])->findOrFail($id);

            if ($loan->estado === 'devolucion') {
                return response()->json([
                    'success' => false,
                    'message' => 'Este préstamo ya fue devuelto'
                ], 409);
            }

            DB::beginTransaction();

            // Actualizar estado del préstamo
            $loan->update(['estado' => 'devolucion']);

            // Actualizar stock de los libros
            foreach ($loan->loanDetails as $detail) {
                $book = $detail->book;
                $newStock = $book->stock + $detail->cantidad;
                
                $book->update([
                    'stock' => $newStock,
                    'estado' => 'disponible'
                ]);
            }

            DB::commit();

            // Cargar relaciones actualizadas
            $loan->load(['user', 'loanDetails.book']);

            return response()->json([
                'success' => true,
                'message' => 'Devolución registrada exitosamente',
                'data' => $loan
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Préstamo no encontrado'
            ], 404);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al registrar la devolución',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar un préstamo existente
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $loan = Loan::findOrFail($id);

            $request->validate([
                'fecha_prestamo' => 'sometimes|date',
                'fecha_devolucion' => 'sometimes|date|after:fecha_prestamo',
                'valor' => 'sometimes|numeric|min:0',
                'estado' => 'sometimes|in:pendiente,prestado,devolucion'
            ]);

            $loan->update($request->all());
            $loan->load(['user', 'loanDetails.book']);

            return response()->json([
                'success' => true,
                'message' => 'Préstamo actualizado exitosamente',
                'data' => $loan
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Préstamo no encontrado'
            ], 404);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el préstamo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar un préstamo (solo si no tiene devolución)
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $loan = Loan::findOrFail($id);

            if ($loan->estado === 'devolucion') {
                return response()->json([
                    'success' => false,
                    'message' => 'No se puede eliminar un préstamo que ya fue devuelto'
                ], 409);
            }

            DB::beginTransaction();

            // Restaurar stock de los libros
            foreach ($loan->loanDetails as $detail) {
                $book = $detail->book;
                $newStock = $book->stock + $detail->cantidad;
                
                $book->update([
                    'stock' => $newStock,
                    'estado' => 'disponible'
                ]);
            }

            $loan->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Préstamo eliminado exitosamente'
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Préstamo no encontrado'
            ], 404);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar el préstamo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener préstamos vencidos
     */
    public function vencidos(): JsonResponse
    {
        try {
            $loansVencidos = Loan::with(['user', 'loanDetails.book'])
                ->overdue()
                ->orderBy('fecha_devolucion', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $loansVencidos
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener los préstamos vencidos',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
