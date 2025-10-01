<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Relación con los préstamos
     * Un usuario puede tener muchos préstamos
     */
    public function loans()
    {
        return $this->hasMany(Loan::class);
    }

    /**
     * Scope para usuarios con préstamos activos
     */
    public function scopeWithActiveLoans($query)
    {
        return $query->whereHas('loans', function ($q) {
            $q->active();
        });
    }

    /**
     * Scope para usuarios con préstamos vencidos
     */
    public function scopeWithOverdueLoans($query)
    {
        return $query->whereHas('loans', function ($q) {
            $q->overdue();
        });
    }
}
