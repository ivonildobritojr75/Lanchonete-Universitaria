# 🍽️ Campus Lanches

Sistema completo de pedidos online para lanchonete universitária

Uma plataforma moderna e intuitiva que conecta estudantes e lanchonetes, facilitando os pedidos de alimentos e a gestão completa do negócio.

## 📋 Índice
- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Arquitetura do Sistema](#-arquitetura-do-sistema)
- [Estrutura de Diretórios](#-estrutura-de-diretórios)
- [Como Executar](#-como-executar)
- [Funcionalidades Principais](#-funcionalidades-principais)
- [Pontos de extremidade da API](#-pontos-de-extremidade-da-api)
- [Próximas Funcionalidades](#-próximas-funcionalidades)
- [Contato](#-contato)

## 🎯 Sobre o Projeto

O Campus Lanches é uma solução completa para digitalização de lanchonetes universitárias, oferecendo:

**Para Clientes (Estudantes)**: Interface intuitiva para navegar no cardápio, fazer pedidos e acompanhar entregas

**Para Lanchonetes**: Dashboard completo para gerenciar pedidos, produtos, estoque e configurações do estabelecimento

**Experiência Responsiva**: Funciona perfeitamente em desktop, tablet e mobile

## 🌟 Diferenciais

- Design moderno e responsivo
- Gestão completa de múltiplas lanchonetes
- Dashboard analítico com métricas de negócio
- Sistema de carrinho de compras otimizado
- Autenticação JWT segura
- Controle de estoque em tempo real
- Sistema de permissões (cliente/atendente/gerente)

## ⚡ Funcionalidades

### 👨‍🎓 Para Clientes (Estudantes)
- Navegação intuitiva pelo cardápio
- Sistema de carrinho de compras
- Adição de complementos aos produtos
- Acompanhamento de pedidos
- Histórico de compras
- Recuperação de senha por e-mail

### 🏪 Para Lanchonetes
- Dashboard com estatísticas e métricas
- Gestão de pedidos (visualizar, confirmar, cancelar)
- Cadastro e gerenciamento de produtos
- Controle de estoque
- Configurações do estabelecimento
- Gestão de equipe (atendentes/gerentes)
- Relatórios de vendas

### 🔐 Sistema de Autenticação
- Registro de usuários e lanchonetes
- Login seguro com JWT
- Recuperação de senha por e-mail
- Perfis diferenciados (cliente/atendente/gerente)
- Middleware de autenticação e autorização

## 🛠 Tecnologias Utilizadas

### Front-end
| Tecnologia | Versão | Uso |
|------------|--------|-----|
| React | ^18.3.1 | Biblioteca principal para UI |
| TypeScript | ^5.8.3 | Tipagem estática |
| Vite | ^5.4.19 | Ferramenta de compilação e servidor de desenvolvimento |
| React Router | ^6.30.1 | Roteamento SPA |
| Tailwind CSS | ^3.4.17 | Framework CSS |
| shadcn/ui | - | Componentes UI modernos |
| Lucide React | ^0.462.0 | Ícones SVG |
| TanStack Query | ^5.83.0 | Gerenciamento de estado do servidor |
| React Hook Form | ^7.61.1 | Gerenciamento de formulários |
| Zod | ^3.25.76 | Validação de dados |

### Back-end
| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Python | 3.8+ | Linguagem principal do backend |
| Flask | 2.3.3 | Framework web HTTP |
| Flask-CORS | 4.0.0 | Suporte a CORS |
| PyJWT | 2.8.0 | Autenticação e autorização |
| SQLite | - | Banco de dados de desenvolvimento |
| PostgreSQL | - | Banco de dados de produção (planejado) |

## 🏗 Arquitetura do Sistema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React SPA)   │◄──►│   (Flask)       │◄──►│   (SQLite/PG)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
    ┌────▼────┐             ┌────▼────┐             ┌────▼────┐
    │ Vite    │             │ Flask   │             │ Tables: │
    │ Dev     │             │ Routes  │             │ - usuarios │
    │ Server  │             │ & JWT   │             │ - produtos │
    │         │             │ Auth    │             │ - pedidos │
    └─────────┘             └─────────┘             │ - categorias │
                                                    └─────────┘
```

### Fluxo de Dados
- **Autenticação**: Tokens JWT para sessões seguras
- **Estado Global**: TanStack Query para cache e sincronização
- **Roteamento**: React Router para navegação SPA
- **Formulários**: React Hook Form + Zod para validação
- **API**: Axios para comunicação HTTP com interceptors
- **Backend**: Flask para roteamento e middleware de autenticação

## 📁 Estrutura de Diretórios

### Frontend (src/)
```
src/
├── 📁 api/                    # Configuração e chamadas de API
│   ├── api.ts                 # Cliente HTTP e configuração
│
├── 📁 components/            # Componentes reutilizáveis
│   ├── 📁 ui/                # Componentes base (shadcn/ui)
│   └── 📁 shared/            # Componentes compartilhados
│
├── 📁 context/               # Contextos React
│   └── AuthContext.tsx       # Contexto de autenticação
│
├── 📁 hooks/                 # Custom hooks
│   └── use-mobile.tsx        # Hook para detectar mobile
│
├── 📁 lib/                   # Utilitários e configurações
│   ├── utils.ts              # Funções utilitárias
│   └── api.ts                # Configurações da API
│
├── 📁 pages/                 # Páginas da aplicação
│   ├── Auth.tsx              # Página de autenticação
│   ├── Menu.tsx              # Cardápio da lanchonete
│   ├── Dashboard.tsx         # Dashboard administrativo
│   ├── Checkout.tsx          # Finalização de pedidos
│   ├── Orders.tsx            # Pedidos do usuário
│   ├── Stock.tsx             # Controle de estoque
│   ├── Reports.tsx           # Relatórios
│   └── Permissions.tsx       # Gerenciamento de permissões
│
└── 📁 assets/                # Recursos estáticos
    └── 📁 Menu/              # Imagens dos produtos
```

### Backend (backend-flask/)
```
backend-flask/
├── 📁 app/
│   ├── __init__.py           # Inicialização da aplicação Flask
│   │
│   ├── 📁 models/            # Modelos de dados (SQLAlchemy)
│   │   ├── usuario.py        # Modelo de usuário
│   │   ├── produto.py        # Modelo de produto
│   │   ├── pedido.py         # Modelo de pedido
│   │   ├── categoria.py      # Modelo de categoria
│   │   └── db.py             # Configuração do banco
│   │
│   ├── 📁 repositories/      # Camada de acesso a dados
│   │   ├── usuario_repository.py
│   │   ├── produto_repository.py
│   │   ├── pedido_repository.py
│   │   └── categoria_repository.py
│   │
│   ├── 📁 service/           # Regras de negócio
│   │   ├── usuario_service.py
│   │   ├── produto_service.py
│   │   ├── pedido_service.py
│   │   └── categoria_service.py
│   │
│   ├── 📁 routes/            # Rotas da API
│   │   ├── auth.py           # Rotas de autenticação
│   │   ├── usuarios.py       # Rotas de usuários
│   │   ├── produtos.py       # Rotas de produtos
│   │   ├── pedidos.py        # Rotas de pedidos
│   │   ├── categorias.py     # Rotas de categorias
│   │   └── init.py           # Inicialização das rotas
│   │
│   └── 📁 utils/             # Utilitários
│       └── jwt_utils.py      # Funções JWT
│
├── 📁 database/              # Scripts do banco de dados
│   ├── schema.sql            # Schema do banco
│   ├── seed.sql              # Dados iniciais
│   └── db.sqlite3            # Banco SQLite
│
├── run.py                    # Ponto de entrada da aplicação
├── requirements.txt          # Dependências Python
├── seed.py                   # Script de população do banco
└── README.md                 # Documentação do backend
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js (versão 18 ou superior)
- npm ou yarn
- Python (versão 3.8 ou superior)
- pip

### Backend (Flask)
1. Instale as dependências:
```bash
cd backend-flask
pip install -r requirements.txt
```

2. Execute o script de inicialização do banco:
```bash
python seed.py
```

3. Execute o servidor:
```bash
python run.py
```

O backend estará disponível em `http://localhost:5000`

### Frontend (React)
1. Instale as dependências:
```bash
cd frontend
npm install
```

2. Execute o projeto:
```bash
npm run dev
```

O frontend estará disponível em `http://localhost:5173`

## 🎨 Funcionalidades Principais

### 🏠 Página Inicial (Menu)
- Cardápio interativo com filtros por categoria
- Sistema de busca de produtos
- Visualização de produtos com imagens
- Adição ao carrinho com complementos

### 🛒 Carrinho de Compras
- Visualização de itens selecionados
- Controle de quantidades
- Cálculo automático de preços
- Sistema de complementos

### 📊 Dashboard Administrativo
- Métricas em tempo real (pedidos, receitas, produtos)
- Gestão de produtos (CRUD)
- Controle de estoque
- Relatórios de vendas
- Gerenciamento de usuários

### 🔐 Sistema de Autenticação
- Registro diferenciado para clientes e funcionários
- Login com JWT
- Recuperação de senha
- Controle de permissões (cliente/atendente/gerente)

## 🔌 Pontos de extremidade da API

### Autenticação
- `POST /auth/login` - Login de usuário
- `POST /auth/register` - Registro de usuário
- `POST /auth/forgot-password` - Solicitação de recuperação de senha
- `POST /auth/reset-password` - Redefinição de senha

### Usuários
- `GET /users/profile` - Perfil do usuário logado
- `PUT /users/profile` - Atualizar perfil
- `GET /users` - Listar usuários (admin)

### Produtos
- `GET /products` - Listar produtos
- `POST /products` - Criar produto (admin/atendente)
- `PUT /products/:id` - Atualizar produto
- `DELETE /products/:id` - Deletar produto
- `GET /products/categories` - Listar categorias

### Pedidos
- `GET /orders` - Listar pedidos do usuário
- `POST /orders` - Criar novo pedido
- `PUT /orders/:id/status` - Atualizar status do pedido
- `GET /orders/all` - Listar todos os pedidos (admin)

### Categorias
- `GET /categories` - Listar categorias
- `POST /categories` - Criar categoria (admin)
- `PUT /categories/:id` - Atualizar categoria
- `DELETE /categories/:id` - Deletar categoria


## 📞 Contato

**Desenvolvedor**: [Mariany Gomes]

**Email**: marianygomes2014@gmail.com

**GitHub**: [https://github.com/MinAny7]

---

