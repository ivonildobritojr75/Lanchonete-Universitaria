import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { 
  ShoppingCart, 
  Search, 
  ArrowLeft,
  Plus,
  Minus,
  Home,
  Receipt,
  User as UserIcon,
  Edit,
  Trash2,
  X
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { api, ApiException, apiRequest } from "@/lib/api";

type Complement = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type Product = {
  id: number;
  name: string;
  price: number;
  category: string;
  available: boolean;
  image: string; // URL da imagem ou emoji como fallback
  imageFile?: File; // Arquivo de imagem para upload
  description?: string; // Descrição do produto
};

const Menu = () => {
  const navigate = useNavigate();
  const { user, role, setUser, setRole, refreshAuth } = useAuth();
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState<"home"|"orders"|"profile">("home");
  const [searchParams] = useSearchParams();

  // Função para converter arquivo de imagem em URL
  const createImageUrl = (file: File): string => {
    return URL.createObjectURL(file);
  };

  // Função para abrir modal de edição
  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setEditFormData({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      available: product.available,
      image: product.image,
      imageFile: product.imageFile || null,
      description: product.description || ""
    });
    setIsEditModalOpen(true);
  };

  // Função para fechar modal
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingProduct(null);
    setEditFormData({
      name: "",
      price: "",
      category: "",
      available: true,
      image: "",
      imageFile: null,
      description: ""
    });
  };

  // Função para lidar com upload de imagem
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = createImageUrl(file);
      setEditFormData(prev => ({
        ...prev,
        image: imageUrl,
        imageFile: file
      }));
    }
  };

  // Função para salvar edição
  const saveEdit = async () => {
    if (!editingProduct) return;

    const price = parseFloat(editFormData.price);
    if (isNaN(price) || price < 0) {
      toast.error("Preço inválido");
      return;
    }

    try {
      await api.updateProduct(editingProduct.id, {
        nome: editFormData.name,
        preco: price,
        categoria: editFormData.category,
        disponivel: editFormData.available,
        imagem: editFormData.imageFile || undefined, // Enviar File ao invés de string
        descricao: editFormData.description || undefined
      });

      // Recarregar produtos após atualização
      const productsResponse = await api.getProducts({ disponiveis_apenas: true });
      setProducts(productsResponse.produtos.map(p => ({
        id: p.id,
        name: p.nome,
        price: p.preco,
        category: p.categoria,
        available: p.disponivel,
        image: p.imagem || "🍽️",
        description: p.descricao
      })));

      toast.success("Produto atualizado com sucesso!");
      closeEditModal();
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      if (error instanceof ApiException) {
        toast.error(error.message);
      } else {
        toast.error("Erro ao atualizar produto. Tente novamente.");
      }
    }
  };

  // Função para abrir modal de adicionar produto
  const openAddModal = () => {
    setAddFormData({
      name: "",
      price: "",
      category: "Lanches",
      available: true,
      image: "🍽️",
      imageFile: null,
      description: ""
    });
    setIsAddModalOpen(true);
  };

  // Função para fechar modal de adicionar
  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setAddFormData({
      name: "",
      price: "",
      category: "Lanches",
      available: true,
      image: "🍽️",
      imageFile: null,
      description: ""
    });
  };

  // Função para lidar com upload de imagem no modal de adicionar
  const handleAddImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = createImageUrl(file);
      setAddFormData(prev => ({
        ...prev,
        image: imageUrl,
        imageFile: file
      }));
    }
  };

  // Função para salvar novo produto
  const saveNewProduct = async () => {
    if (!addFormData.name.trim()) {
      toast.error("Nome do produto é obrigatório");
      return;
    }

    const price = parseFloat(addFormData.price);
    if (isNaN(price) || price < 0) {
      toast.error("Preço inválido");
      return;
    }

    try {
      await api.createProduct({
        nome: addFormData.name,
        preco: price,
        categoria: addFormData.category,
        disponivel: addFormData.available,
        imagem: addFormData.imageFile || undefined, // Enviar File ao invés de string
        descricao: addFormData.description || undefined
      });

      // Recarregar produtos após criação
      const productsResponse = await api.getProducts({ disponiveis_apenas: true });
      setProducts(productsResponse.produtos.map(p => ({
        id: p.id,
        name: p.nome,
        price: p.preco,
        category: p.categoria,
        available: p.disponivel,
        image: p.imagem || "🍽️",
        description: p.descricao
      })));

      toast.success("Produto adicionado com sucesso!");
      closeAddModal();
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      if (error instanceof ApiException) {
        toast.error(error.message);
      } else {
        toast.error("Erro ao adicionar produto. Tente novamente.");
      }
    }
  };

  // Função para abrir página de detalhes do produto
  const openProductDetails = (product: Product) => {
    setSelectedProduct(product);
    setProductQuantity(1);
    setSelectedComplements([]);
    setDescriptionText(product.description || "");
    setIsEditingDescription(false);
  };

  // Função para fechar página de detalhes
  const closeProductDetails = () => {
    setSelectedProduct(null);
    setProductQuantity(1);
    setSelectedComplements([]);
    setDescriptionText("");
    setIsEditingDescription(false);
  };

  // Função para adicionar complemento
  const addComplement = (complement: Omit<Complement, 'quantity'>) => {
    const existingComplement = selectedComplements.find(c => c.id === complement.id);
    if (existingComplement) {
      setSelectedComplements(prev => 
        prev.map(c => c.id === complement.id ? { ...c, quantity: c.quantity + 1 } : c)
      );
    } else {
      setSelectedComplements(prev => [...prev, { ...complement, quantity: 1 }]);
    }
  };

  // Função para remover complemento
  const removeComplement = (complementId: string) => {
    setSelectedComplements(prev => prev.filter(c => c.id !== complementId));
  };

  // Função para atualizar quantidade do complemento
  const updateComplementQuantity = (complementId: string, quantity: number) => {
    if (quantity <= 0) {
      removeComplement(complementId);
      return;
    }
    setSelectedComplements(prev => 
      prev.map(c => c.id === complementId ? { ...c, quantity } : c)
    );
  };

  // Função para salvar descrição
  const saveDescription = () => {
    if (!selectedProduct) return;
    
    setProducts(prev => prev.map(p => 
      p.id === selectedProduct.id ? { ...p, description: descriptionText } : p
    ));
    setSelectedProduct(prev => prev ? { ...prev, description: descriptionText } : null);
    setIsEditingDescription(false);
    toast.success("Descrição atualizada!");
  };

  // Função para excluir descrição
  const deleteDescription = () => {
    if (!selectedProduct) return;
    
    setProducts(prev => prev.map(p => 
      p.id === selectedProduct.id ? { ...p, description: undefined } : p
    ));
    setSelectedProduct(prev => prev ? { ...prev, description: undefined } : null);
    setDescriptionText("");
    toast.success("Descrição removida!");
  };

  // Função para adicionar ao carrinho com complementos
  const addToCartWithDetails = () => {
    if (!selectedProduct) return;

    const totalPrice = selectedProduct.price + selectedComplements.reduce((sum, comp) => sum + (comp.price * comp.quantity), 0);
    
    const cartItem = {
      product: {
        ...selectedProduct,
        price: totalPrice
      },
      quantity: productQuantity
    };

    const existingItem = cart.find(item => 
      item.product.id === selectedProduct.id
    );

    if (existingItem) {
      setCart(cart.map(item =>
        item.product.id === selectedProduct.id
          ? { ...item, quantity: item.quantity + productQuantity }
          : item
      ));
    } else {
      setCart([...cart, cartItem]);
    }

    toast.success("Produto adicionado ao carrinho!");
    closeProductDetails();
  };

  // Função para carregar pedidos do usuário
  const loadUserOrders = async () => {
    if (!user) return;

    // Apenas clientes devem ver pedidos na seção orders do menu
    // Administradores usam a página /orders separada
    if (role !== 'client') {
      setUserOrders([]);
      return;
    }

    try {
      setIsLoadingOrders(true);
      const ordersResponse = await api.getOrders();
      console.log('Pedidos do cliente carregados:', ordersResponse.pedidos);
      setUserOrders(ordersResponse.pedidos);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
      toast.error('Erro ao carregar pedidos');
    } finally {
      setIsLoadingOrders(false);
    }
  };

  // Sync tab from query string (e.g., /menu?tab=orders)
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "orders" || tab === "profile" || tab === "home") {
      // Apenas clientes podem acessar a seção de pedidos
      if (tab === "orders" && role !== 'client') {
        setActiveSection("home");
        navigate("/dashboard");
        return;
      }
      setActiveSection(tab);
      // Carregar pedidos quando a aba for ativada
      if (tab === "orders") {
        loadUserOrders();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, user, role]);

  const [activeCategory, setActiveCategory] = useState<string>("Todos");
  const [ordersTab, setOrdersTab] = useState<"inProgress"|"completed">("inProgress");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    price: "",
    category: "",
    available: true,
    image: "",
    imageFile: null as File | null,
    description: ""
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addFormData, setAddFormData] = useState({
    name: "",
    price: "",
    category: "Lanches",
    available: true,
    image: "🍽️",
    imageFile: null as File | null,
    description: ""
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productQuantity, setProductQuantity] = useState(1);
  const [selectedComplements, setSelectedComplements] = useState<Complement[]>([]);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [descriptionText, setDescriptionText] = useState("");
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    nome: user?.nome || "",
    telefone: user?.telefone || ""
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Estados para pedidos
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Estados para produtos e categorias da API
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Update profile form data when user changes
  useEffect(() => {
    if (user) {
      setProfileFormData({
        nome: user.nome,
        telefone: user.telefone || ""
      });
    }
  }, [user]);

  // Load products and categories from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingProducts(true);

        // Load products
        const productsResponse = await api.getProducts({ disponiveis_apenas: true });
        setProducts(productsResponse.produtos.map(p => ({
          id: p.id,
          name: p.nome,
          price: p.preco,
          category: p.categoria,
          available: p.disponivel,
          image: p.imagem || "🍽️",
          description: p.descricao
        })));

        // Load categories
        const categoriesResponse = await api.getCategories();
        setCategories(categoriesResponse.categorias.map(c => c.nome));

      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast.error('Erro ao carregar produtos. Tente novamente.');

        // Fallback para dados vazios em caso de erro
        setProducts([]);
        setCategories([]);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    loadData();
  }, []);
  const canManage = role === "attendant" || role === "manager";

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

  // Complementos disponíveis
  const availableComplements: Omit<Complement, 'quantity'>[] = [
    { id: "ketchup", name: "Ketchup", price: 0 },
    { id: "maionese", name: "Maionese", price: 0 },
    { id: "maionese-caseira", name: "Maionese Caseira", price: 2.00 },
    { id: "pimenta", name: "Pimenta", price: 0 }
  ];

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const openAt = 8 * 60;  // 08:00
  const closeAt = 21 * 60; // 18:00
  const isOpen = currentMinutes >= openAt && currentMinutes < closeAt;
  
  const getNextOpenText = () => {
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
    
    if (isWeekend) {
      return "Abrirá segunda às 08:00";
    } else {
      return "Abre amanhã às 08:00";
    }
  };
  
  const nextOpenText = getNextOpenText();


  const allCategories = useMemo(() => ["Todos", ...categories], [categories]);

  const filteredProducts = products.filter(product => {
    const matchesCategory = activeCategory === "Todos" || product.category === activeCategory;
    // A busca será feita via API quando implementarmos busca em tempo real
    const matchesSearch = !searchQuery || product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const cartStorageKey = "app.cart";

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(cartStorageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as { product: Product; quantity: number }[];
        if (Array.isArray(parsed)) setCart(parsed);
      }
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(cartStorageKey, JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  const addNewItem = () => {
    openAddModal();
  };

  const editItem = (product: Product) => {
    openEditModal(product);
  };

  const deleteItem = async (productId: number) => {
    if (!window.confirm("Deseja remover este item do cardápio?")) return;

    try {
      await api.deleteProduct(productId);

      // Recarregar produtos após exclusão
      const productsResponse = await api.getProducts({ disponiveis_apenas: true });
      setProducts(productsResponse.produtos.map(p => ({
        id: p.id,
        name: p.nome,
        price: p.preco,
        category: p.categoria,
        available: p.disponivel,
        image: p.imagem || "🍽️",
        description: p.descricao
      })));

      toast.success("Item removido");
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      if (error instanceof ApiException) {
        toast.error(error.message);
      } else {
        toast.error("Erro ao remover produto. Tente novamente.");
      }
    }
  };

  const addToCart = (product: Product) => {
    if (!product.available) {
      toast.error("Produto indisponível no momento");
      return;
    }

    const existingItem = cart.find(item => item.product.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
    toast.success("Produto adicionado ao carrinho");
  };

  const saveProfileChanges = async () => {
    if (!user) return;

    setIsUpdatingProfile(true);
    try {
      // Preparar dados para atualização
      const updateData: any = {};

      if (profileFormData.nome !== user.nome) {
        updateData.nome = profileFormData.nome;
      }

      if (profileFormData.telefone !== (user.telefone || "")) {
        updateData.telefone = profileFormData.telefone;
      }

      // Só fazer a requisição se houve mudanças
      if (Object.keys(updateData).length > 0) {
        // Usar a API para atualizar o usuário
        // Como não temos uma rota específica para atualizar o próprio usuário,
        // vamos usar a rota genérica de usuários
        await apiRequest<{ mensagem: string; usuario: any }>(
          `/api/usuarios/${user.id}`,
          {
            method: 'PUT',
            body: JSON.stringify(updateData),
          }
        );

        // Atualizar o contexto com os novos dados
        await refreshAuth();

        toast.success("Perfil atualizado com sucesso!");
      }

      setIsEditingProfile(false);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);

      if (error instanceof ApiException) {
        toast.error(error.message);
      } else {
        toast.error("Erro ao atualizar perfil. Tente novamente.");
      }
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart(cart.map(item => {
      if (item.product.id === productId) {
        const newQuantity = item.quantity + delta;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-secondary">
      {/* Header */}
      <header className={`bg-card border-b border-border sticky top-0 z-10 shadow-sm transition-transform duration-300 ${
        isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="container mx-auto px-4 py-2">
          {/* Header principal - mais compacto */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
                <h1 className="text-lg font-bold">Campus Lanches</h1>
                <p className="text-xs text-muted-foreground">Sabor que conquista a cada mordida!</p>
            </div>
          </div>

            {/* Status da loja - mais compacto */}
            <div className={`text-xs rounded-full px-2 py-1 ${isOpen ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
              {isOpen ? "🟢 Aberta" : "🔴 Fechada"}
            </div>
          </div>

          {/* Search - apenas quando necessário */}
          {activeSection === "home" && (
            <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produtos..."
                className="pl-10 h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          )}

          {/* Manage toolbar - mais compacto */}
          {activeSection === "home" && canManage && (
            <div className="flex items-center gap-2 mb-2">
              <Button size="sm" className="h-8 text-xs" onClick={addNewItem}>
                <Plus className="w-3 h-3 mr-1" />
                Adicionar item
              </Button>
            </div>
          )}

          {/* Categories - mais compactas */}
          {activeSection === "home" && (
            <div className="flex gap-1 overflow-x-auto no-scrollbar">
              {allCategories.map(cat => (
                <Button
                  key={cat}
                  size="sm"
                  variant={activeCategory === cat ? "default" : "outline"}
                  onClick={() => setActiveCategory(cat)}
                  className="h-7 text-xs px-2"
                >
                  {cat}
                </Button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4 pb-20">
        {activeSection === "home" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoadingProducts ? (
            // Loading skeleton
            Array.from({ length: 8 }).map((_, index) => (
              <Card key={index} className="overflow-hidden border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto animate-pulse"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded mb-3 animate-pulse"></div>
                  <div className="flex items-center justify-between">
                    <div className="h-6 bg-gray-200 rounded animate-pulse w-16"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            filteredProducts.map((product, index) => (
            <Card
              key={product.id}
              className="overflow-hidden border-0 shadow-md hover-lift animate-slide-up cursor-pointer"
              style={{ animationDelay: `${index * 0.05}s` }}
              onClick={() => openProductDetails(product)}
            >
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  {product.image.startsWith('data:') || product.image.startsWith('blob:') || product.image.startsWith('/') ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-lg mx-auto"
                    />
                  ) : (
                    <div className="text-6xl">{product.image}</div>
                  )}
                </div>
                <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{product.category}</p>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-primary">
                    R$ {product.price.toFixed(2)}
                  </p>
                  {!product.available && (
                    <Badge variant="destructive">Esgotado</Badge>
                  )}
                </div>
              </CardContent>
                <CardFooter className="p-4 pt-0 flex flex-wrap gap-2">
                <Button
                    className={canManage ? "flex-1" : "w-full"}
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(product);
                  }}
                    disabled={!product.available || !isOpen}
                >
                  <Plus className="w-4 h-4 mr-2" />
                    {isOpen ? "Adicionar" : "Indisponível"}
                </Button>
                  {canManage && (
                    <>
                      <Button variant="outline" className="flex-1" onClick={(e) => {
                        e.stopPropagation();
                        editItem(product);
                      }}>Editar</Button>
                      <Button variant="destructive" className="flex-1" onClick={(e) => {
                        e.stopPropagation();
                        deleteItem(product.id);
                      }}>Excluir</Button>
                    </>
                  )}
              </CardFooter>
            </Card>
            ))
          )}
        </div>
        )}

        {activeSection === "orders" && (
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-2 mb-6">
              <Button size="sm" variant={ordersTab === "inProgress" ? "default" : "outline"} onClick={() => setOrdersTab("inProgress")}>Em andamento</Button>
              <Button size="sm" variant={ordersTab === "completed" ? "default" : "outline"} onClick={() => setOrdersTab("completed")}>Finalizados</Button>
            </div>

            {isLoadingOrders ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
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
            ) : (
              <>
                {userOrders.length === 0 ? (
                  <Card className="border-0 shadow-md">
                    <CardContent className="py-10 text-center text-muted-foreground">
                      <div className="mb-4">
                        <span className="text-4xl">🍽️</span>
                      </div>
                      {ordersTab === "inProgress" ? (
                        <div>
                          <p className="mb-2 font-medium">Nenhum pedido em andamento</p>
                          <p className="text-sm">Seus pedidos aparecerão aqui quando você fizer um pedido.</p>
                        </div>
                      ) : (
                        <div>
                          <p className="mb-2 font-medium">Nenhum pedido finalizado</p>
                          <p className="text-sm">Seus pedidos finalizados aparecerão aqui.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {userOrders
                      .filter(order => {
                        if (ordersTab === "inProgress") {
                          return order.status !== "finalizado" && order.status !== "cancelado";
                        } else {
                          return order.status === "finalizado";
                        }
                      })
                      .map((order) => (
                        <Card key={order.id} className="border-0 shadow-md">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="font-semibold text-lg">Pedido #{order.id}</h3>
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
                              <div className="text-right">
                                <p className="text-2xl font-bold text-primary">R$ {order.total.toFixed(2)}</p>
                                <Badge
                                  variant={
                                    order.status === "em_andamento" ? "default" :
                                    order.status === "preparando" ? "secondary" :
                                    order.status === "pronto" ? "outline" :
                                    order.status === "finalizado" ? "default" :
                                    "destructive"
                                  }
                                  className={
                                    order.status === "finalizado" ? "bg-green-100 text-green-800" :
                                    order.status === "cancelado" ? "bg-red-100 text-red-800" :
                                    ""
                                  }
                                >
                                  {order.status === "em_andamento" ? "Em Andamento" :
                                   order.status === "preparando" ? "Preparando" :
                                   order.status === "pronto" ? "Pronto" :
                                   order.status === "finalizado" ? "Finalizado" :
                                   "Cancelado"}
                                </Badge>
                              </div>
                            </div>

                            <div className="space-y-3 mb-4">
                              {order.itens.map((item: any) => (
                                <div key={item.id} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                                  <div className="flex items-center gap-3">
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
                                    <div>
                                      <p className="font-medium">{item.quantidade}x {item.produto?.nome || `Produto #${item.produto_id}`}</p>
                                      <p className="text-sm text-muted-foreground">
                                        {item.produto?.categoria && `${item.produto.categoria} • `}
                                        R$ {item.preco_unitario.toFixed(2)} cada
                                      </p>
                                    </div>
                                  </div>
                                  <p className="font-semibold">R$ {item.total_item.toFixed(2)}</p>
                                </div>
                              ))}
                            </div>

                            {order.observacoes && (
                              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-muted-foreground mb-1">Observações:</p>
                                <p className="text-sm">{order.observacoes}</p>
                              </div>
                            )}

                            {order.status === "pronto" && (
                              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-sm text-green-800 font-medium">🎉 Seu pedido está pronto para retirada!</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeSection === "profile" && (
          <div className="max-w-md mx-auto">
            {user ? (
              <div className="space-y-4">
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle>Dados do Perfil</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Email (somente leitura) */}
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">E-mail</p>
                        <p className="font-medium">{user.email}</p>
                      </div>
                      <Badge variant="secondary">Não editável</Badge>
                    </div>

                    {/* Role (somente leitura) */}
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">Perfil</p>
                        <p className="font-medium">
                          {user.role === "client" ? "Cliente" :
                           user.role === "attendant" ? "Atendente" :
                           user.role === "manager" ? "Gerente" : user.role}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {user.is_admin ? "Administrador" : "Usuário"}
                      </Badge>
                    </div>

                    {/* Nome */}
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-muted-foreground">Nome</p>
                        {!isEditingProfile && (
                          <Button size="sm" variant="outline" onClick={() => setIsEditingProfile(true)}>
                            <Edit className="w-4 h-4 mr-1" />
                            Editar
                          </Button>
                        )}
                      </div>
                      {isEditingProfile ? (
                        <div className="space-y-2">
                          <Input
                            value={profileFormData.nome}
                            onChange={(e) => setProfileFormData(prev => ({ ...prev, nome: e.target.value }))}
                            placeholder="Digite seu nome"
                          />
                        </div>
                      ) : (
                        <p className="font-medium">{user.nome}</p>
                      )}
                    </div>

                    {/* Telefone */}
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-muted-foreground">Telefone</p>
                        {!isEditingProfile && (
                          <Button size="sm" variant="outline" onClick={() => setIsEditingProfile(true)}>
                            <Edit className="w-4 h-4 mr-1" />
                            Editar
                          </Button>
                        )}
                      </div>
                      {isEditingProfile ? (
                        <div className="space-y-2">
                          <Input
                            value={profileFormData.telefone}
                            onChange={(e) => setProfileFormData(prev => ({ ...prev, telefone: e.target.value }))}
                            placeholder="(11) 99999-9999"
                          />
                        </div>
                      ) : (
                        <p className="font-medium">{user.telefone || "Não informado"}</p>
                      )}
                    </div>

                    {/* Botões de ação quando editando */}
                    {isEditingProfile && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={saveProfileChanges}
                          disabled={isUpdatingProfile}
                          className="flex-1"
                        >
                          {isUpdatingProfile ? "Salvando..." : "Salvar"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setIsEditingProfile(false);
                            // Reset form data
                            setProfileFormData({
                              nome: user.nome,
                              telefone: user.telefone || ""
                            });
                          }}
                          disabled={isUpdatingProfile}
                          className="flex-1"
                        >
                          Cancelar
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-md">
                  <CardContent className="py-6 text-center">
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setRole(null);
                        setUser(null);
                        navigate("/");
                        toast.success("Logout realizado");
                      }}
                    >
                      Sair da conta
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="border-0 shadow-md">
                <CardContent className="py-10 text-center">
                  <p className="text-lg font-semibold mb-2">Já possui conta?</p>
                  <p className="text-muted-foreground mb-6">Entre ou cadastre-se para acompanhar seus pedidos</p>
                  <Button size="lg" onClick={() => navigate("/auth")}>Entrar ou cadastrar</Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>


      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
        <div className="container mx-auto px-6 py-3 grid grid-cols-3 gap-2 text-center">
          <button className={`flex flex-col items-center gap-1 ${activeSection === "home" ? "text-primary" : "text-muted-foreground"}`} onClick={() => setActiveSection("home")}>
            <Home className="w-5 h-5" />
            <span className="text-sm">Início</span>
          </button>
          {role === 'client' && (
            <button className={`flex flex-col items-center gap-1 ${activeSection === "orders" ? "text-primary" : "text-muted-foreground"}`} onClick={() => setActiveSection("orders")}>
              <Receipt className="w-5 h-5" />
              <span className="text-sm">Pedidos</span>
            </button>
          )}
          <button className={`flex flex-col items-center gap-1 ${activeSection === "profile" ? "text-primary" : "text-muted-foreground"}`} onClick={() => setActiveSection("profile")}>
            <UserIcon className="w-5 h-5" />
            <span className="text-sm">Perfil</span>
          </button>
              </div>
      </nav>

      {/* Carrinho Lateral */}
      <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
        <SheetTrigger asChild>
          <button
            className="fixed bottom-24 right-6 bg-primary text-primary-foreground rounded-full shadow-lg w-12 h-12 flex items-center justify-center hover:brightness-110 z-20"
            aria-label="Abrir carrinho"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-destructive text-white text-xs rounded-full px-1.5 py-0.5">
                {cartItemsCount}
              </span>
            )}
          </button>
        </SheetTrigger>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Carrinho ({cartItemsCount} itens)
            </SheetTitle>
          </SheetHeader>
          
          <div className="flex flex-col h-full">
            {/* Lista de itens do carrinho */}
            <div className="flex-1 overflow-y-auto py-4">
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Seu carrinho está vazio</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Adicione alguns produtos para começar
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
              {cart.map(item => (
                    <div key={item.product.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="w-12 h-12 flex items-center justify-center">
                        {item.product.image.startsWith('data:') || item.product.image.startsWith('blob:') || item.product.image.startsWith('/') ? (
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <span className="text-2xl">{item.product.image}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{item.product.name}</h4>
                        <p className="text-sm text-muted-foreground">{item.product.category}</p>
                        <p className="text-sm font-bold text-primary">
                          R$ {(item.product.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                          className="h-8 w-8"
                      onClick={() => updateQuantity(item.product.id, -1)}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <Button
                      size="icon"
                      variant="outline"
                          className="h-8 w-8"
                      onClick={() => updateQuantity(item.product.id, 1)}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
              )}
          </div>

            {/* Footer do carrinho */}
            {cart.length > 0 && (
              <div className="border-t pt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-2xl font-bold text-primary">R$ {cartTotal.toFixed(2)}</span>
                </div>
                <Button 
                  size="lg" 
                  className="w-full"
                  onClick={() => {
                    setIsCartOpen(false);
                    role ? navigate("/checkout") : navigate("/auth");
                  }}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Finalizar Pedido
                </Button>
        </div>
      )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Página de Detalhes do Produto */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <Button variant="ghost" onClick={closeProductDetails}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <h2 className="text-xl font-bold">Detalhes do Produto</h2>
              <Button variant="ghost" onClick={closeProductDetails}>
                <X className="w-4 h-4" />
              </Button>
        </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Informações do Produto */}
                <div className="space-y-6">
                  {/* Imagem e Nome */}
                  <div className="text-center">
                    <div className="mb-4">
                      {selectedProduct.image.startsWith('data:') || selectedProduct.image.startsWith('blob:') || selectedProduct.image.startsWith('/') ? (
                        <img
                          src={selectedProduct.image}
                          alt={selectedProduct.name}
                          className="w-32 h-32 object-cover rounded-lg mx-auto"
                        />
                      ) : (
                        <div className="text-8xl mx-auto">{selectedProduct.image}</div>
                      )}
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{selectedProduct.name}</h3>
                    <p className="text-3xl font-bold text-primary">R$ {selectedProduct.price.toFixed(2)}</p>
                  </div>

                  {/* Descrição */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Descrição</h4>
                      {canManage && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => setIsEditingDescription(!isEditingDescription)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            {isEditingDescription ? 'Cancelar' : 'Editar'}
                          </Button>
                          {selectedProduct.description && (
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              onClick={deleteDescription}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Excluir
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {isEditingDescription ? (
                      <div className="space-y-2">
                        <textarea
                          value={descriptionText}
                          onChange={(e) => setDescriptionText(e.target.value)}
                          className="w-full p-3 border rounded-lg resize-none"
                          rows={3}
                          placeholder="Digite a descrição do produto..."
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={saveDescription}>
                            Salvar
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setIsEditingDescription(false)}>
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-600 min-h-[60px] p-3 bg-gray-50 rounded-lg">
                        {selectedProduct.description || "Nenhuma descrição disponível."}
                      </p>
                    )}
                  </div>

                  {/* Complementos */}
                  <div className="space-y-3">
                    <h4 className="font-semibold">Complementos</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {availableComplements.map((complement) => (
                        <div key={complement.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{complement.name}</p>
                            <p className="text-sm text-gray-500">
                              {complement.price > 0 ? `+R$ ${complement.price.toFixed(2)}` : 'Grátis'}
                            </p>
                          </div>
                          <Button 
                            size="sm" 
                            onClick={() => addComplement(complement)}
                            className="ml-2"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    {/* Complementos Selecionados */}
                    {selectedComplements.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="font-medium text-sm">Complementos Selecionados:</h5>
                        {selectedComplements.map((complement) => (
                          <div key={complement.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm">{complement.name} (x{complement.quantity})</span>
                            <div className="flex items-center gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => updateComplementQuantity(complement.id, complement.quantity - 1)}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="text-sm w-6 text-center">{complement.quantity}</span>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => updateComplementQuantity(complement.id, complement.quantity + 1)}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => removeComplement(complement.id)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Quantidade e Adicionar ao Carrinho */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Quantidade:</span>
                      <div className="flex items-center gap-3">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setProductQuantity(Math.max(1, productQuantity - 1))}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-8 text-center font-medium">{productQuantity}</span>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setProductQuantity(productQuantity + 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <Button 
                      size="lg" 
                      className="w-full"
                      onClick={addToCartWithDetails}
                      disabled={!selectedProduct.available || !isOpen}
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      {isOpen ? 'Adicionar ao Carrinho' : 'Indisponível'}
                    </Button>
                  </div>
                </div>

                {/* Produtos Relacionados */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Search className="w-4 h-4" />
                    <h4 className="font-semibold">Outros Produtos</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto">
                    {products
                      .filter(p => p.id !== selectedProduct.id && p.available)
                      .slice(0, 6)
                      .map((product) => (
                        <div 
                          key={product.id}
                          className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                          onClick={() => openProductDetails(product)}
                        >
                          <div className="w-12 h-12 flex items-center justify-center">
                            {product.image.startsWith('data:') || product.image.startsWith('blob:') || product.image.startsWith('/') ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                            ) : (
                              <span className="text-2xl">{product.image}</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium">{product.name}</h5>
                            <p className="text-sm text-gray-500">{product.category}</p>
                            <p className="text-sm font-bold text-primary">R$ {product.price.toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição de Produto */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Nome do Produto */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Nome
              </Label>
              <Input
                id="edit-name"
                value={editFormData.name}
                onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                className="col-span-3"
              />
            </div>

            {/* Preço */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-price" className="text-right">
                Preço
              </Label>
              <Input
                id="edit-price"
                type="number"
                step="0.01"
                value={editFormData.price}
                onChange={(e) => setEditFormData(prev => ({ ...prev, price: e.target.value }))}
                className="col-span-3"
                placeholder="0.00"
              />
            </div>

            {/* Categoria */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                Categoria
              </Label>
              <Select 
                value={editFormData.category} 
                onValueChange={(value) => setEditFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Lanches">Lanches</SelectItem>
                  <SelectItem value="Bebidas">Bebidas</SelectItem>
                  <SelectItem value="Salgados">Salgados</SelectItem>
                  <SelectItem value="Sucos">Sucos</SelectItem>
                  <SelectItem value="Acompanhamentos">Acompanhamentos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Disponibilidade */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                Disponível
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-available"
                  checked={editFormData.available}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, available: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="edit-available" className="text-sm">
                  Produto disponível para venda
                </Label>
              </div>
            </div>

            {/* Upload de Imagem */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                Imagem
              </Label>
              <div className="col-span-3 space-y-2">
                {/* Preview da imagem atual */}
                <div className="flex items-center gap-2">
                  {editFormData.image.startsWith('data:') || editFormData.image.startsWith('blob:') ? (
                    <img 
                      src={editFormData.image} 
                      alt="Preview" 
                      className="w-16 h-16 object-cover rounded-lg border"
                    />
                  ) : (
                    <div className="w-16 h-16 flex items-center justify-center border rounded-lg bg-gray-100">
                      <span className="text-2xl">{editFormData.image}</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <Label htmlFor="edit-image" className="cursor-pointer">
                      <div className="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-50">
                        <Plus className="w-4 h-4" />
                        <span className="text-sm">Trocar imagem</span>
                      </div>
                    </Label>
                    <input
                      id="edit-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Clique em "Trocar imagem" para selecionar uma nova foto
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeEditModal}>
              Cancelar
            </Button>
            <Button onClick={saveEdit}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Adicionar Produto */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Produto</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Nome do Produto */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="add-name" className="text-right">
                Nome *
              </Label>
              <Input
                id="add-name"
                value={addFormData.name}
                onChange={(e) => setAddFormData(prev => ({ ...prev, name: e.target.value }))}
                className="col-span-3"
                placeholder="Nome do produto"
              />
            </div>

            {/* Preço */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="add-price" className="text-right">
                Preço *
              </Label>
              <Input
                id="add-price"
                type="number"
                step="0.01"
                value={addFormData.price}
                onChange={(e) => setAddFormData(prev => ({ ...prev, price: e.target.value }))}
                className="col-span-3"
                placeholder="0.00"
              />
            </div>

            {/* Categoria */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                Categoria
              </Label>
              <Select 
                value={addFormData.category} 
                onValueChange={(value) => setAddFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Lanches">Lanches</SelectItem>
                  <SelectItem value="Bebidas">Bebidas</SelectItem>
                  <SelectItem value="Salgados">Salgados</SelectItem>
                  <SelectItem value="Sucos">Sucos</SelectItem>
                  <SelectItem value="Acompanhamentos">Acompanhamentos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Disponibilidade */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                Disponível
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="add-available"
                  checked={addFormData.available}
                  onChange={(e) => setAddFormData(prev => ({ ...prev, available: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="add-available" className="text-sm">
                  Produto disponível para venda
                </Label>
              </div>
            </div>

            {/* Upload de Imagem */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                Imagem
              </Label>
              <div className="col-span-3 space-y-2">
                {/* Preview da imagem */}
                <div className="flex items-center gap-2">
                  {addFormData.image.startsWith('data:') || addFormData.image.startsWith('blob:') ? (
                    <img 
                      src={addFormData.image} 
                      alt="Preview" 
                      className="w-16 h-16 object-cover rounded-lg border"
                    />
                  ) : (
                    <div className="w-16 h-16 flex items-center justify-center border rounded-lg bg-gray-100">
                      <span className="text-2xl">{addFormData.image}</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <Label htmlFor="add-image" className="cursor-pointer">
                      <div className="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-50">
                        <Plus className="w-4 h-4" />
                        <span className="text-sm">Selecionar imagem</span>
                      </div>
                    </Label>
                    <input
                      id="add-image"
                      type="file"
                      accept="image/*"
                      onChange={handleAddImageUpload}
                      className="hidden"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Clique em "Selecionar imagem" para escolher uma foto ou use o emoji padrão
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeAddModal}>
              Cancelar
            </Button>
            <Button onClick={saveNewProduct}>
              Adicionar Produto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Menu;
