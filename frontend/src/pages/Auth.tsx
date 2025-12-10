import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UtensilsCrossed } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth, UserRole } from "@/context/AuthContext";
import { api, ApiException } from "@/lib/api";

const Auth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { setUser, refreshAuth } = useAuth();
  const [selectedRole, setSelectedRole] = useState<"client"|"attendant"|"manager">("client");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const email = formData.get("login-email") as string;
      const password = formData.get("login-password") as string;

      await api.login(email, password, selectedRole);

      // Atualizar estado de autenticação após login
      await refreshAuth();

      toast.success("Login realizado com sucesso!");
      navigate("/dashboard");
    } catch (error) {
      console.error('Erro no login:', error);

      if (error instanceof ApiException) {
        toast.error(error.message);
      } else {
        toast.error("Erro inesperado. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const name = formData.get("signup-name") as string;
      const phone = formData.get("signup-phone") as string;
      const email = formData.get("signup-email") as string;
      const password = formData.get("signup-password") as string;


      // Garantir que selectedRole seja válido
      const validRoles = ["client", "attendant", "manager"];
      const roleToSend = validRoles.includes(selectedRole) ? selectedRole : "client";

      const data = await api.signup({
        nome: name,
        telefone: phone,
        email,
        senha: password,
        role: roleToSend
      });

      // Após cadastro, fazer login automático para obter o token
      await api.login(email, password, roleToSend);

      // Atualizar estado de autenticação após cadastro
      await refreshAuth();

      toast.success("Conta criada com sucesso!");
      navigate("/dashboard");
    } catch (error) {
      console.error('Erro no cadastro:', error);

      if (error instanceof ApiException) {
        toast.error(error.message);
      } else {
        toast.error("Erro inesperado. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary mb-4 hover-glow">
            <UtensilsCrossed className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Campus Lanches</h1>
          <p className="text-muted-foreground mt-2">Sistema de Gestão Universitária</p>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Bem-vindo</CardTitle>
            <CardDescription className="text-center">
              Entre ou crie sua conta para continuar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Criar Conta</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Perfil</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button type="button" variant={selectedRole === "client" ? "default" : "outline"} onClick={() => setSelectedRole("client")}>Cliente</Button>
                      <Button type="button" variant={selectedRole === "attendant" ? "default" : "outline"} onClick={() => setSelectedRole("attendant")}>Atendente</Button>
                      <Button type="button" variant={selectedRole === "manager" ? "default" : "outline"} onClick={() => setSelectedRole("manager")}>Gerente</Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-email">E-mail</Label>
                    <Input
                      id="login-email"
                      name="login-email"
                      type="email"
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Senha</Label>
                    <Input
                      id="login-password"
                      name="login-password"
                      type="password"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? "Entrando..." : "Entrar"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Perfil</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button type="button" variant={selectedRole === "client" ? "default" : "outline"} onClick={() => setSelectedRole("client")}>Cliente</Button>
                      <Button type="button" variant={selectedRole === "attendant" ? "default" : "outline"} onClick={() => setSelectedRole("attendant")}>Atendente</Button>
                      <Button type="button" variant={selectedRole === "manager" ? "default" : "outline"} onClick={() => setSelectedRole("manager")}>Gerente</Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Nome Completo</Label>
                    <Input
                      id="signup-name"
                      name="signup-name"
                      type="text"
                      placeholder="João Silva"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-phone">Telefone</Label>
                    <Input
                      id="signup-phone"
                      name="signup-phone"
                      type="tel"
                      placeholder="(11) 99999-9999"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">E-mail</Label>
                    <Input
                      id="signup-email"
                      name="signup-email"
                      type="email"
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Senha</Label>
                    <Input
                      id="signup-password"
                      name="signup-password"
                      type="password"
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? "Criando conta..." : "Criar Conta"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
