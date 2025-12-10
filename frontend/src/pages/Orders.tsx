import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Clock, CheckCircle, XCircle, ChefHat } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type Order = {
  id: number;
  usuario_id: number;
  status: string;
  total: number;
  observacoes?: string;
  criado_em: string;
  atualizado_em: string;
  itens: Array<{
    id: number;
    pedido_id: number;
    produto_id: number;
    quantidade: number;
    preco_unitario: number;
    total_item: number;
    criado_em: string;
    produto?: {
      id: number;
      nome: string;
      imagem?: string;
      categoria: string;
    };
  }>;
};

const Orders = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Verificar se usuário tem permissão
  const canManageOrders = role === "attendant" || role === "manager";

  useEffect(() => {
    if (!canManageOrders) {
      navigate("/dashboard");
      return;
    }

    loadOrders();
  }, [canManageOrders, statusFilter]);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const filters: any = {};
      if (statusFilter !== "all") {
        filters.status = statusFilter;
      }
      const response = await api.getOrders(filters);
      setOrders(response.pedidos);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
      toast.error('Erro ao carregar pedidos');
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      toast.success('Status do pedido atualizado!');
      loadOrders(); // Recarregar pedidos
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error);
      toast.error(error.message || 'Erro ao atualizar status');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'em_andamento':
        return <Clock className="w-4 h-4" />;
      case 'preparando':
        return <ChefHat className="w-4 h-4" />;
      case 'pronto':
        return <CheckCircle className="w-4 h-4" />;
      case 'finalizado':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelado':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'em_andamento':
        return 'default';
      case 'preparando':
        return 'secondary';
      case 'pronto':
        return 'outline';
      case 'finalizado':
        return 'default';
      case 'cancelado':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'em_andamento':
        return 'Em Andamento';
      case 'preparando':
        return 'Preparando';
      case 'pronto':
        return 'Pronto';
      case 'finalizado':
        return 'Finalizado';
      case 'cancelado':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const getNextStatus = (currentStatus: string) => {
    // Para manager: apenas opções de finalizar ou cancelar
    const managerOptions = ['finalizado', 'cancelado'];

    // Filtrar apenas as opções disponíveis (não pode cancelar pedidos já finalizados/cancelados)
    return managerOptions.filter(status => {
      if (currentStatus === 'finalizado' || currentStatus === 'cancelado') {
        return false; // Não permite alterar status final
      }
      return true;
    });
  };

  if (!canManageOrders) {
    return null;
  }

  return (
    <div className="min-h-screen bg-secondary">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Gerenciar Pedidos</h1>
                <p className="text-sm text-muted-foreground">Acompanhe e atualize o status dos pedidos</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Filtros */}
        <div className="mb-6">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os pedidos</SelectItem>
              <SelectItem value="em_andamento">Em Andamento</SelectItem>
              <SelectItem value="preparando">Preparando</SelectItem>
              <SelectItem value="pronto">Pronto</SelectItem>
              <SelectItem value="finalizado">Finalizado</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Lista de Pedidos */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <Card key={index} className="border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                      </div>
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="py-10 text-center text-muted-foreground">
              <div className="mb-4">
                <span className="text-4xl">📋</span>
              </div>
              <p className="font-medium">Nenhum pedido encontrado</p>
              <p className="text-sm">Não há pedidos com o filtro selecionado.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="border-0 shadow-md">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {getStatusIcon(order.status)}
                        Pedido #{order.id}
                      </CardTitle>
                      <CardDescription>
                        Cliente ID: {order.usuario_id} •
                        {new Date(order.criado_em).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">R$ {order.total.toFixed(2)}</p>
                      <Badge variant={getStatusColor(order.status)}>
                        {getStatusText(order.status)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Itens do pedido */}
                    <div className="space-y-2">
                      <h4 className="font-medium">Itens do Pedido:</h4>
                      {order.itens.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 py-2 px-3 bg-gray-50 rounded">
                          <div className="w-8 h-8 flex items-center justify-center">
                            {item.produto?.imagem?.startsWith('data:') || item.produto?.imagem?.startsWith('blob:') || item.produto?.imagem?.startsWith('/') ? (
                              <img
                                src={item.produto.imagem}
                                alt={item.produto?.nome || 'Produto'}
                                className="w-8 h-8 object-cover rounded"
                              />
                            ) : (
                              <span className="text-lg">{item.produto?.imagem || '🍽️'}</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <span className="font-medium">{item.quantidade}x {item.produto?.nome || `Produto #${item.produto_id}`}</span>
                            <p className="text-xs text-muted-foreground">{item.produto?.categoria || 'Categoria'}</p>
                          </div>
                          <span className="font-medium">R$ {item.total_item.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Observações */}
                    {order.observacoes && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-sm font-medium text-blue-800 mb-1">Observações:</p>
                        <p className="text-sm text-blue-700">{order.observacoes}</p>
                      </div>
                    )}

                    {/* Ações */}
                    <div className="flex gap-2 pt-4 border-t">
                      {getNextStatus(order.status).map((nextStatus) => (
                        <Button
                          key={nextStatus}
                          size="sm"
                          variant={nextStatus === 'cancelado' ? 'destructive' : 'default'}
                          onClick={() => updateOrderStatus(order.id, nextStatus)}
                        >
                          {nextStatus === 'finalizado' && 'Finalizar Pedido'}
                          {nextStatus === 'cancelado' && 'Cancelar Pedido'}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Orders;
