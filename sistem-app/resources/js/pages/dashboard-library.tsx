import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, ArrowLeft, BarChart3, Plus, Search, Clock, AlertTriangle } from 'lucide-react';
import { statisticsService, loanService, ApiResponse } from '@/lib/api';

interface DashboardLibraryProps {
  auth: any;
}

interface QuickStats {
  total_books: number;
  total_users: number;
  active_loans: number;
  overdue_loans: number;
}

const DashboardLibrary: React.FC<DashboardLibraryProps> = ({ auth }) => {
  const [stats, setStats] = useState<QuickStats>({
    total_books: 0,
    total_users: 0,
    active_loans: 0,
    overdue_loans: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuickStats();
  }, []);

  const loadQuickStats = async () => {
    try {
      setLoading(true);
      const [statsResponse, loansResponse] = await Promise.all([
        statisticsService.getGeneral(),
        loanService.getOverdue()
      ]);

      if (statsResponse.success && statsResponse.data) {
        setStats({
          total_books: statsResponse.data.libros.total_libros,
          total_users: statsResponse.data.usuarios.total_usuarios,
          active_loans: statsResponse.data.prestamos.prestamos_activos,
          overdue_loans: loansResponse.success ? loansResponse.data?.length || 0 : 0
        });
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color = "text-blue-600", bgColor = "bg-blue-50", href }: {
    title: string;
    value: number;
    icon: React.ComponentType<any>;
    color?: string;
    bgColor?: string;
    href?: string;
  }) => {
    const content = (
      <Card className="hover:shadow-md transition-shadow">
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

    return href ? (
      <Link href={href}>
        {content}
      </Link>
    ) : content;
  };

  const QuickActionCard = ({ title, description, icon: Icon, href, color = "text-blue-600" }: {
    title: string;
    description: string;
    icon: React.ComponentType<any>;
    href: string;
    color?: string;
  }) => (
    <Link href={href}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-50 rounded-lg">
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
    </Link>
  );

  return (
    <AppLayout
      user={auth.user}
      header={
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6" />
          <h2 className="text-xl font-semibold">Sistema de Biblioteca</h2>
        </div>
      }
    >
      <Head title="Dashboard - Biblioteca" />

      <div className="space-y-6">
        {/* Estadísticas rápidas */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Resumen General</h3>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total de Libros"
                value={stats.total_books}
                icon={BookOpen}
                color="text-blue-600"
                bgColor="bg-blue-50"
                href="/books"
              />
              <StatCard
                title="Total de Usuarios"
                value={stats.total_users}
                icon={Users}
                color="text-green-600"
                bgColor="bg-green-50"
                href="/users"
              />
              <StatCard
                title="Préstamos Activos"
                value={stats.active_loans}
                icon={ArrowLeft}
                color="text-orange-600"
                bgColor="bg-orange-50"
                href="/loans"
              />
              <StatCard
                title="Préstamos Vencidos"
                value={stats.overdue_loans}
                icon={AlertTriangle}
                color="text-red-600"
                bgColor="bg-red-50"
                href="/loans?vencidos=true"
              />
            </div>
          )}
        </div>

        {/* Acciones rápidas */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Acciones Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <QuickActionCard
              title="Gestionar Libros"
              description="Agregar, editar o eliminar libros del catálogo"
              icon={BookOpen}
              href="/books"
              color="text-blue-600"
            />
            <QuickActionCard
              title="Gestionar Usuarios"
              description="Administrar usuarios del sistema"
              icon={Users}
              href="/users"
              color="text-green-600"
            />
            <QuickActionCard
              title="Nuevo Préstamo"
              description="Registrar un nuevo préstamo de libros"
              icon={Plus}
              href="/loans"
              color="text-orange-600"
            />
            <QuickActionCard
              title="Ver Préstamos"
              description="Consultar y gestionar préstamos existentes"
              icon={ArrowLeft}
              href="/loans"
              color="text-purple-600"
            />
            <QuickActionCard
              title="Estadísticas"
              description="Ver reportes y métricas del sistema"
              icon={BarChart3}
              href="/statistics"
              color="text-indigo-600"
            />
            <QuickActionCard
              title="Buscar"
              description="Buscar libros, usuarios o préstamos"
              icon={Search}
              href="/books"
              color="text-gray-600"
            />
          </div>
        </div>

        {/* Alertas importantes */}
        {stats.overdue_loans > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Alertas Importantes
            </h3>
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                  <div>
                    <p className="font-medium text-red-800">
                      Tienes {stats.overdue_loans} préstamo{stats.overdue_loans > 1 ? 's' : ''} vencido{stats.overdue_loans > 1 ? 's' : ''}
                    </p>
                    <p className="text-sm text-red-600">
                      Revisa los préstamos vencidos para realizar el seguimiento correspondiente.
                    </p>
                  </div>
                  <Link href="/loans?vencidos=true">
                    <Button variant="outline" size="sm" className="text-red-600 border-red-300">
                      Ver Préstamos Vencidos
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Información del sistema */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Información del Sistema</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Sistema de Biblioteca
                </CardTitle>
                <CardDescription>
                  Gestión completa de libros, usuarios y préstamos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p><strong>Versión:</strong> 1.0.0</p>
                  <p><strong>Última actualización:</strong> {new Date().toLocaleDateString('es-ES')}</p>
                  <p><strong>Estado:</strong> <span className="text-green-600">Operativo</span></p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Actividad Reciente
                </CardTitle>
                <CardDescription>
                  Últimas actividades del sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p>• Sistema iniciado correctamente</p>
                  <p>• Base de datos conectada</p>
                  <p>• API funcionando normalmente</p>
                  <p>• Todas las funcionalidades disponibles</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default DashboardLibrary;
