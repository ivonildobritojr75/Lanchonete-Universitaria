DROP DATABASE IF EXISTS Lanchonete;
CREATE DATABASE Lanchonete;
USE Lanchonete;

-- 🔹 Tabela de usuários (login)
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(255) NOT NULL,
    nome VARCHAR(100)
);

-- 🔹 Clientes
CREATE TABLE clientes(
    cpf VARCHAR(12) PRIMARY KEY,
    nome VARCHAR(45) NOT NULL,
    telefone VARCHAR(45) NOT NULL,
    email VARCHAR(80) NOT NULL
);

-- 🔹 Ingredientes
CREATE TABLE ingredientes(
    idIngrediente INT PRIMARY KEY,
    nomeIngrediente VARCHAR(45),
    quantIngrediente VARCHAR(45),
    unidadeMedida VARCHAR(45),
    dataValidade VARCHAR(80)
);

-- 🔹 Pratos (CARDÁPIO)
CREATE TABLE pratos(
    idPrato INT PRIMARY KEY,
    nomePrato VARCHAR(100),
    listaIngredientes VARCHAR(500)
);

INSERT INTO pratos VALUES
(1, 'Hambúrguer Clássico', 'Pão;Carne;Queijo;Alface;Tomate;Molho Especial;'),
(2, 'X-Bacon', 'Pão;Carne;Bacon;Queijo;Maionese;'),
(3, 'Cachorro Quente', 'Pão;Salsicha;Molho;Batata Palha;'),
(4, 'Pizza Mussarela', 'Massa;Molho;Queijo;Orégano;'),
(5, 'Pizza Calabresa', 'Massa;Molho;Calabresa;Cebola;Orégano;'),
(6, 'Suco de Laranja', 'Laranja;Água;Açúcar;'),
(7, 'Refrigerante Lata', 'Refrigerante;'),
(8, 'Coxinha de Frango', 'Frango;Massa;Farinha;'),
(9, 'Pastel de Carne', 'Carne;Massa;Tempero;'),
(10,'Bolo de Chocolate', 'Chocolate;Farinha;Açúcar;Ovos;Leite;');

-- 🔹 Mesas
CREATE TABLE mesas (
    idMesa INT PRIMARY KEY,
    capacidadeMesa INT NOT NULL,
    statusMesa BOOL NOT NULL DEFAULT TRUE,
    horario VARCHAR(45) NOT NULL
);

-- 🔹 Pedidos
CREATE TABLE pedidos (
    idPedido INT AUTO_INCREMENT PRIMARY KEY,
    cpfCliente VARCHAR(12),
    idMesa INT,
    dataHora DATETIME NOT NULL DEFAULT NOW(),
    total DECIMAL(10,2) DEFAULT 0
);

-- 🔹 Itens do pedido
CREATE TABLE itensPedido (
    idItem INT AUTO_INCREMENT PRIMARY KEY,
    idPedido INT,
    idPrato INT,
    quantidade INT,
    preco DECIMAL(10,2)
);
