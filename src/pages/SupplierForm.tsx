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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  type: z.enum(['fuel', 'repair'], {
    required_error: 'Tipo é obrigatório',
  }),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  address: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const SupplierForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const isEditing = !!id;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      type: 'fuel',
      phone: '',
      email: '',
      address: '',
    },
  });

  useEffect(() => {
    if (isEditing) {
      fetchSupplier();
    }
  }, [id, isEditing]);

  const fetchSupplier = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        form.reset({
          name: data.name,
          type: data.type,
          phone: data.phone || '',
          email: data.email || '',
          address: data.address || '',
        });
      }
    } catch (error) {
      console.error('Error fetching supplier:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do fornecedor.",
        variant: "destructive",
      });
      navigate('/suppliers');
    }
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);

    try {
      // Clean up empty strings
      const cleanData = {
        ...data,
        phone: data.phone || null,
        email: data.email || null,
        address: data.address || null,
      };

      if (isEditing) {
        const { error } = await supabase
          .from('suppliers')
          .update(cleanData)
          .eq('id', id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Fornecedor atualizado com sucesso.",
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

        const supplierData = {
          name: cleanData.name,
          type: cleanData.type,
          phone: cleanData.phone,
          email: cleanData.email,
          address: cleanData.address,
          account_id: userData.account_id
        };

        const { error } = await supabase
          .from('suppliers')
          .insert(supplierData);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Fornecedor cadastrado com sucesso.",
        });
      }

      navigate('/suppliers');
    } catch (error: any) {
      console.error('Error saving supplier:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível salvar o fornecedor.",
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
          <Button
            variant="outline"
            onClick={() => navigate('/suppliers')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold mb-2">
            {isEditing ? 'Editar Fornecedor' : 'Novo Fornecedor'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Atualize os dados do fornecedor' : 'Cadastre um novo fornecedor'}
          </p>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>
              {isEditing ? 'Dados do Fornecedor' : 'Cadastro de Fornecedor'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Posto Shell Centro" {...field} />
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
                      <FormLabel>Tipo de Fornecedor</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="fuel">Posto de Combustível</SelectItem>
                          <SelectItem value="repair">Oficina</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="(11) 99999-9999" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="contato@fornecedor.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço (opcional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Rua, número, bairro, cidade, CEP"
                          className="resize-none"
                          {...field}
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
                    onClick={() => navigate('/suppliers')}
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

export default SupplierForm;