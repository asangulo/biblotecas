<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    use HasFactory;

    protected $fillable = [
        'titulo',
        'autores',
        'generos',
        'editorial',
        'stock',
        'estado'
    ];

    protected $casts = [
        'stock' => 'integer',
    ];

    /**
     * Relación con los detalles de préstamo
     * Un libro puede estar en muchos detalles de préstamo
     */
    public function loanDetails()
    {
        return $this->hasMany(LoanDetail::class);
    }

    /**
     * Relación con los préstamos a través de loan_details
     * Un libro puede estar en muchos préstamos
     */
    public function loans()
    {
        return $this->hasManyThrough(Loan::class, LoanDetail::class, 'book_id', 'id', 'id', 'loan_id');
    }

    /**
     * Scope para libros disponibles
     */
    public function scopeAvailable($query)
    {
        return $query->where('estado', 'disponible')->where('stock', '>', 0);
    }

    /**
     * Scope para libros por género
     */
    public function scopeByGenre($query, $genero)
    {
        return $query->where('generos', 'like', '%' . $genero . '%');
    }
}
