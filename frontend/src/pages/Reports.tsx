import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Download, TrendingUp, DollarSign, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

type Product = {
  id: number;
  name: string;
  price: number;
  category: string;
  available: boolean;
  image: string;
};

const Reports = () => {
  const navigate = useNavigate();
  const [menuProducts, setMenuProducts] = useState<Product[]>([]);

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

  const salesData = [
    { day: "Segunda", sales: 45, revenue: 892.50 },
    { day: "Terça", sales: 52, revenue: 1048.00 },
    { day: "Quarta", sales: 38, revenue: 756.20 },
    { day: "Quinta", sales: 61, revenue: 1224.30 },
    { day: "Sexta", sales: 73, revenue: 1468.90 },
  ];

  // Generate mock sales data for current menu products
  const topProducts = menuProducts.slice(0, 4).map((product, index) => ({
    name: product.name,
    quantity: Math.floor(Math.random() * 100) + 50, // Random quantity between 50-150
    revenue: product.price * (Math.floor(Math.random() * 100) + 50) // Random revenue based on price
  }));

  const totalRevenue = salesData.reduce((sum, day) => sum + day.revenue, 0);
  const totalSales = salesData.reduce((sum, day) => sum + day.sales, 0);
  const avgTicket = totalRevenue / totalSales;

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
                <h1 className="text-2xl font-bold">Relatórios</h1>
                <p className="text-sm text-muted-foreground">Análise de vendas e arrecadação</p>
              </div>
            </div>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-md animate-fade-in">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Arrecadação Total
                </CardTitle>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">R$ {totalRevenue.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground mt-1">Últimos 5 dias</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total de Vendas
                </CardTitle>
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-accent" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{totalSales}</p>
              <p className="text-sm text-muted-foreground mt-1">Pedidos realizados</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Ticket Médio
                </CardTitle>
                <div className="w-10 h-10 rounded-full bg-primary-light/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary-light" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">R$ {avgTicket.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground mt-1">Por pedido</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales by Day */}
          <Card className="border-0 shadow-md animate-slide-up">
            <CardHeader>
              <CardTitle>Vendas por Dia</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {salesData.map((day, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{day.day}</span>
                      <div className="text-right">
                        <p className="font-semibold">R$ {day.revenue.toFixed(2)}</p>
                        <p className="text-muted-foreground">{day.sales} pedidos</p>
                      </div>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{
                          width: `${(day.revenue / Math.max(...salesData.map(d => d.revenue))) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card className="border-0 shadow-md animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <CardHeader>
              <CardTitle>Produtos Mais Vendidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.length > 0 ? (
                  topProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.quantity} unidades</p>
                      </div>
                      <p className="font-semibold text-primary">R$ {product.revenue.toFixed(2)}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">Nenhum produto no cardápio ainda</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Reports;
