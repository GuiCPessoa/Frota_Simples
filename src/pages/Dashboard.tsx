import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Truck, Users, Plus, Settings } from 'lucide-react';

interface Stats {
  vehicles: number;
  suppliers: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({ vehicles: 0, suppliers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [vehiclesRes, suppliersRes] = await Promise.all([
        supabase.from('vehicles').select('id', { count: 'exact', head: true }),
        supabase.from('suppliers').select('id', { count: 'exact', head: true })
      ]);

      setStats({
        vehicles: vehiclesRes.count || 0,
        suppliers: suppliersRes.count || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Bem-vindo ao FrotaSimples, {user?.email}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Veículos</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : stats.vehicles}
              </div>
              <p className="text-xs text-muted-foreground">
                Total de veículos cadastrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fornecedores</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : stats.suppliers}
              </div>
              <p className="text-xs text-muted-foreground">
                Fornecedores cadastrados
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild className="w-full justify-start">
                <Link to="/vehicles/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Cadastrar Veículo
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link to="/suppliers/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Cadastrar Fornecedor
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link to="/vehicles">
                  <Truck className="mr-2 h-4 w-4" />
                  Ver Todos os Veículos
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link to="/suppliers">
                  <Users className="mr-2 h-4 w-4" />
                  Ver Fornecedores
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configurações</CardTitle>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link to="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Configurações da Conta
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;