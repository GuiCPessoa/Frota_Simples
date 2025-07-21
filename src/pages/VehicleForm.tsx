import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Home } from 'lucide-react';

const formSchema = z.object({
  plate: z.string().min(1, 'Placa é obrigatória'),
  model: z.string().min(1, 'Modelo é obrigatório'),
  year: z.number().min(1990, 'Ano deve ser maior que 1990').max(new Date().getFullYear() + 1),
  type: z.enum(['car', 'van', 'motorcycle', 'truck'], {
    required_error: 'Tipo é obrigatório',
  }),
  current_odometer: z.number().min(0, 'Hodômetro deve ser maior ou igual a 0'),
});

type FormData = z.infer<typeof formSchema>;

const VehicleForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const isEditing = !!id;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      plate: '',
      model: '',
      year: new Date().getFullYear(),
      type: 'car',
      current_odometer: 0,
    },
  });

  useEffect(() => {
    if (isEditing) {
      fetchVehicle();
    }
  }, [id, isEditing]);

  const fetchVehicle = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        form.reset({
          plate: data.plate,
          model: data.model,
          year: data.year,
          type: data.type,
          current_odometer: data.current_odometer,
        });
      }
    } catch (error) {
      console.error('Error fetching vehicle:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do veículo.",
        variant: "destructive",
      });
      navigate('/vehicles');
    }
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);

    try {
      if (isEditing) {
        const { error } = await supabase
          .from('vehicles')
          .update(data)
          .eq('id', id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Veículo atualizado com sucesso.",
        });
      } else {
        // Get user's account_id first
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('account_id')
          .eq('id', (await supabase.auth.getUser()).data.user?.id)
          .single();

        if (userError || !userData?.account_id) {
          throw new Error('Usuário deve estar associado a uma conta');
        }

        const vehicleData = {
          plate: data.plate,
          model: data.model,
          year: data.year,
          type: data.type,
          current_odometer: data.current_odometer,
          account_id: userData.account_id
        };

        const { error } = await supabase
          .from('vehicles')
          .insert(vehicleData);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Veículo cadastrado com sucesso.",
        });
      }

      navigate('/vehicles');
    } catch (error: any) {
      console.error('Error saving vehicle:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível salvar o veículo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <div className="flex space-x-2 mb-4">
            <Button
              variant="outline"
              onClick={() => navigate('/vehicles')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
            >
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </div>
          <h1 className="text-3xl font-bold mb-2">
            {isEditing ? 'Editar Veículo' : 'Novo Veículo'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Atualize os dados do veículo' : 'Cadastre um novo veículo na frota'}
          </p>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>
              {isEditing ? 'Dados do Veículo' : 'Cadastro de Veículo'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="plate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Placa</FormLabel>
                      <FormControl>
                        <Input placeholder="ABC-1234" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modelo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Honda Civic" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ano</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Veículo</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="car">Carro</SelectItem>
                          <SelectItem value="van">Van</SelectItem>
                          <SelectItem value="motorcycle">Motocicleta</SelectItem>
                          <SelectItem value="truck">Caminhão</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="current_odometer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hodômetro Atual (km)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex space-x-4">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Cadastrar')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/vehicles')}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VehicleForm;