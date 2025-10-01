import axios from 'axios';

// Configurar axios con la base URL de la API
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      console.error("API Error:", error.response?.data || error.message);
      console.log("ID del libro:", error.response?.data.id);

    }
  }
);

// Tipos para las respuestas de la API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface Book {
  id: number;
  titulo: string;
  autores: string;
  generos: string;
  editorial?: string;
  stock: number;
  estado: 'disponible' | 'prestado' | 'mantenimiento' | 'perdido';
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
  loans_count?: number;
}

export interface LoanDetail {
  id: number;
  loan_id: number;
  book_id: number;
  cantidad: number;
  book?: Book;
}

export interface Loan {
  id: number;
  user_id: number;
  fecha_prestamo: string;
  fecha_devolucion: string;
  valor: number;
  estado: 'pendiente' | 'prestado' | 'devolucion';
  user?: User;
  loan_details?: LoanDetail[];
  created_at: string;
  updated_at: string;
}

export interface Statistics {
  libros: {
    total_libros: number;
    libros_disponibles: number;
    total_stock: number;
    libros_prestados: number;
    libros_mantenimiento: number;
    libros_perdidos: number;
  };
  prestamos: {
    total_prestamos: number;
    prestamos_activos: number;
    prestamos_vencidos: number;
    prestamos_devueltos: number;
    proporcion_retraso: string;
  };
  usuarios: {
    total_usuarios: number;
    usuarios_con_prestamos: number;
    usuarios_con_prestamos_vencidos: number;
  };
}

// Servicios para libros
export const bookService = {
  // Obtener todos los libros
  getAll: (): Promise<ApiResponse<{ books: Book[]; statistics: any }>> =>
    api.get('/libros').then(res => res.data),

  // Obtener un libro por ID
  getById: (id: number): Promise<ApiResponse<Book>> =>
    api.get(`/libros/${id}`).then(res => res.data),

  // Crear un nuevo libro
  create: (data: Partial<Book>): Promise<ApiResponse<Book>> =>
    api.post('/libros', data).then(res => res.data),

  // Actualizar un libro
  update: (id: number, data: Partial<Book>): Promise<ApiResponse<Book>> =>
    api.put(`/libros/${id}`, data).then(res => res.data),

  // Eliminar un libro
  delete: (id: number): Promise<ApiResponse> =>
    api.delete(`/libros/${id}`).then(res => res.data),

  // Buscar libros
  search: (params: { search?: string; genero?: string; disponible?: boolean }): Promise<ApiResponse<Book[]>> =>
    api.get('/libros/search', { params }).then(res => res.data),

  // Obtener libros disponibles
  getAvailable: (): Promise<ApiResponse<Book[]>> =>
    api.get('/libros/disponibles').then(res => res.data),
};

// Servicios para usuarios
export const userService = {
  // Obtener todos los usuarios
  getAll: (): Promise<ApiResponse<User[]>> =>
    api.get('/usuarios').then(res => res.data),

  // Obtener un usuario por ID
  getById: (id: number): Promise<ApiResponse<User>> =>
    api.get(`/usuarios/${id}`).then(res => res.data),

  // Crear un nuevo usuario
  create: (data: { name: string; email: string; password: string; password_confirmation: string }): Promise<ApiResponse<User>> =>
    api.post('/usuarios', data).then(res => res.data),

  // Actualizar un usuario
  update: (id: number, data: Partial<User>): Promise<ApiResponse<User>> =>
    api.put(`/usuarios/${id}`, data).then(res => res.data),

  // Eliminar un usuario
  delete: (id: number): Promise<ApiResponse> =>
    api.delete(`/usuarios/${id}`).then(res => res.data),

  // Buscar usuarios
  search: (params: { search?: string }): Promise<ApiResponse<User[]>> =>
    api.get('/usuarios/search', { params }).then(res => res.data),

  // Obtener préstamos de un usuario
  getLoans: (id: number): Promise<ApiResponse<{ user: User; loans: Loan[] }>> =>
    api.get(`/usuarios/${id}/prestamos`).then(res => res.data),
};

// Servicios para préstamos
export const loanService = {
  // Obtener todos los préstamos
  getAll: (params?: { estado?: string; user_id?: number; vencidos?: boolean }): Promise<ApiResponse<Loan[]>> =>
    api.get('/prestamos', { params }).then(res => res.data),

  // Obtener un préstamo por ID
  getById: (id: number): Promise<ApiResponse<Loan>> =>
    api.get(`/prestamos/${id}`).then(res => res.data),

  // Crear un nuevo préstamo
  create: (data: {
    user_id: number;
    fecha_prestamo: string;
    fecha_devolucion: string;
    valor: number;
    books: Array<{ book_id: number; cantidad: number }>;
  }): Promise<ApiResponse<Loan>> =>
    api.post('/prestamos', data).then(res => res.data),

  // Actualizar un préstamo
  update: (id: number, data: Partial<Loan>): Promise<ApiResponse<Loan>> =>
    api.put(`/prestamos/${id}`, data).then(res => res.data),

  // Eliminar un préstamo
  delete: (id: number): Promise<ApiResponse> =>
    api.delete(`/prestamos/${id}`).then(res => res.data),

  // Registrar devolución
  return: (id: number): Promise<ApiResponse<Loan>> =>
    api.put(`/prestamos/${id}/devolucion`).then(res => res.data),

  // Obtener préstamos vencidos
  getOverdue: (): Promise<ApiResponse<Loan[]>> =>
    api.get('/prestamos/vencidos').then(res => res.data),

  // Obtener préstamos activos
  getActive: (): Promise<ApiResponse<Loan[]>> =>
    api.get('/prestamos/activos').then(res => res.data),

  // Obtener préstamos devueltos
  getReturned: (): Promise<ApiResponse<Loan[]>> =>
    api.get('/prestamos/devueltos').then(res => res.data),
};

// Servicios para estadísticas
export const statisticsService = {
  // Obtener estadísticas generales
  getGeneral: (): Promise<ApiResponse<Statistics>> =>
    api.get('/estadistica/viewlibros').then(res => res.data),

  // Obtener estadísticas por período
  getByPeriod: (fecha_inicio: string, fecha_fin: string): Promise<ApiResponse<any>> =>
    api.get('/estadistica/periodo', { params: { fecha_inicio, fecha_fin } }).then(res => res.data),

  // Obtener métricas específicas
  getMetrics: (params: any): Promise<ApiResponse<any>> =>
    api.get('/estadistica/metricas', { params }).then(res => res.data),
};

export default api;
