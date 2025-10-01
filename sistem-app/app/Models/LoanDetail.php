<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LoanDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'loan_id',
        'book_id',
        'cantidad'
    ];

    protected $casts = [
        'cantidad' => 'integer',
    ];

    /**
     * Relación con el préstamo
     * Un detalle pertenece a un préstamo
     */
    public function loan()
    {
        return $this->belongsTo(Loan::class);
    }

    /**
     * Relación con el libro
     * Un detalle pertenece a un libro
     */
    public function book()
    {
        return $this->belongsTo(Book::class);
    }

    /**
     * Scope para detalles por préstamo
     */
    public function scopeByLoan($query, $loanId)
    {
        return $query->where('loan_id', $loanId);
    }

    /**
     * Scope para detalles por libro
     */
    public function scopeByBook($query, $bookId)
    {
        return $query->where('book_id', $bookId);
    }
}
