import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingBag,
  Package,
  BarChart3,
  Users,
  UtensilsCrossed,
  LogOut,
  Clock,
  Phone,
  MapPin,
  Star,
  CheckCircle,
  ChefHat,
  Calendar
} from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { Home, Receipt, User as UserIcon, Menu as MenuIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Product = {
  id: number;
  name: string;
  price: number;
  category: string;
  available: boolean;
  image: string;
};

type Order = {
  id: number;
  status: string;
  total: number;
  criado_em: string;
  itens: Array<{
    id: number;
    produto?: {
      nome: string;
      imagem?: string;
      categoria: string;
    };
    quantidade: number;
    preco_unitario: number;
  }>;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { role, setRole, user } = useAuth();
  const userName = user?.nome || (role === "manager" ? "Pedro" : role === "attendant" ? "Maria" : "João");
  const [menuProducts, setMenuProducts] = useState<Product[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Load menu products from localStorage
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("app.menuProducts");
      if (stored) {
        const products = JSON.parse(stored) as Product[];
        if (Array.isArray(products)) {
          setMenuProducts(products);
        }
      }
    } catch {
      // ignore malformed data
    }
  }, []);

  // Load recent orders for clients
  useEffect(() => {
    if (role === 'client' && user) {
      loadRecentOrders();
    }
  }, [role, user]);

  const loadRecentOrders = async () => {
    try {
      setIsLoadingOrders(true);
      const response = await api.getOrders({ limit: 3 });
      setRecentOrders(response.pedidos);
    } catch (error) {
      console.error('Erro ao carregar pedidos recentes:', error);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  // Controlar visibilidade do header baseado no scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Se estiver scrollando para baixo e passou de 100px, esconder header
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsHeaderVisible(false);
      }
      // Se estiver scrollando para cima, mostrar header
      else if (currentScrollY < lastScrollY) {
        setIsHeaderVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  if (!role) {
    // If not logged in, send the user to the auth page
    return <Navigate to="/auth" replace />;
  }

  const quickActions = [
    {
      title: "Fazer Pedido",
      description: "Visualize o cardápio e faça seu pedido",
      icon: ShoppingBag,
      color: "bg-primary",
      route: "/menu"
    },
    {
      title: "Meus Pedidos",
      description: "Acompanhe seus pedidos atuais",
      icon: Receipt,
      color: "bg-blue-500",
      route: "/menu?tab=orders"
    },
    {
      title: "Estoque",
      description: "Gerencie produtos e quantidades",
      icon: Package,
      color: "bg-accent",
      route: "/stock"
    },
    {
      title: "Pedidos",
      description: "Gerencie pedidos e status",
      icon: Receipt,
      color: "bg-orange-500",
      route: "/orders"
    },
    {
      title: "Relatórios",
      description: "Visualize vendas e arrecadação",
      icon: BarChart3,
      color: "bg-primary-light",
      route: "/reports"
    },
    {
      title: "Permissões",
      description: "Gerencie usuários e acessos",
      icon: Users,
      color: "bg-muted-foreground",
      route: "/permissions"
    }
  ];

  const allowedByRole = quickActions.filter(action => {
    if (role === "client") {
      // Clientes veem apenas as opções relevantes
      return ["/menu", "/menu?tab=orders"].includes(action.route);
    }
    // attendants and managers see all, but orders is only for attendants/managers
    if (action.route === "/orders" && role === "client") {
      return false;
    }
    return true;
  });

  const handleLogout = () => {
    setRole(null);
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-secondary">
      {/* Header */}
      <header className={`bg-card border-b border-border sticky top-0 z-10 shadow-sm transition-transform duration-300 ${
        isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Campus Lanches</h1>
              <p className="text-xs text-muted-foreground">Sistema de Gestão</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="h-8 text-xs">
            <LogOut className="w-4 h-4 mr-1" />
            Sair
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 pb-24">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <h2 className="text-3xl font-bold mb-2">Olá, {userName}! 👋</h2>
          <p className="text-muted-foreground">
            {role === 'client'
              ? "Bem-vindo ao Campus Lanches! Explore nosso cardápio e faça seu pedido."
              : "Seja bem-vindo ao Campus Lanches!"
            }
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {allowedByRole.map((action, index) => (
            <Card
              key={action.title}
              className="cursor-pointer hover-lift hover-glow border-0 shadow-md animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => navigate(action.route)}
            >
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-3`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg">{action.title}</CardTitle>
                <CardDescription>{action.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Client-specific sections */}
        {role === 'client' && (
          <>
            {/* Recent Orders */}
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Pedidos Recentes
              </h3>
              {isLoadingOrders ? (
                <div className="space-y-4">
                  {Array.from({ length: 2 }).map((_, index) => (
                    <Card key={index} className="border-0 shadow-md">
                      <CardContent className="p-4">
                        <div className="animate-pulse space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                              <div className="h-4 bg-gray-200 rounded w-32"></div>
                              <div className="h-3 bg-gray-200 rounded w-24"></div>
                            </div>
                            <div className="h-6 bg-gray-200 rounded w-20"></div>
                          </div>
                          <div className="h-3 bg-gray-200 rounded w-full"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : recentOrders.length > 0 ? (
                <div className="space-y-4">
                  {recentOrders.slice(0, 3).map((order) => (
                    <Card key={order.id} className="border-0 shadow-md">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold">Pedido #{order.id}</h4>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.criado_em).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          <Badge
                            variant={
                              order.status === "em_andamento" ? "default" :
                              order.status === "preparando" ? "secondary" :
                              order.status === "pronto" ? "outline" :
                              order.status === "finalizado" ? "default" :
                              "destructive"
                            }
                          >
                            {order.status === "em_andamento" ? "Em Andamento" :
                             order.status === "preparando" ? "Preparando" :
                             order.status === "pronto" ? "Pronto" :
                             order.status === "finalizado" ? "Finalizado" :
                             "Cancelado"}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            {order.itens.length} item{order.itens.length !== 1 ? 's' : ''}
                          </span>
                          <span className="font-bold text-primary">R$ {order.total.toFixed(2)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {recentOrders.length >= 3 && (
                    <Button variant="outline" onClick={() => navigate("/menu?tab=orders")} className="w-full">
                      Ver Todos os Pedidos
                    </Button>
                  )}
                </div>
              ) : (
                <Card className="border-0 shadow-md">
                  <CardContent className="py-8 text-center">
                    <Receipt className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h4 className="font-medium mb-2">Nenhum pedido ainda</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Você ainda não fez nenhum pedido. Que tal explorar nosso cardápio?
                    </p>
                    <Button onClick={() => navigate("/menu")}>
                      Ver Cardápio
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Store Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Opening Hours */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg">Horário de Funcionamento</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Segunda - Sexta:</span>
                      <span>08:00 - 18:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sábado:</span>
                      <span>08:00 - 16:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Domingo:</span>
                      <span>Fechado</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Info */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Phone className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg">Contato</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>(11) 99999-9999</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>Campus Universitário</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg">Sobre Nós</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground">
                      Lanchonete universitária com foco em qualidade e rapidez no atendimento.
                    </p>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs text-muted-foreground ml-1">4.8 (120 avaliações)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Most Sold Products */}
        {menuProducts.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4">Produtos do Cardápio</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {menuProducts.slice(0, 6).map((product) => (
                <Card key={product.id} className="border-0 shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 flex items-center justify-center">
                        {product.image.startsWith('data:') || product.image.startsWith('blob:') || product.image.startsWith('/') ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="text-2xl">{product.image}</div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{product.name}</h4>
                        <p className="text-sm text-muted-foreground">{product.category}</p>
                        <p className="text-lg font-bold text-primary">R$ {product.price.toFixed(2)}</p>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${product.available ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Status Cards (hidden for clients) */}
        {(role === "attendant" || role === "manager") && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground font-medium">
                  Pedidos Hoje
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">24</p>
                <p className="text-sm text-muted-foreground mt-1">+12% vs ontem</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground font-medium">
                  Arrecadação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">R$ 1.248,50</p>
                <p className="text-sm text-muted-foreground mt-1">Hoje</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground font-medium">
                  Produtos Baixos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-destructive">3</p>
                <p className="text-sm text-muted-foreground mt-1">Necessitam reposição</p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
        <div className="container mx-auto px-6 py-3 grid grid-cols-3 gap-2 text-center">
          <button className="flex flex-col items-center gap-1 text-primary" onClick={() => navigate("/menu?tab=home")}>
            <Home className="w-5 h-5" />
            <span className="text-sm">Início</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-muted-foreground" onClick={() => navigate("/menu?tab=orders")}>
            <Receipt className="w-5 h-5" />
            <span className="text-sm">Pedidos</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-muted-foreground" onClick={() => navigate("/menu?tab=profile")}>
            <UserIcon className="w-5 h-5" />
            <span className="text-sm">Perfil</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Dashboard;
