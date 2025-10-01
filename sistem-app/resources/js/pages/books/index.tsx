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
import { Plus, Search, Edit, Trash2, BookOpen } from 'lucide-react';
import { bookService, Book, ApiResponse } from '@/lib/api';

interface BooksPageProps {
  auth: any;
}

const BooksPage: React.FC<BooksPageProps> = ({ auth }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [formData, setFormData] = useState({
    titulo: '',
    autores: '',
    generos: '',
    editorial: '',
    stock: 1,
    estado: 'disponible' as 'disponible' | 'prestado' | 'mantenimiento' | 'perdido'
  });

  const estados = [
    { value: 'disponible', label: 'Disponible', color: 'bg-green-100 text-green-800' },
    { value: 'prestado', label: 'Prestado', color: 'bg-red-100 text-red-800' },
    { value: 'mantenimiento', label: 'Mantenimiento', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'perdido', label: 'Perdido', color: 'bg-gray-100 text-gray-800' }
  ];

  useEffect(() => {
    loadBooks();
  }, []);

  useEffect(() => {
    filterBooks();
  }, [books, searchTerm, selectedGenre]);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const response: ApiResponse<{ books: Book[] }> = await bookService.getAll();
      if (response.success && response.data) {
        setBooks(response.data.books);
      }
    } catch (error) {
      console.error('Error cargando libros:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterBooks = () => {
    let filtered = books;

    if (searchTerm) {
      filtered = filtered.filter(book =>
        book.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.autores.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.generos.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedGenre && selectedGenre !== 'all') {
      filtered = filtered.filter(book =>
        book.generos.toLowerCase().includes(selectedGenre.toLowerCase())
      );
    }

    setFilteredBooks(filtered);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await bookService.create(formData);
      if (response.success) {
        setShowCreateModal(false);
        resetForm();
        loadBooks();
      }
    } catch (error) {
      console.error('Error creando libro:', error);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBook) return;

    try {
      const response = await bookService.update(editingBook.id, formData);
      if (response.success) {
        setShowEditModal(false);
        setEditingBook(null);
        resetForm();
        loadBooks();
      }
    } catch (error) {
      console.error('Error actualizando libro:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este libro?')) return;

    try {
      const response = await bookService.delete(id);
      if (response.success) {
        loadBooks();
      }
    } catch (error) {
      console.error('Error eliminando libro:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      autores: '',
      generos: '',
      editorial: '',
      stock: 1,
      estado: 'disponible'
    });
  };

  const openEditModal = (book: Book) => {
    setEditingBook(book);
    setFormData({
      titulo: book.titulo,
      autores: book.autores,
      generos: book.generos,
      editorial: book.editorial || '',
      stock: book.stock,
      estado: book.estado
    });
    setShowEditModal(true);
  };

  const getEstadoInfo = (estado: string) => {
    return estados.find(e => e.value === estado) || estados[0];
  };

  const uniqueGenres = Array.from(new Set(books.map(book => book.generos).flatMap(g => g.split(',').map(gg => gg.trim()))));

  return (
    <LibraryLayout
      header={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            <h2 className="text-xl font-semibold">Gestión de Libros</h2>
          </div>
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Libro
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nuevo Libro</DialogTitle>
                <DialogDescription>
                  Agrega un nuevo libro al catálogo de la biblioteca.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <Label htmlFor="titulo">Título</Label>
                  <Input
                    id="titulo"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="autores">Autores</Label>
                  <Input
                    id="autores"
                    value={formData.autores}
                    onChange={(e) => setFormData({ ...formData, autores: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="generos">Géneros</Label>
                  <Input
                    id="generos"
                    value={formData.generos}
                    onChange={(e) => setFormData({ ...formData, generos: e.target.value })}
                    placeholder="Novela, Drama, Comedia"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="editorial">Editorial</Label>
                  <Input
                    id="editorial"
                    value={formData.editorial}
                    onChange={(e) => setFormData({ ...formData, editorial: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="estado">Estado</Label>
                  <Select value={formData.estado} onValueChange={(value: any) => setFormData({ ...formData, estado: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {estados
                         .filter(estado => estado.value !== "all") 
                         .map(estado => (
    <SelectItem key={estado.value} value={estado.value}>
      {estado.label}
    </SelectItem>
  ))
}
                     
                    
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Crear</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      }
    >
      <Head title="Libros" />

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
                    placeholder="Buscar por título, autor o género..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por género" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los géneros</SelectItem>
                  {uniqueGenres.map(genre => (
                    <SelectItem key={genre} value={genre}>
                      {genre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de libros */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredBooks.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No se encontraron libros</p>
            </div>
          ) : (
            filteredBooks.map((book) => {
              const estadoInfo = getEstadoInfo(book.estado);
              return (
                <Card key={book.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{book.titulo}</CardTitle>
                        <CardDescription>{book.autores}</CardDescription>
                      </div>
                      <Badge className={estadoInfo.color}>
                        {estadoInfo.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p><strong>Géneros:</strong> {book.generos}</p>
                      {book.editorial && <p><strong>Editorial:</strong> {book.editorial}</p>}
                      <p><strong>Stock:</strong> {book.stock}</p>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(book)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(book.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Modal de edición */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Libro</DialogTitle>
              <DialogDescription>
                Modifica la información del libro seleccionado.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <Label htmlFor="edit-titulo">Título</Label>
                <Input
                  id="edit-titulo"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-autores">Autores</Label>
                <Input
                  id="edit-autores"
                  value={formData.autores}
                  onChange={(e) => setFormData({ ...formData, autores: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-generos">Géneros</Label>
                <Input
                  id="edit-generos"
                  value={formData.generos}
                  onChange={(e) => setFormData({ ...formData, generos: e.target.value })}
                  placeholder="Novela, Drama, Comedia"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-editorial">Editorial</Label>
                <Input
                  id="edit-editorial"
                  value={formData.editorial}
                  onChange={(e) => setFormData({ ...formData, editorial: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-stock">Stock</Label>
                <Input
                  id="edit-stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-estado">Estado</Label>
                <Select value={formData.estado} onValueChange={(value: any) => setFormData({ ...formData, estado: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {estados.map(estado => (
                      <SelectItem key={estado.value} value={estado.value}>
                        {estado.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Actualizar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </LibraryLayout>
  );
};

export default BooksPage;
