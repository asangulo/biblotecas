<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('books', function (Blueprint $table) {
            $table->id();
            $table->string('titulo');
            $table->string('autores'); // Cambiado de 'autor' a 'autores' según el MER
            $table->string('generos'); // Cambiado de 'genero' a 'generos' según el MER
            $table->string('editorial')->nullable();
            $table->integer('stock')->default(1); // Cambiado de 'cantidad_total' a 'stock' según el MER
            $table->enum('estado', ['disponible', 'prestado', 'mantenimiento', 'perdido'])->default('disponible');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('books');
    }
};
