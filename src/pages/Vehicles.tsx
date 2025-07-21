import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Home } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Vehicle {
  id: string;
  plate: string;
  model: string;
  year: number;
  type: 'car' | 'van' | 'motorcycle' | 'truck';
  current_odometer: number;
}

const Vehicles = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVehicles(data || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os veículos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteVehicle = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este veículo?')) return;

    try {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setVehicles(vehicles.filter(v => v.id !== id));
      toast({
        title: "Sucesso",
        description: "Veículo excluído com sucesso.",
      });
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o veículo.",
        variant: "destructive",
      });
    }
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      car: 'Carro',
      van: 'Van',
      motorcycle: 'Motocicleta',
      truck: 'Caminhão'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getTypeVariant = (type: string) => {
    const variants = {
      car: 'default',
      van: 'secondary',
      motorcycle: 'outline',
      truck: 'destructive'
    };
    return variants[type as keyof typeof variants] || 'default';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6">
          <div className="text-center">Carregando veículos...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Button
            variant="outline"
            asChild
            className="mb-4"
          >
            <Link to="/dashboard">
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </Button>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Veículos</h1>
            <p className="text-muted-foreground">
              Gerencie os veículos da sua frota
            </p>
          </div>
          <Button asChild>
            <Link to="/vehicles/new">
              <Plus className="mr-2 h-4 w-4" />
              Novo Veículo
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Veículos</CardTitle>
          </CardHeader>
          <CardContent>
            {vehicles.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Nenhum veículo cadastrado ainda.
                </p>
                <Button asChild>
                  <Link to="/vehicles/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Cadastrar Primeiro Veículo
                  </Link>
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Placa</TableHead>
                    <TableHead>Modelo</TableHead>
                    <TableHead>Ano</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Hodômetro</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicles.map((vehicle) => (
                    <TableRow key={vehicle.id}>
                      <TableCell className="font-medium">
                        {vehicle.plate}
                      </TableCell>
                      <TableCell>{vehicle.model}</TableCell>
                      <TableCell>{vehicle.year}</TableCell>
                      <TableCell>
                        <Badge variant={getTypeVariant(vehicle.type) as any}>
                          {getTypeLabel(vehicle.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {vehicle.current_odometer.toLocaleString()} km
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                          >
                            <Link to={`/vehicles/edit/${vehicle.id}`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteVehicle(vehicle.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Vehicles;