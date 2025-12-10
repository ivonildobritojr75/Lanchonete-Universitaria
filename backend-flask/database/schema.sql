-- Schema do banco de dados SQLite para API Lanchonete
-- Tabelas de usuários, categorias e produtos

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    telefone VARCHAR(20), -- Telefone do usuário
    senha VARCHAR(255) NOT NULL, -- Será armazenado o hash da senha
    role VARCHAR(20) DEFAULT 'client', -- Role: client, attendant, manager
    is_admin BOOLEAN DEFAULT 0, -- 0 = usuário comum, 1 = administrador
    ativo BOOLEAN DEFAULT 1, -- Se o usuário está ativo
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de categorias
CREATE TABLE IF NOT EXISTS categorias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT, -- Descrição da categoria
    ativo BOOLEAN DEFAULT 1, -- Se a categoria está ativa
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS produtos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome VARCHAR(200) NOT NULL,
    preco DECIMAL(10, 2) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    disponivel BOOLEAN DEFAULT 1, -- Se o produto está disponível
    imagem VARCHAR(500), -- URL da imagem
    descricao TEXT, -- Descrição do produto
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios (email);

CREATE INDEX IF NOT EXISTS idx_usuarios_telefone ON usuarios (telefone);

CREATE INDEX IF NOT EXISTS idx_usuarios_role ON usuarios (role);

CREATE INDEX IF NOT EXISTS idx_usuarios_ativo ON usuarios (ativo);

CREATE INDEX IF NOT EXISTS idx_usuarios_criado_em ON usuarios (criado_em);

CREATE INDEX IF NOT EXISTS idx_categorias_nome ON categorias (nome);

CREATE INDEX IF NOT EXISTS idx_categorias_ativo ON categorias (ativo);

CREATE INDEX IF NOT EXISTS idx_categorias_criado_em ON categorias (criado_em);

CREATE INDEX IF NOT EXISTS idx_produtos_nome ON produtos (nome);

CREATE INDEX IF NOT EXISTS idx_produtos_categoria ON produtos (categoria);

CREATE INDEX IF NOT EXISTS idx_produtos_disponivel ON produtos (disponivel);

CREATE INDEX IF NOT EXISTS idx_produtos_criado_em ON produtos (criado_em);

-- Tabela de pedidos
CREATE TABLE IF NOT EXISTS pedidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'em_andamento', -- Status: em_andamento, preparando, pronto, finalizado, cancelado
    total DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    observacoes TEXT, -- Observações do pedido
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
);

-- Tabela de itens do pedido
CREATE TABLE IF NOT EXISTS itens_pedido (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pedido_id INTEGER NOT NULL,
    produto_id INTEGER NOT NULL,
    quantidade INTEGER NOT NULL DEFAULT 1,
    preco_unitario DECIMAL(10, 2) NOT NULL, -- Preço no momento da compra
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pedido_id) REFERENCES pedidos (id) ON DELETE CASCADE,
    FOREIGN KEY (produto_id) REFERENCES produtos (id) ON DELETE CASCADE
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_pedidos_usuario_id ON pedidos (usuario_id);

CREATE INDEX IF NOT EXISTS idx_pedidos_status ON pedidos (status);

CREATE INDEX IF NOT EXISTS idx_pedidos_criado_em ON pedidos (criado_em);

CREATE INDEX IF NOT EXISTS idx_pedidos_atualizado_em ON pedidos (atualizado_em);

CREATE INDEX IF NOT EXISTS idx_itens_pedido_pedido_id ON itens_pedido (pedido_id);

CREATE INDEX IF NOT EXISTS idx_itens_pedido_produto_id ON itens_pedido (produto_id);

CREATE INDEX IF NOT EXISTS idx_itens_pedido_criado_em ON itens_pedido (criado_em);