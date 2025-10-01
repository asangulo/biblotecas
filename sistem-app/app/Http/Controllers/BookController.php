<?php

namespace App\Http\Controllers;

use App\Models\Book;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class BookController extends Controller
{
    /**
     * Obtener listado de libros con disponibilidad y stock
     */
    public function index(): JsonResponse
    {
        try {
            $books = Book::select('id', 'titulo', 'autores', 'generos', 'editorial', 'stock', 'estado')
                ->orderBy('titulo')
                ->get();

            $totalBooks = Book::count();
            $availableBooks = Book::where('estado', 'disponible')->sum('stock');
            $totalStock = Book::sum('stock');

            return response()->json([
                'success' => true,
                'data' => [
                    'books' => $books,
                    'statistics' => [
                        'total_books' => $totalBooks,
                        'available_books' => $availableBooks,
                        'total_stock' => $totalStock
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener los libros',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crear un nuevo libro
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'titulo' => 'required|string|max:255',
                'autores' => 'required|string|max:255',
                'generos' => 'required|string|max:255',
                'editorial' => 'nullable|string|max:255',
                'stock' => 'required|integer|min:0',
                'estado' => 'required|in:disponible,prestado,mantenimiento,perdido'
            ]);

            $book = Book::create($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Libro creado exitosamente',
                'data' => $book
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear el libro',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mostrar un libro específico
     */
    public function show(string $id): JsonResponse
    {
        try {
            $book = Book::findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $book
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Libro no encontrado'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener el libro',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar un libro existente
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $book = Book::findOrFail($id);

            $request->validate([
                'titulo' => 'sometimes|string|max:255',
                'autores' => 'sometimes|string|max:255',
                'generos' => 'sometimes|string|max:255',
                'editorial' => 'nullable|string|max:255',
                'stock' => 'sometimes|integer|min:0',
                'estado' => 'sometimes|in:disponible,prestado,mantenimiento,perdido'
            ]);

            $book->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Libro actualizado exitosamente',
                'data' => $book
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Libro no encontrado'
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
                'message' => 'Error al actualizar el libro',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar un libro
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $book = Book::findOrFail($id);

            // Verificar si el libro tiene préstamos activos
            $activeLoans = $book->loanDetails()
                ->whereHas('loan', function ($query) {
                    $query->whereIn('estado', ['pendiente', 'prestado']);
                })
                ->exists();

            if ($activeLoans) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se puede eliminar el libro porque tiene préstamos activos'
                ], 409);
            }

            $book->delete();

            return response()->json([
                'success' => true,
                'message' => 'Libro eliminado exitosamente'
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Libro no encontrado'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar el libro',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Buscar libros por título, autor o género
     */
    public function search(Request $request): JsonResponse
    {
        try {
            $query = Book::query();

            if ($request->has('search')) {
                $searchTerm = $request->get('search');
                $query->where(function ($q) use ($searchTerm) {
                    $q->where('titulo', 'like', "%{$searchTerm}%")
                      ->orWhere('autores', 'like', "%{$searchTerm}%")
                      ->orWhere('generos', 'like', "%{$searchTerm}%");
                });
            }

            if ($request->has('genero')) {
                $query->byGenre($request->get('genero'));
            }

            if ($request->has('disponible') && $request->get('disponible')) {
                $query->available();
            }

            $books = $query->orderBy('titulo')->get();

            return response()->json([
                'success' => true,
                'data' => $books
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error en la búsqueda',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function disponibles()
    {
        $books = Book::where('estado', 'disponible')->where('stock', '>', 0)->get();
    
        return response()->json([
            'success' => true,
            'data' => $books
        ]);
    }
}
