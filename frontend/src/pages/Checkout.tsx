import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, CreditCard, Smartphone, Minus, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type CartItem = {
  product: {
    id: number;
    name: string;
    price: number;
    image: string;
    category: string;
    available: boolean;
    description?: string;
  };
  quantity: number;
};

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [isProcessing, setIsProcessing] = useState(false);
  const [observacoes, setObservacoes] = useState("");

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const cartStorageKey = "app.cart";

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(cartStorageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[];
        if (Array.isArray(parsed)) {
          setCartItems(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Persist any change back to localStorage
  useEffect(() => {
    try {
      window.localStorage.setItem(cartStorageKey, JSON.stringify(cartItems));
    } catch {
      // ignore
    }
  }, [cartItems]);

  const subtotal = useMemo(() => cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0), [cartItems]);
  const total = subtotal;

  const updateItemQuantity = (index: number, delta: number) => {
    setCartItems(items => {
      const updated = items.map((it, i) => i === index ? { ...it, quantity: Math.max(0, it.quantity + delta) } : it);
      return updated.filter(it => it.quantity > 0);
    });
  };

  const removeItem = (index: number) => {
    setCartItems(items => items.filter((_, i) => i !== index));
  };

  const handleConfirmOrder = async () => {
    if (!user) {
      toast.error("Você precisa estar logado para fazer um pedido");
      navigate("/auth");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Seu carrinho está vazio");
      return;
    }

    setIsProcessing(true);

    try {
      // Preparar dados do pedido
      const itensCarrinho = cartItems.map(item => ({
        produto_id: item.product.id,
        quantidade: item.quantity
      }));

      // Criar pedido na API
      const response = await api.createOrder({
        itens_carrinho: itensCarrinho,
        observacoes: observacoes.trim() || undefined
      });

      toast.success(`Pedido #${response.pedido.id} criado com sucesso! 🎉`);

      // Limpar carrinho
      setCartItems([]);
      window.localStorage.removeItem(cartStorageKey);

      // Redirecionar para página de pedidos
      navigate("/menu?tab=orders");

    } catch (error: any) {
      console.error('Erro ao criar pedido:', error);
      toast.error(error.message || "Erro ao processar pedido. Tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/menu")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Finalizar Pedido</h1>
              <p className="text-sm text-muted-foreground">Revise seu pedido e escolha o pagamento</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Summary */}
          <Card className="border-0 shadow-md animate-fade-in">
            <CardHeader>
              <CardTitle>Resumo do Pedido</CardTitle>
              <CardDescription>Revise os itens selecionados</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItems.length === 0 && (
                <p className="text-sm text-muted-foreground">Seu carrinho está vazio.</p>
              )}
              {cartItems.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-border last:border-0 gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 flex items-center justify-center">
                        {item.product.image.startsWith('data:') || item.product.image.startsWith('blob:') || item.product.image.startsWith('/') ? (
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-8 h-8 object-cover rounded"
                          />
                        ) : (
                          <span className="text-lg">{item.product.image}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium truncate">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">{item.product.category}</p>
                      </div>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateItemQuantity(index, -1)} disabled={item.quantity <= 1}>
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <Button size="icon" className="h-7 w-7" onClick={() => updateItemQuantity(index, 1)}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-semibold whitespace-nowrap">R$ {(item.product.price * item.quantity).toFixed(2)}</p>
                    <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => removeItem(index)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              <div className="pt-4 space-y-2">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>R$ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-primary">
                  <span>Total</span>
                  <span>R$ {total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card className="border-0 shadow-md animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <CardHeader>
              <CardTitle>Forma de Pagamento</CardTitle>
              <CardDescription>Selecione como deseja pagar</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                <div className="flex items-start space-x-3 p-4 rounded-lg border-2 border-border hover:border-primary transition-colors cursor-pointer">
                  <RadioGroupItem value="pix" id="pix" />
                  <Label htmlFor="pix" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Smartphone className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">PIX</p>
                        <p className="text-sm text-muted-foreground">Pagamento instantâneo</p>
                      </div>
                    </div>
                  </Label>
                </div>

                <div className="flex items-start space-x-3 p-4 rounded-lg border-2 border-border hover:border-primary transition-colors cursor-pointer">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">Cartão de Crédito/Débito</p>
                        <p className="text-sm text-muted-foreground">Todas as bandeiras</p>
                      </div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>

              {/* Observações */}
              <div className="mt-6 space-y-2">
                <Label htmlFor="observacoes" className="text-sm font-medium">
                  Observações (opcional)
                </Label>
                <Textarea
                  id="observacoes"
                  placeholder="Alguma observação especial para seu pedido?"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>

              <Button
                className="w-full mt-6"
                size="lg"
                onClick={handleConfirmOrder}
                disabled={isProcessing || cartItems.length === 0}
              >
                {isProcessing ? "Processando..." : "Confirmar Pedido"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Order Status Info */}
        <Card className="border-0 shadow-md mt-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">📱</span>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Acompanhe seu pedido</h3>
                <p className="text-sm text-muted-foreground">
                  Após confirmar, você poderá acompanhar o status do seu pedido em tempo real. 
                  Você será notificado quando ele estiver pronto para retirada!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Checkout;
