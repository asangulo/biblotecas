# 📚 Frontend Documentation - Sistema de Biblioteca

## 🚀 Información General

**Framework**: React 19 + TypeScript + Inertia.js
**Estilos**: Tailwind CSS
**Componentes UI**: Radix UI + shadcn/ui
**Estado**: React Hooks (useState, useEffect)
**HTTP Client**: Axios

---

## 📁 Estructura del Proyecto

```
resources/js/
├── lib/
│   └── api.ts                 # Servicios para llamadas a la API
├── pages/
│   ├── books/
│   │   └── index.tsx          # Gestión de libros
│   ├── users/
│   │   └── index.tsx          # Gestión de usuarios
│   ├── loans/
│   │   └── index.tsx          # Gestión de préstamos
│   ├── statistics/
│   │   └── index.tsx          # Estadísticas y reportes
│   └── dashboard.tsx          # Dashboard principal
├── components/ui/             # Componentes UI reutilizables
└── layouts/
    └── app-layout.tsx         # Layout principal de la aplicación
```

---

## 🎨 Páginas Implementadas

### 1. **Dashboard Principal** (`/dashboard`)
- **Descripción**: Página principal con resumen general del sistema
- **Características**:
  - Estadísticas rápidas (libros, usuarios, préstamos)
  - Acciones rápidas para navegación
  - Alertas de préstamos
  - Información del sistema

### 2. **Gestión de Libros** (`/books`)
- **Descripción**: CRUD completo para libros
- **Características**:
  - Lista de libros con filtros
  - Búsqueda por título, autor o género
  - Crear nuevo libro
  - Editar libro existente
  - Eliminar libro (con validaciones)
  - Estados de libros (disponible, prestado, mantenimiento, perdido)

### 3. **Gestión de Usuarios** (`/users`)
- **Descripción**: CRUD completo para usuarios
- **Características**:
  - Lista de usuarios
  - Búsqueda por nombre o email
  - Crear nuevo usuario
  - Editar usuario existente
  - Eliminar usuario (con validaciones)
  - Ver préstamos por usuario

### 4. **Gestión de Préstamos** (`/loans`)
- **Descripción**: Gestión completa de préstamos y devoluciones
- **Características**:
  - Lista de préstamos con filtros
  - Crear nuevo préstamo (múltiples libros)
  - Registrar devoluciones
  - Filtros por estado y usuario
  - Préstamos vencidos
  - Gestión automática de stock


## 🔧 Componentes UI Utilizados

### Componentes Base
- `Card` - Tarjetas de contenido
- `Button` - Botones con variantes
- `Input` - Campos de entrada
- `Dialog` - Modales
- `Select` - Selectores desplegables
- `Badge` - Etiquetas de estado
- `Label` - Etiquetas de formulario

### Iconos (Lucide React)
- `BookOpen` - Libros
- `Users` - Usuarios
- `ArrowLeft` - Préstamos
- `BarChart3` - Estadísticas
- `Plus` - Agregar
- `Search` - Buscar
- `Edit` - Editar
- `Trash2` - Eliminar
- `CheckCircle` - Éxito
- `AlertTriangle` - Alertas

---

## 🌐 Servicios API

### Configuración
```typescript
// Base URL: /api
// Headers: Content-Type: application/json, Accept: application/json
// Interceptor: Manejo global de errores
```

### Servicios Disponibles

#### 1. **bookService**
- `getAll()` - Obtener todos los libros
- `getById(id)` - Obtener libro por ID
- `create(data)` - Crear libro
- `update(id, data)` - Actualizar libro
- `delete(id)` - Eliminar libro
- `search(params)` - Buscar libros
- `getAvailable()` - Libros disponibles

#### 2. **userService**
- `getAll()` - Obtener todos los usuarios
- `getById(id)` - Obtener usuario por ID
- `create(data)` - Crear usuario
- `update(id, data)` - Actualizar usuario
- `delete(id)` - Eliminar usuario
- `search(params)` - Buscar usuarios
- `getLoans(id)` - Préstamos del usuario

#### 3. **loanService**
- `getAll(params)` - Obtener préstamos
- `getById(id)` - Obtener préstamo por ID
- `create(data)` - Crear préstamo
- `update(id, data)` - Actualizar préstamo
- `delete(id)` - Eliminar préstamo
- `return(id)` - Registrar devolución
- `getOverdue()` - Préstamos vencidos
- `getActive()` - Préstamos activos

#### 4. **statisticsService**
- `getGeneral()` - Estadísticas generales
- `getByPeriod(start, end)` - Estadísticas por período
- `getMetrics(params)` - Métricas específicas

---

## 🎯 Funcionalidades Implementadas

### ✅ CRUD Completo
- **Libros**: Crear, leer, actualizar, eliminar
- **Usuarios**: Crear, leer, actualizar, eliminar
- **Préstamos**: Crear, leer, actualizar, eliminar

### ✅ Validaciones
- Formularios con validación en tiempo real
- Validaciones del lado del cliente
- Manejo de errores de la API
- Confirmaciones para acciones destructivas

### ✅ Filtros y Búsquedas
- Búsqueda por texto en libros y usuarios
- Filtros por género, estado, fecha
- Filtros avanzados en préstamos

### ✅ Estados y Alertas
- Estados visuales para libros y préstamos
- Alertas para préstamos vencidos
- Notificaciones de éxito/error
- Loading states

### ✅ Responsive Design
- Diseño adaptativo para móviles y desktop
- Grid layouts responsivos
- Componentes optimizados para touch

---

## 🚀 Instalación y Configuración

### 1. **Dependencias**
```bash
npm install axios
```

### 2. **Ejecutar en desarrollo**
```bash
npm run dev
```

### 3. **Compilar para producción**
```bash
npm run build
```

---

## 📱 Rutas del Frontend

| Ruta | Página | Descripción |
|------|--------|-------------|
| `/` | Welcome | Página de bienvenida |
| `/dashboard` | Dashboard | Panel principal de biblioteca |
| `/books` | Libros | Gestión de libros |
| `/users` | Usuarios | Gestión de usuarios |
| `/loans` | Préstamos | Gestión de préstamos |

---

## 🎨 Estilos y Temas

### Colores Principales
- **Azul**: Libros y elementos primarios
- **Verde**: Usuarios y estados positivos
- **Naranja**: Préstamos y alertas
- **Rojo**: Errores y préstamos vencidos
- **Gris**: Elementos secundarios

### Estados Visuales
- **Disponible**: Verde
- **Prestado**: Rojo
- **Mantenimiento**: Amarillo
- **Perdido**: Gris
- **Vencido**: Rojo con alerta

---

## 🔧 Configuración de Desarrollo

### Variables de Entorno
```env
VITE_APP_URL=http://localhost:8000
```

### Estructura de Tipos TypeScript
```typescript
interface Book {
  id: number;
  titulo: string;
  autores: string;
  generos: string;
  editorial?: string;
  stock: number;
  estado: 'disponible' | 'prestado' | 'mantenimiento' | 'perdido';
}

interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
  loans_count?: number;
}

interface Loan {
  id: number;
  user_id: number;
  fecha_prestamo: string;
  fecha_devolucion: string;
  valor: number;
  estado: 'pendiente' | 'prestado' | 'devolucion';
  user?: User;
  loan_details?: LoanDetail[];
}
```

---

## 🚨 Manejo de Errores

### Tipos de Errores
1. **Errores de Validación** (422)
2. **Errores de Recurso No Encontrado** (404)
3. **Errores de Conflicto** (409)
4. **Errores del Servidor** (500)

---

## 🔮 Próximas Mejoras

### Funcionalidades Pendientes
- [ ] Exportación de reportes (PDF/Excel)
- [ ] Notificaciones push
- [ ] Búsqueda avanzada con filtros múltiples
- [ ] Historial de cambios
- [ ] Sistema de roles y permisos
- [ ] Dashboard personalizable
- [ ] Modo oscuro
- [ ] PWA (Progressive Web App)

### Optimizaciones
- [ ] Implementar React Query para cache
- [ ] Virtualización de listas largas
- [ ] Optimización de imágenes
- [ ] Service Workers para offline

