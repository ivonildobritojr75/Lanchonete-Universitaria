import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Menu from "./pages/Menu";
import Checkout from "./pages/Checkout";
import Stock from "./pages/Stock";
import Reports from "./pages/Reports";
import Permissions from "./pages/Permissions";
import Orders from "./pages/Orders";
import NotFound from "./pages/NotFound";
import { AuthProvider, useAuth } from "./context/AuthContext";

const queryClient = new QueryClient();

function RequireRole({ allow, children }: { allow: Array<"client"|"attendant"|"manager">; children: React.ReactNode }) {
  const { role, isLoading, isAuthenticated } = useAuth();

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return allow.includes(role!) ? <>{children}</> : <Navigate to="/dashboard" replace />;
}

function AppRoot() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/auth" replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppRoot />} />
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/dashboard"
              element={
                <RequireRole allow={["client", "attendant", "manager"]}>
                  <Dashboard />
                </RequireRole>
              }
            />
            <Route
              path="/menu"
              element={
                <RequireRole allow={["client", "attendant", "manager"]}>
                  <Menu />
                </RequireRole>
              }
            />
            <Route
              path="/checkout"
              element={
                <RequireRole allow={["client", "attendant", "manager"]}>
                  <Checkout />
                </RequireRole>
              }
            />
            <Route
              path="/stock"
              element={
                <RequireRole allow={["attendant", "manager"]}>
                  <Stock />
                </RequireRole>
              }
            />
            <Route
              path="/orders"
              element={
                <RequireRole allow={["attendant", "manager"]}>
                  <Orders />
                </RequireRole>
              }
            />
            <Route
              path="/reports"
              element={
                <RequireRole allow={["manager"]}>
                  <Reports />
                </RequireRole>
              }
            />
            <Route
              path="/permissions"
              element={
                <RequireRole allow={["manager"]}>
                  <Permissions />
                </RequireRole>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
