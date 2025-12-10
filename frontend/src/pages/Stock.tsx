import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Minus, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

type StockItem = {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  minQuantity: number;
};

const Stock = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const canManage = role === "attendant" || role === "manager";
  const [stockItems, setStockItems] = useState<StockItem[]>([
    { id: 1, name: "Pão de Hambúrguer", quantity: 45, unit: "unidades", minQuantity: 20 },
    { id: 2, name: "Carne Bovina", quantity: 8, unit: "kg", minQuantity: 10 },
    { id: 3, name: "Queijo Cheddar", quantity: 3, unit: "kg", minQuantity: 5 },
    { id: 4, name: "Alface", quantity: 25, unit: "unidades", minQuantity: 15 },
    { id: 5, name: "Tomate", quantity: 18, unit: "kg", minQuantity: 10 },
    { id: 6, name: "Batata", quantity: 22, unit: "kg", minQuantity: 15 },
    { id: 7, name: "Refrigerante Lata", quantity: 48, unit: "unidades", minQuantity: 30 },
    { id: 8, name: "Maionese", quantity: 6, unit: "kg", minQuantity: 5 },
  ]);

  const storageKey = "app.stockItems";

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as StockItem[];
        if (Array.isArray(parsed)) setStockItems(parsed);
      }
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(stockItems));
    } catch {
      // ignore
    }
  }, [stockItems]);

  const updateQuantity = (id: number, delta: number) => {
    setStockItems(items =>
      items.map(item => {
        if (item.id === id) {
          const newQuantity = Math.max(0, item.quantity + delta);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
    toast.success("Estoque atualizado");
  };

  const addItem = () => {
    const name = window.prompt("Nome do ingrediente:");
    if (!name) return;
    const quantityStr = window.prompt("Quantidade inicial:", "0");
    if (quantityStr === null) return;
    const quantity = Math.max(0, Number(quantityStr));
    if (Number.isNaN(quantity)) {
      toast.error("Quantidade inválida");
      return;
    }
    const unit = window.prompt("Unidade (ex: kg, unidades):", "unidades") || "unidades";
    const minStr = window.prompt("Quantidade mínima:", "10");
    if (minStr === null) return;
    const minQuantity = Math.max(0, Number(minStr));
    if (Number.isNaN(minQuantity)) {
      toast.error("Mínimo inválido");
      return;
    }
    const newItem: StockItem = {
      id: stockItems.length ? Math.max(...stockItems.map(i => i.id)) + 1 : 1,
      name,
      quantity,
      unit,
      minQuantity,
    };
    setStockItems([newItem, ...stockItems]);
    toast.success("Ingrediente adicionado");
  };

  const editItem = (id: number) => {
    const item = stockItems.find(i => i.id === id);
    if (!item) return;
    const name = window.prompt("Editar nome:", item.name) || item.name;
    const quantityStr = window.prompt("Editar quantidade:", String(item.quantity)) || String(item.quantity);
    const quantity = Math.max(0, Number(quantityStr));
    if (Number.isNaN(quantity)) {
      toast.error("Quantidade inválida");
      return;
    }
    const unit = window.prompt("Editar unidade:", item.unit) || item.unit;
    const minStr = window.prompt("Editar mínimo:", String(item.minQuantity)) || String(item.minQuantity);
    const minQuantity = Math.max(0, Number(minStr));
    if (Number.isNaN(minQuantity)) {
      toast.error("Mínimo inválido");
      return;
    }
    setStockItems(items => items.map(i => i.id === id ? { ...i, name, quantity, unit, minQuantity } : i));
    toast.success("Ingrediente atualizado");
  };

  const deleteItem = (id: number) => {
    if (!window.confirm("Deseja remover este ingrediente?")) return;
    setStockItems(items => items.filter(i => i.id !== id));
    toast.success("Ingrediente removido");
  };

  const lowStockItems = stockItems.filter(item => item.quantity < item.minQuantity);

  return (
    <div className="min-h-screen bg-secondary">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Controle de Estoque</h1>
              <p className="text-sm text-muted-foreground">Gerencie produtos e quantidades</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Alert for low stock */}
        {lowStockItems.length > 0 && (
          <Card className="border-destructive bg-destructive/5 mb-6 animate-fade-in">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-destructive mb-1">
                    Atenção: {lowStockItems.length} produto(s) com estoque baixo
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Os seguintes itens precisam de reposição: {lowStockItems.map(item => item.name).join(", ")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Toolbar */}
        {canManage && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Input placeholder="Buscar ingrediente... (em breve)" className="max-w-xs" disabled />
            </div>
            <Button onClick={addItem}>Adicionar ingrediente</Button>
          </div>
        )}

        {/* Stock Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stockItems.map((item, index) => (
            <Card
              key={item.id}
              className={`border-0 shadow-md hover-lift animate-slide-up ${
                item.quantity < item.minQuantity ? "ring-2 ring-destructive" : ""
              }`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                  {item.quantity < item.minQuantity && (
                    <Badge variant="destructive">Baixo</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Mínimo: {item.minQuantity} {item.unit}
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-3xl font-bold text-primary">{item.quantity}</p>
                    <p className="text-sm text-muted-foreground">{item.unit}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => updateQuantity(item.id, -1)}
                      disabled={item.quantity === 0}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      onClick={() => updateQuantity(item.id, 1)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      item.quantity < item.minQuantity ? "bg-destructive" : "bg-primary"
                    }`}
                    style={{
                      width: `${Math.min(100, (item.quantity / (item.minQuantity * 2)) * 100)}%`
                    }}
                  />
                </div>

                {canManage && (
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => editItem(item.id)}>Editar</Button>
                    <Button variant="destructive" className="flex-1" onClick={() => deleteItem(item.id)}>Excluir</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Stock;
