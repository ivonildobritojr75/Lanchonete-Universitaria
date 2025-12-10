// Configuração da API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Chaves para localStorage
const TOKEN_KEY = 'app.jwt_token';

// Tipos de erro da API
export interface ApiError {
  erro: string;
  detalhes?: string;
}

// Classe para erros da API
export class ApiException extends Error {
  public status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiException';
  }
}

// Funções utilitárias para JWT
export const tokenManager = {
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken: (): void => {
    localStorage.removeItem(TOKEN_KEY);
  },

  hasToken: (): boolean => {
    return !!localStorage.getItem(TOKEN_KEY);
  }
};

// Função utilitária para fazer requisições HTTP
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  // Preparar headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };

  // Adicionar token JWT se existir
  const token = tokenManager.getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    headers,
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new ApiException(data.erro || 'Erro na requisição', response.status);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiException) {
      throw error;
    }

    // Erro de rede ou outros erros
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiException(
        'Erro de conexão. Verifique se o servidor está rodando.',
        0
      );
    }

    throw new ApiException('Erro interno do servidor', 500);
  }
}

// Funções específicas da API
export const api = {
  // Autenticação
  async login(email: string, senha: string, role: string) {
    const response = await apiRequest<{
      mensagem: string;
      usuario: {
        id: number;
        nome: string;
        email: string;
        telefone?: string;
        role: string;
        is_admin: boolean;
      };
      token: string;
    }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha, role }),
    });

    // Salvar token JWT
    tokenManager.setToken(response.token);

    return response;
  },

  async signup(dados: {
    nome: string;
    telefone: string;
    email: string;
    senha: string;
    role: string;
  }) {
    // Garantir que os dados sejam válidos antes de enviar
    const dadosLimpos = {
      nome: dados.nome?.trim() || '',
      telefone: dados.telefone?.trim() || '',
      email: dados.email?.trim() || '',
      senha: dados.senha?.trim() || '',
      role: (dados.role && ['client', 'attendant', 'manager'].includes(dados.role)) ? dados.role : 'client'
    };

    return apiRequest<{
      mensagem: string;
      usuario: {
        id: number;
        nome: string;
        email: string;
        telefone?: string;
        role: string;
        is_admin: boolean;
        criado_em: string;
      };
    }>('/api/usuarios/', {
      method: 'POST',
      body: JSON.stringify(dadosLimpos),
    });
  },

  // Verificar autenticação
  async getCurrentUser() {
    return apiRequest<{
      usuario: {
        id: number;
        nome: string;
        email: string;
        telefone?: string;
        role: string;
        is_admin: boolean;
      };
    }>('/api/auth/me');
  },

  // Logout
  logout() {
    tokenManager.removeToken();
  },

  // Produtos
  async getProducts(filters?: {
    disponiveis_apenas?: boolean;
    categoria?: string;
    busca?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.disponiveis_apenas) params.set('disponiveis_apenas', 'true');
    if (filters?.categoria) params.set('categoria', filters.categoria);
    if (filters?.busca) params.set('busca', filters.busca);

    const query = params.toString();
    const endpoint = `/api/produtos/${query ? `?${query}` : ''}`;

    return apiRequest<{
      produtos: Array<{
        id: number;
        nome: string;
        preco: number;
        categoria: string;
        disponivel: boolean;
        imagem?: string;
        descricao?: string;
        criado_em: string;
        atualizado_em: string;
      }>;
      total: number;
    }>(endpoint);
  },

  async getProduct(id: number) {
    return apiRequest<{
      produto: {
        id: number;
        nome: string;
        preco: number;
        categoria: string;
        disponivel: boolean;
        imagem?: string;
        descricao?: string;
        criado_em: string;
        atualizado_em: string;
      };
    }>(`/api/produtos/${id}`);
  },

  async createProduct(data: {
    nome: string;
    preco: number;
    categoria: string;
    disponivel?: boolean;
    imagem?: File; // Agora aceita File ao invés de string
    descricao?: string;
  }) {
    const formData = new FormData();

    // Adicionar dados do formulário
    formData.append('nome', data.nome);
    formData.append('preco', data.preco.toString());
    formData.append('categoria', data.categoria);
    if (data.disponivel !== undefined) {
      formData.append('disponivel', data.disponivel.toString());
    }
    if (data.descricao) {
      formData.append('descricao', data.descricao);
    }
    if (data.imagem) {
      formData.append('imagem', data.imagem);
    }

    const url = `${API_BASE_URL}/api/produtos/`;

    // Preparar headers (não incluir Content-Type pois o browser define automaticamente para multipart/form-data)
    const headers: Record<string, string> = {};

    // Adicionar token JWT se existir
    const token = tokenManager.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new ApiException(responseData.erro || 'Erro na requisição', response.status);
      }

      return responseData;
    } catch (error) {
      if (error instanceof ApiException) {
        throw error;
      }

      // Erro de rede ou outros erros
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new ApiException(
          'Erro de conexão. Verifique se o servidor está rodando.',
          0
        );
      }

      throw new ApiException('Erro interno do servidor', 500);
    }
  },

  async updateProduct(id: number, data: Partial<{
    nome: string;
    preco: number;
    categoria: string;
    disponivel: boolean;
    imagem: File; // Agora aceita File ao invés de string
    descricao: string;
  }>) {
    const formData = new FormData();

    // Adicionar dados do formulário
    if (data.nome !== undefined) formData.append('nome', data.nome);
    if (data.preco !== undefined) formData.append('preco', data.preco.toString());
    if (data.categoria !== undefined) formData.append('categoria', data.categoria);
    if (data.disponivel !== undefined) formData.append('disponivel', data.disponivel.toString());
    if (data.descricao !== undefined) formData.append('descricao', data.descricao);
    if (data.imagem) formData.append('imagem', data.imagem);

    const url = `${API_BASE_URL}/api/produtos/${id}`;

    // Preparar headers (não incluir Content-Type pois o browser define automaticamente para multipart/form-data)
    const headers: Record<string, string> = {};

    // Adicionar token JWT se existir
    const token = tokenManager.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: formData,
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new ApiException(responseData.erro || 'Erro na requisição', response.status);
      }

      return responseData;
    } catch (error) {
      if (error instanceof ApiException) {
        throw error;
      }

      // Erro de rede ou outros erros
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new ApiException(
          'Erro de conexão. Verifique se o servidor está rodando.',
          0
        );
      }

      throw new ApiException('Erro interno do servidor', 500);
    }
  },

  async deleteProduct(id: number) {
    return apiRequest<{
      mensagem: string;
    }>(`/api/produtos/${id}`, {
      method: 'DELETE',
    });
  },

  async getCategories() {
    return apiRequest<{
      categorias: Array<{
        id: number;
        nome: string;
        descricao?: string;
        ativo: boolean;
        criado_em: string;
        atualizado_em: string;
      }>;
      total: number;
    }>('/api/produtos/categorias');
  },

  // Pedidos
  async createOrder(data: {
    itens_carrinho: Array<{
      produto_id: number;
      quantidade: number;
    }>;
    observacoes?: string;
  }) {
    return apiRequest<{
      mensagem: string;
      pedido: {
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
        }>;
      };
    }>('/api/pedidos/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getOrders(filters?: {
    status?: string;
    limit?: number;
    offset?: number;
  }) {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.limit) params.set('limit', filters.limit.toString());
    if (filters?.offset) params.set('offset', filters.offset.toString());

    const query = params.toString();
    const endpoint = `/api/pedidos/${query ? `?${query}` : ''}`;

    return apiRequest<{
      pedidos: Array<{
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
        }>;
      }>;
      total: number;
    }>(endpoint);
  },

  async getOrder(id: number) {
    return apiRequest<{
      pedido: {
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
        }>;
      };
    }>(`/api/pedidos/${id}`);
  },

  async updateOrderStatus(id: number, status: string) {
    return apiRequest<{
      mensagem: string;
      pedido: any;
    }>(`/api/pedidos/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  async cancelOrder(id: number) {
    return apiRequest<{
      mensagem: string;
      pedido: any;
    }>(`/api/pedidos/${id}/cancelar`, {
      method: 'PUT',
    });
  },

  async getOrderStatuses() {
    return apiRequest<{
      status: string[];
      total: number;
    }>('/api/pedidos/status');
  },

  async getOrderStatistics() {
    return apiRequest<{
      total_pedidos: number;
      pedidos_por_status: Record<string, number>;
      receita_total: number;
    }>('/api/pedidos/estatisticas');
  },

  // Verificar se está autenticado
  isAuthenticated(): boolean {
    return tokenManager.hasToken();
  },
};
