# 📚 API Documentation - Sistema de Biblioteca

## 🚀 Información General

**Base URL**: `http://localhost:8000/api`

**Versión**: 1.0.0

**Formato de Respuesta**: JSON

---

## 📖 ENDPOINTS DE LIBROS

### `GET /api/libros`
Obtener listado de libros con disponibilidad y stock

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "books": [...],
    "statistics": {
      "total_books": 50,
      "available_books": 45,
      "total_stock": 150
    }
  }
}
```

### `POST /api/libros`
Crear un nuevo libro

**Body:**
```json
{
  "titulo": "El Quijote",
  "autores": "Miguel de Cervantes",
  "generos": "Novela",
  "editorial": "Editorial XYZ",
  "stock": 5,
  "estado": "disponible"
}
```

### `GET /api/libros/search`
Buscar libros por título, autor o género

**Query Parameters:**
- `search`: Término de búsqueda
- `genero`: Filtrar por género
- `disponible`: true/false

### `GET /api/libros/{id}`
Mostrar un libro específico

### `PUT /api/libros/{id}`
Actualizar un libro existente

### `DELETE /api/libros/{id}`
Eliminar un libro (solo si no tiene préstamos activos)

### `GET /api/libros/disponibles`
Obtener solo libros disponibles para préstamo

---

## 👥 ENDPOINTS DE USUARIOS

### `GET /api/usuarios`
Obtener listado de usuarios

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Juan Pérez",
      "email": "juan@email.com",
      "created_at": "2024-01-01T00:00:00.000000Z",
      "loans_count": 3
    }
  ]
}
```

### `POST /api/usuarios`
Crear un nuevo usuario

**Body:**
```json
{
  "name": "Juan Pérez",
  "email": "juan@email.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```

### `GET /api/usuarios/search`
Buscar usuarios por nombre o email

### `GET /api/usuarios/{id}`
Mostrar un usuario específico con sus préstamos

### `PUT /api/usuarios/{id}`
Actualizar un usuario existente

### `DELETE /api/usuarios/{id}`
Eliminar un usuario (solo si no tiene préstamos activos)

### `GET /api/usuarios/{id}/prestamos`
Obtener todos los préstamos de un usuario específico

---

## 📋 ENDPOINTS DE PRÉSTAMOS

### `GET /api/prestamos`
Obtener listado de préstamos

**Query Parameters:**
- `estado`: pendiente, prestado, devolucion
- `user_id`: ID del usuario
- `vencidos`: true/false

### `POST /api/prestamos`
Registrar un nuevo préstamo

**Body:**
```json
{
  "user_id": 1,
  "fecha_prestamo": "2024-01-01",
  "fecha_devolucion": "2024-01-15",
  "valor": 5000,
  "books": [
    {
      "book_id": 1,
      "cantidad": 2
    },
    {
      "book_id": 3,
      "cantidad": 1
    }
  ]
}
```

### `GET /api/prestamos/{id}`
Mostrar un préstamo específico

### `PUT /api/prestamos/{id}`
Actualizar un préstamo existente

### `PUT /api/prestamos/{id}/devolucion`
Registrar la devolución de un préstamo

**Respuesta:**
```json
{
  "success": true,
  "message": "Devolución registrada exitosamente",
  "data": {
    "id": 1,
    "estado": "devolucion",
    "user": {...},
    "loan_details": [...]
  }
}
```

### `DELETE /api/prestamos/{id}`
Eliminar un préstamo (solo si no fue devuelto)

### `GET /api/prestamos/vencidos`
Obtener préstamos vencidos

### `GET /api/prestamos/activos`
Obtener préstamos activos

### `GET /api/prestamos/pendientes`
Obtener préstamos pendientes

### `GET /api/prestamos/devueltos`
Obtener préstamos devueltos

---

## 📊 ENDPOINTS DE ESTADÍSTICAS

### `GET /api/estadistica/viewlibros`
Obtener estadísticas generales de la biblioteca

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "libros": {
      "total_libros": 50,
      "libros_disponibles": 45,
      "total_stock": 150,
      "libros_prestados": 5,
      "libros_mantenimiento": 0,
      "libros_perdidos": 0
    },
    "prestamos": {
      "total_prestamos": 100,
      "prestamos_activos": 15,
      "prestamos_vencidos": 3,
      "prestamos_devueltos": 85,
      "proporcion_retraso": "12.5%"
    },
    "usuarios": {
      "total_usuarios": 25,
      "usuarios_con_prestamos": 20,
      "usuarios_con_prestamos_vencidos": 2
    },
    "ranking": {
      "libros_mas_prestados": [...],
      "generos_populares": [...],
      "usuarios_mas_activos": [...]
    },
    "tendencias": {
      "estadisticas_por_mes": [...]
    }
  }
}
```

### `GET /api/estadistica/periodo`
Obtener estadísticas de un período específico

**Query Parameters:**
- `fecha_inicio`: Fecha de inicio (YYYY-MM-DD)
- `fecha_fin`: Fecha de fin (YYYY-MM-DD)

### `GET /api/estadistica/metricas`
Obtener métricas específicas

**Query Parameters:**
- `proporcion_retraso`: true/false
- `libros_populares`: número de libros (default: 5)
- `generos_populares`: true/false
- `usuarios_activos`: número de usuarios (default: 5)

---

## 🔧 ENDPOINTS DE SALUD DEL SISTEMA

### `GET /api/health`
Verificar el estado general del sistema

**Respuesta:**
```json
{
  "status": "OK",
  "message": "Sistema de Biblioteca funcionando correctamente",
  "timestamp": "2024-01-01T12:00:00.000000Z",
  "version": "1.0.0"
}
```

### `GET /api/status`
Verificar el estado de la base de datos

**Respuesta:**
```json
{
  "database": "Connected",
  "status": "Healthy",
  "timestamp": "2024-01-01T12:00:00.000000Z"
}
```

---

## 📝 CÓDIGOS DE RESPUESTA HTTP

- **200**: OK - Operación exitosa
- **201**: Created - Recurso creado exitosamente
- **404**: Not Found - Recurso no encontrado
- **409**: Conflict - Conflicto (ej: no se puede eliminar por dependencias)
- **422**: Unprocessable Entity - Error de validación
- **500**: Internal Server Error - Error interno del servidor
- **503**: Service Unavailable - Servicio no disponible

---

## 🔍 FILTROS Y BÚSQUEDAS

### Libros
- **Búsqueda por texto**: `/api/libros/search?search=quijote`
- **Filtrar por género**: `/api/libros/search?genero=novela`
- **Solo disponibles**: `/api/libros/search?disponible=true`

### Usuarios
- **Búsqueda por texto**: `/api/usuarios/search?search=juan`

### Préstamos
- **Por estado**: `/api/prestamos?estado=prestado`
- **Por usuario**: `/api/prestamos?user_id=1`
- **Vencidos**: `/api/prestamos?vencidos=true`

---

## 📋 EJEMPLOS DE USO

### Crear un préstamo completo:
```bash
curl -X POST http://localhost:8000/api/prestamos \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "fecha_prestamo": "2024-01-01",
    "fecha_devolucion": "2024-01-15",
    "valor": 5000,
    "books": [
      {
        "book_id": 1,
        "cantidad": 2
      }
    ]
  }'
```

### Registrar una devolución:
```bash
curl -X PUT http://localhost:8000/api/prestamos/1/devolucion \
  -H "Content-Type: application/json"
```

### Obtener estadísticas:
```bash
curl -X GET http://localhost:8000/api/estadistica/viewlibros
```

---

## 🚨 NOTAS IMPORTANTES

1. **Validaciones**: Todos los endpoints incluyen validaciones de datos
2. **Transacciones**: Las operaciones de préstamo y devolución usan transacciones de base de datos
3. **Integridad**: No se pueden eliminar libros o usuarios con préstamos activos
4. **Stock**: El sistema actualiza automáticamente el stock de los libros
5. **Estados**: Los libros cambian de estado automáticamente según su disponibilidad
6. **Estadísticas**: Las métricas se calculan en tiempo real

---

## 🔧 CONFIGURACIÓN

Para usar esta API, asegúrate de:

1. Ejecutar las migraciones: `php artisan migrate`
2. Configurar tu base de datos en `.env`
3. Iniciar el servidor: `php artisan serve`
4. Acceder a la API en: `http://localhost:8000/api`

---

*Documentación generada automáticamente - Sistema de Biblioteca v1.0.0*
