import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import LibraryLayout from '@/layouts/library-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, BookOpen, Users, ArrowLeft, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { statisticsService, Statistics, ApiResponse } from '@/lib/api';

interface StatisticsPageProps {
  auth: any;
}

const StatisticsPage: React.FC<StatisticsPageProps> = ({ auth }) => {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const response: ApiResponse<Statistics> = await statisticsService.getGeneral();
      if (response.success && response.data) {
        setStatistics(response.data);
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color = "text-blue-600", bgColor = "bg-blue-50" }: {
    title: string;
    value: string | number;
    icon: React.ComponentType<any>;
    color?: string;
    bgColor?: string;
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div className={`p-3 rounded-full ${bgColor}`}>
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const RankingItem = ({ title, subtitle, value, rank }: {
    title: string;
    subtitle?: string;
    value: number;
    rank: number;
  }) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-bold">
          {rank}
        </div>
        <div>
          <p className="font-medium">{title}</p>
          {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
        </div>
      </div>
      <Badge variant="secondary">{value}</Badge>
    </div>
  );

  if (loading) {
    return (
      <AppLayout user={auth.user}>
        <Head title="Estadísticas" />
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            <h2 className="text-xl font-semibold">Estadísticas</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!statistics) {
    return (
      <AppLayout user={auth.user}>
        <Head title="Estadísticas" />
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">No se pudieron cargar las estadísticas</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <LibraryLayout
      header={
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          <h2 className="text-xl font-semibold">Estadísticas de la Biblioteca</h2>
        </div>
      }
    >
      <Head title="Estadísticas" />

      <div className="space-y-6">
        {/* Estadísticas principales de libros */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Estadísticas de Libros
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              title="Total de Libros"
              value={statistics.libros.total_libros}
              icon={BookOpen}
              color="text-blue-600"
              bgColor="bg-blue-50"
            />
            <StatCard
              title="Libros Disponibles"
              value={statistics.libros.libros_disponibles}
              icon={CheckCircle}
              color="text-green-600"
              bgColor="bg-green-50"
            />
            <StatCard
              title="Total de Stock"
              value={statistics.libros.total_stock}
              icon={TrendingUp}
              color="text-purple-600"
              bgColor="bg-purple-50"
            />
            <StatCard
              title="Libros Prestados"
              value={statistics.libros.libros_prestados}
              icon={ArrowLeft}
              color="text-orange-600"
              bgColor="bg-orange-50"
            />
            <StatCard
              title="En Mantenimiento"
              value={statistics.libros.libros_mantenimiento}
              icon={AlertTriangle}
              color="text-yellow-600"
              bgColor="bg-yellow-50"
            />
            <StatCard
              title="Libros Perdidos"
              value={statistics.libros.libros_perdidos}
              icon={AlertTriangle}
              color="text-red-600"
              bgColor="bg-red-50"
            />
          </div>
        </div>

        {/* Estadísticas de préstamos */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ArrowLeft className="h-5 w-5" />
            Estadísticas de Préstamos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total de Préstamos"
              value={statistics.prestamos.total_prestamos}
              icon={ArrowLeft}
              color="text-blue-600"
              bgColor="bg-blue-50"
            />
            <StatCard
              title="Préstamos Activos"
              value={statistics.prestamos.prestamos_activos}
              icon={TrendingUp}
              color="text-green-600"
              bgColor="bg-green-50"
            />
            <StatCard
              title="Préstamos Vencidos"
              value={statistics.prestamos.prestamos_vencidos}
              icon={AlertTriangle}
              color="text-red-600"
              bgColor="bg-red-50"
            />
            <StatCard
              title="Préstamos Devueltos"
              value={statistics.prestamos.prestamos_devueltos}
              icon={CheckCircle}
              color="text-green-600"
              bgColor="bg-green-50"
            />
          </div>
          <div className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Proporción de Retraso</CardTitle>
                <CardDescription>
                  Porcentaje de libros devueltos con retraso
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-bold text-red-600">
                    {statistics.prestamos.proporcion_retraso}
                  </div>
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-600 h-2 rounded-full progress-bar"
                        style={{ width: `${parseFloat(statistics.prestamos.proporcion_retraso)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Estadísticas de usuarios */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Estadísticas de Usuarios
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Total de Usuarios"
              value={statistics.usuarios.total_usuarios}
              icon={Users}
              color="text-blue-600"
              bgColor="bg-blue-50"
            />
            <StatCard
              title="Usuarios Activos"
              value={statistics.usuarios.usuarios_con_prestamos}
              icon={TrendingUp}
              color="text-green-600"
              bgColor="bg-green-50"
            />
            <StatCard
              title="Con Préstamos Vencidos"
              value={statistics.usuarios.usuarios_con_prestamos_vencidos}
              icon={AlertTriangle}
              color="text-red-600"
              bgColor="bg-red-50"
            />
          </div>
        </div>

        {/* Rankings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Libros Prestados */}
          <Card>
            <CardHeader>
              <CardTitle>Libros Más Prestados</CardTitle>
              <CardDescription>
                Ranking de los libros con más préstamos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {statistics.ranking?.libros_mas_prestados?.slice(0, 5).map((book, index) => (
                  <RankingItem
                    key={book.id}
                    title={book.titulo}
                    subtitle={book.autores}
                    value={book.total_prestado}
                    rank={index + 1}
                  />
                )) || (
                  <p className="text-gray-500 text-center py-4">No hay datos disponibles</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Géneros Populares */}
          <Card>
            <CardHeader>
              <CardTitle>Géneros Más Populares</CardTitle>
              <CardDescription>
                Géneros con mayor demanda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {statistics.ranking?.generos_populares?.slice(0, 5).map((genre, index) => (
                  <RankingItem
                    key={genre.generos}
                    title={genre.generos}
                    value={genre.total_prestado}
                    rank={index + 1}
                  />
                )) || (
                  <p className="text-gray-500 text-center py-4">No hay datos disponibles</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Usuarios Más Activos */}
        <Card>
          <CardHeader>
            <CardTitle>Usuarios Más Activos</CardTitle>
            <CardDescription>
              Usuarios con mayor número de préstamos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {statistics.ranking?.usuarios_mas_activos?.slice(0, 6).map((user, index) => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">{user.total_prestamos} préstamos</Badge>
                </div>
              )) || (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500">No hay datos disponibles</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </LibraryLayout>
  );
};

export default StatisticsPage;
