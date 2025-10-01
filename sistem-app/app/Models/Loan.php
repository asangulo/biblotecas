<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Loan extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'fecha_prestamo',
        'fecha_devolucion',
        'valor',
        'estado'
    ];

    protected $casts = [
        'fecha_prestamo' => 'date',
        'fecha_devolucion' => 'date',
        'valor' => 'integer',
    ];

    /**
     * Relación con el usuario
     * Un préstamo pertenece a un usuario
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relación con los detalles del préstamo
     * Un préstamo puede tener muchos detalles
     */
    public function loanDetails()
    {
        return $this->hasMany(LoanDetail::class);
    }

    /**
     * Relación con los libros a través de loan_details
     * Un préstamo puede tener muchos libros
     */
    public function books()
    {
        return $this->hasManyThrough(Book::class, LoanDetail::class, 'loan_id', 'id', 'id', 'book_id');
    }

    /**
     * Scope para préstamos activos
     */
    public function scopeActive($query)
    {
        return $query->whereIn('estado', ['pendiente', 'prestado']);
    }

    /**
     * Scope para préstamos vencidos
     */
    public function scopeOverdue($query)
    {
        return $query->where('fecha_devolucion', '<', now())->where('estado', 'prestado');
    }

    /**
     * Scope para préstamos por usuario
     */
    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }
}
