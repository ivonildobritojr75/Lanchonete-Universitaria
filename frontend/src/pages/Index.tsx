import { Button } from "@/components/ui/button";
import { UtensilsCrossed, ShoppingBag, Package, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: ShoppingBag,
      title: "Pedidos Rápidos",
      description: "Sistema ágil para pedidos presenciais e online"
    },
    {
      icon: Package,
      title: "Controle de Estoque",
      description: "Gerencie produtos e receba alertas automáticos"
    },
    {
      icon: BarChart3,
      title: "Relatórios Completos",
      description: "Análise detalhada de vendas e arrecadação"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto animate-fade-in">
          <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mb-6 hover-glow animate-pulse-glow">
            <UtensilsCrossed className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
            Campus Lanches
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-4">
            Sistema de Gestão para Lanchonetes Universitárias
          </p>
          
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl">
            Controle completo de pedidos, estoque e relatórios em uma plataforma moderna e intuitiva
          </p>
          
          <div className="flex gap-4 flex-wrap justify-center">
            <Button size="lg" className="text-lg px-8" onClick={() => navigate("/auth")}>
              Acessar Sistema
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8" onClick={() => navigate("/menu")}>
              Ver Cardápio
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="text-center p-8 rounded-2xl bg-card border-0 shadow-md hover-lift animate-slide-up"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-6">
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center max-w-3xl mx-auto p-8 rounded-2xl bg-card border-0 shadow-lg animate-fade-in">
          <h2 className="text-3xl font-bold mb-4">Pronto para começar?</h2>
          <p className="text-lg text-muted-foreground mb-6">
            Entre agora e experimente a melhor plataforma de gestão para lanchonetes universitárias
          </p>
          <Button size="lg" className="text-lg px-12" onClick={() => navigate("/auth")}>
            Começar Agora
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
