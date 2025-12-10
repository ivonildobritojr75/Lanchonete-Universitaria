import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Trash2, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type User = {
  id: number;
  name: string;
  email: string;
  role: "client" | "attendant" | "manager";
};

const Permissions = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([
    { id: 1, name: "João Silva", email: "joao@email.com", role: "client" },
    { id: 2, name: "Maria Santos", email: "maria@email.com", role: "attendant" },
    { id: 3, name: "Pedro Oliveira", email: "pedro@email.com", role: "manager" },
    { id: 4, name: "Ana Costa", email: "ana@email.com", role: "client" },
    { id: 5, name: "Carlos Souza", email: "carlos@email.com", role: "attendant" },
  ]);

  const roleLabels = {
    client: { label: "Cliente", color: "bg-muted" },
    attendant: { label: "Atendente", color: "bg-accent" },
    manager: { label: "Gerente", color: "bg-primary" }
  };

  const handleDelete = (id: number) => {
    setUsers(users.filter(user => user.id !== id));
    toast.success("Usuário removido com sucesso");
  };

  const roleStats = {
    client: users.filter(u => u.role === "client").length,
    attendant: users.filter(u => u.role === "attendant").length,
    manager: users.filter(u => u.role === "manager").length,
  };

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
                <h1 className="text-2xl font-bold">Permissões de Usuários</h1>
                <p className="text-sm text-muted-foreground">Gerencie acessos e níveis de permissão</p>
              </div>
            </div>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Adicionar Usuário
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-md animate-fade-in">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Clientes</p>
                  <p className="text-3xl font-bold">{roleStats.client}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-2xl">👤</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Atendentes</p>
                  <p className="text-3xl font-bold">{roleStats.attendant}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                  <span className="text-2xl">👥</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Gerentes</p>
                  <p className="text-3xl font-bold">{roleStats.manager}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-2xl">⭐</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card className="border-0 shadow-md animate-slide-up">
          <CardHeader>
            <CardTitle>Lista de Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {users.map((user, index) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                      {user.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <Badge className={roleLabels[user.role].color}>
                      {roleLabels[user.role].label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => toast.info("Funcionalidade em desenvolvimento")}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDelete(user.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Permissions;
