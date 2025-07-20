import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, Shield, BarChart3, Users } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <Truck className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-5xl font-bold mb-6">FrotaSimples</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Sistema completo de gestão de frotas. Controle seus veículos, fornecedores e mantenha tudo organizado em um só lugar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/auth">
                Começar Agora
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/auth">
                Fazer Login
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <Truck className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Gestão de Veículos</CardTitle>
              <CardDescription>
                Cadastre e gerencie todos os veículos da sua frota
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Controle informações como placa, modelo, ano e hodômetro. Mantenha tudo organizado e sempre atualizado.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Fornecedores</CardTitle>
              <CardDescription>
                Cadastre postos de combustível e oficinas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Mantenha um cadastro completo dos seus fornecedores para facilitar o controle de gastos e manutenções.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Relatórios</CardTitle>
              <CardDescription>
                Visualize dados importantes da sua frota
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Tenha uma visão clara dos seus veículos e fornecedores através de relatórios e dashboards intuitivos.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="text-center">
          <CardHeader>
            <CardTitle className="text-2xl">Pronto para começar?</CardTitle>
            <CardDescription>
              Crie sua conta gratuita e comece a gerenciar sua frota hoje mesmo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="lg">
              <Link to="/auth">
                Criar Conta Gratuita
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
