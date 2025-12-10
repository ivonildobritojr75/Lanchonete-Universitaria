# Campus Lanches – Frontend React

Interface completa para clientes, atendentes e gerentes da lanchonete universitária, desenvolvida com React, TypeScript e Vite. Este frontend consome a API do backend Flask e fornece uma experiência moderna, responsiva e otimizada.

---

## 📁 Estrutura do Projeto

```
frontend/
└── src/
    ├── 📁 api/                    # Configuração do cliente HTTP e chamadas à API
    │   └── api.ts                # Axios + interceptors + endpoints
    │
    ├── 📁 components/            # Componentes reutilizáveis
    │   ├── 📁 ui/                # Base (shadcn/ui)
    │   └── 📁 shared/            # Componentes compartilhados
    │
    ├── 📁 context/               # Contextos globais
    │   └── AuthContext.tsx       # Autenticação e estado do usuário
    │
    ├── 📁 hooks/                 # Hooks personalizados
    │   └── use-mobile.tsx        # Detecção de dispositivo
    │
    ├── 📁 lib/                   # Utilitários
    │   ├── utils.ts              # Funções diversas
    │   └── api.ts                # Configuração da API
    │
    ├── 📁 pages/                 # Páginas da aplicação
    │   ├── Auth.tsx              # Login e registro
    │   ├── Menu.tsx              # Cardápio principal
    │   ├── Dashboard.tsx         # Painel administrativo
    │   ├── Checkout.tsx          # Finalização de pedidos
    │   ├── Orders.tsx            # Pedidos do usuário
    │   ├── Stock.tsx             # Estoque
    │   ├── Reports.tsx           # Relatórios
    │   └── Permissions.tsx       # Controle de permissões
    │
    └── 📁 assets/                # Imagens estáticas
        └── 📁 Menu/              # Fotos dos produtos
```

---

## 🚀 Como Executar o Frontend

### 1. Pré-requisitos

* Node.js 18+
* npm ou yarn
* Backend Flask funcionando em `http://localhost:5000` (ou ajuste no arquivo api.ts)

### 2. Instalar dependências

```bash
cd frontend
npm install
```

### 3. Iniciar o servidor em modo desenvolvimento

```bash
npm run dev
```

Aplicação disponível em:

```
http://localhost:5173
```

---

## 🔌 Integração com o Backend

Toda comunicação é feita através do cliente Axios configurado em:

```
src/api/api.ts
```

Principais interceptors implementados:

* Anexação automática do token JWT ao header Authorization.
* Redirecionamento para login quando o token expira.
* Padronização de erros.

---

## 🌐 Rotas Principais (Frontend)

### Públicas

* `/login`
* `/register`
* `/forgot-password`

### Clientes

* `/menu`
* `/checkout`
* `/orders`

### Administração

* `/dashboard`
* `/dashboard/products`
* `/dashboard/stock`
* `/dashboard/reports`
* `/dashboard/permissions`

---

## 🔧 Configuração da API

No arquivo:

```
src/lib/api.ts
```

Você pode ajustar:

* URL base da API
* Headers padrão
* Interceptors
* Timeout
* Rotinas de refresh token (opcional)

Exemplo:

```ts
export const api = axios.create({
  baseURL: "http://localhost:5000",
});
```

---

## 📦 Build para Produção

```bash
npm run build
```

Os arquivos finais serão gerados em:

```
dist/
```

---

## 📌 Próximos Passos do Frontend

* Implementar modo offline com cache de produtos.
* Adicionar testes unitários e E2E.
* Sistema de cupons e promoções.
* Dashboard com gráficos avançados (Recharts).
* Modo dark/light.
* Suporte multi-idioma.

---

## 🛠 Tecnologias Utilizadas

| Tecnologia      | Uso                        |
| --------------- | -------------------------- |
| React           | Base da interface SPA      |
| TypeScript      | Tipagem estática           |
| Vite            | Build rápido e leve        |
| Tailwind CSS    | Estilização                |
| shadcn/ui       | Componentes modernos       |
| TanStack Query  | Estado e cache server-side |
| React Hook Form | Formulários                |
| Zod             | Validação                  |
| Axios           | Comunicação HTTP           |
| Lucide React    | Ícones SVG                 |

---
