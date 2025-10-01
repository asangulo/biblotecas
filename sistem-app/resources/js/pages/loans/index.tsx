import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import LibraryLayout from '@/layouts/library-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, ArrowLeft, CheckCircle, AlertCircle, Clock, User, BookOpen, Calendar } from 'lucide-react';
import { loanService, userService, bookService, Loan, User as UserType, Book, ApiResponse } from '@/lib/api';

interface LoansPageProps {
  auth: any;
}

interface LoanFormData {
  user_id: number;
  fecha_prestamo: string;
  fecha_devolucion: string;
  valor: number;
  books: Array<{ book_id: number; cantidad: number }>;
}

const LoansPage: React.FC<LoansPageProps> = ({ auth }) => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [filteredLoans, setFilteredLoans] = useState<Loan[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [availableBooks, setAvailableBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('todos');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState<LoanFormData>({
    user_id: 0,
    fecha_prestamo: new Date().toISOString().split('T')[0],
    fecha_devolucion: '',
    valor: 0,
    books: []
  });

  const statuses = [
    { value: 'todos', label: 'Todos' },
    { value: 'pendiente', label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'prestado', label: 'Prestado', color: 'bg-blue-100 text-blue-800' },
    { value: 'devolucion', label: 'Devuelto', color: 'bg-green-100 text-green-800' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterLoans();
  }, [loans, searchTerm, selectedStatus]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [loansResponse, usersResponse, booksResponse] = await Promise.all([
        loanService.getAll(),
        userService.getAll(),
        bookService.getAvailable()
      ]);

      if (loansResponse.success && loansResponse.data) {
        setLoans(loansResponse.data);
      }
      if (usersResponse.success && usersResponse.data) {
        setUsers(usersResponse.data);
      }
      if (booksResponse.success && booksResponse.data) {
        setAvailableBooks(booksResponse.data);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterLoans = () => {
    let filtered = loans;

    if (searchTerm) {
      filtered = filtered.filter(loan =>
        loan.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.loan_details?.some(detail => 
          detail.book?.titulo.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (selectedStatus && selectedStatus !== 'todos') {
      filtered = filtered.filter(loan => loan.estado === selectedStatus);
    }

    setFilteredLoans(filtered);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.books.length === 0) {
      alert('Debe seleccionar al menos un libro');
      return;
    }

    try {
      const response = await loanService.create(formData);
      if (response.success) {
        setShowCreateModal(false);
        resetForm();
        loadData();
      }
    } catch (error) {
      console.error('Error creando préstamo:', error);
    }
  };

  const handleReturn = async (loanId: number) => {
    if (!confirm('¿Estás seguro de que quieres marcar este préstamo como devuelto?')) return;

    try {
      const response = await loanService.return(loanId);
      if (response.success) {
        loadData();
      }
    } catch (error) {
      console.error('Error devolviendo préstamo:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      user_id: 0,
      fecha_prestamo: new Date().toISOString().split('T')[0],
      fecha_devolucion: '',
      valor: 0,
      books: []
    });
  };

  const addBook = () => {
    setFormData({
      ...formData,
      books: [...formData.books, { book_id: 0, cantidad: 1 }]
    });
  };

  const removeBook = (index: number) => {
    const newBooks = formData.books.filter((_, i) => i !== index);
    setFormData({ ...formData, books: newBooks });
  };

  const updateBook = (index: number, field: 'book_id' | 'cantidad', value: number) => {
    const newBooks = [...formData.books];
    newBooks[index][field] = value;
    setFormData({ ...formData, books: newBooks });
  };

  const getStatusInfo = (status: string) => {
    return statuses.find(s => s.value === status) || statuses[0];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const isOverdue = (fechaDevolucion: string) => {
    return new Date(fechaDevolucion) < new Date();
  };

  return (
    <LibraryLayout
      header={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowLeft className="h-6 w-6" />
            <h2 className="text-xl font-semibold">Gestión de Préstamos</h2>
          </div>
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Préstamo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Préstamo</DialogTitle>
                <DialogDescription>
                  Registra un nuevo préstamo de libros.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="user_id">Usuario</Label>
                    <Select value={formData.user_id.toString()} onValueChange={(value) => setFormData({ ...formData, user_id: parseInt(value) })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar usuario" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map(user => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.name} ({user.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="valor">Valor</Label>
                    <Input
                      id="valor"
                      type="number"
                      min="0"
                      value={formData.valor}
                      onChange={(e) => setFormData({ ...formData, valor: parseFloat(e.target.value) })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fecha_prestamo">Fecha de Préstamo</Label>
                    <Input
                      id="fecha_prestamo"
                      type="date"
                      value={formData.fecha_prestamo}
                      onChange={(e) => setFormData({ ...formData, fecha_prestamo: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="fecha_devolucion">Fecha de Devolución</Label>
                    <Input
                      id="fecha_devolucion"
                      type="date"
                      value={formData.fecha_devolucion}
                      onChange={(e) => setFormData({ ...formData, fecha_devolucion: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label>Libros</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addBook}>
                      <Plus className="h-4 w-4 mr-1" />
                      Agregar Libro
                    </Button>
                  </div>
                  {formData.books.map((book, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <Select 
                        value={book.book_id.toString()} 
                        onValueChange={(value) => updateBook(index, 'book_id', parseInt(value))}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Seleccionar libro" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableBooks.map(book => (
                            <SelectItem key={book.id} value={book.id.toString()}>
                              {book.titulo} - Stock: {book.stock}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        min="1"
                        value={book.cantidad}
                        onChange={(e) => updateBook(index, 'cantidad', parseInt(e.target.value))}
                        className="w-20"
                      />
                      <Button type="button" variant="outline" size="sm" onClick={() => removeBook(index)}>
                        ×
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Crear Préstamo</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      }
    >
      <Head title="Préstamos" />

      <div className="space-y-6">
        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por usuario o libro..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de préstamos */}
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredLoans.length === 0 ? (
            <div className="text-center py-12">
              <ArrowLeft className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No se encontraron préstamos</p>
            </div>
          ) : (
            filteredLoans.map((loan) => {
              const statusInfo = getStatusInfo(loan.estado);
              const overdue = isOverdue(loan.fecha_devolucion) && loan.estado === 'prestado';
              
              return (
                <Card key={loan.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <User className="h-5 w-5" />
                          {loan.user?.name}
                        </CardTitle>
                        <CardDescription>{loan.user?.email}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        {overdue && (
                          <Badge className="bg-red-100 text-red-800">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Vencido
                          </Badge>
                        )}
                        <Badge className={statusInfo.color}>
                          {statusInfo.label}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span><strong>Préstamo:</strong> {formatDate(loan.fecha_prestamo)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span><strong>Devolución:</strong> {formatDate(loan.fecha_devolucion)}</span>
                      </div>
                      <div className="text-sm">
                        <strong>Valor:</strong> ${loan.valor.toLocaleString()}
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Libros Prestados:
                      </h4>
                      <div className="space-y-1">
                        {loan.loan_details?.map((detail, index) => (
                          <div key={index} className="text-sm text-gray-600 flex justify-between">
                            <span>{detail.book?.titulo}</span>
                            <span>Cantidad: {detail.cantidad}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {loan.estado !== 'devolucion' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReturn(loan.id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Marcar como Devuelto
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </LibraryLayout>
  );
};

export default LoansPage;
