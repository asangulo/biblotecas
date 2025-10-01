<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Rutas del sistema de biblioteca
    Route::get('books', function () {
        return Inertia::render('books/index');
    })->name('books.index');

    Route::get('users', function () {
        return Inertia::render('users/index');
    })->name('users.index');

    Route::get('loans', function () {
        return Inertia::render('loans/index');
    })->name('loans.index');

    Route::get('statistics', function () {
        return Inertia::render('statistics/index');
    })->name('statistics.index');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
