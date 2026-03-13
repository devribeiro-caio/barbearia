-- Criar o banco de dados
CREATE DATABASE IF NOT EXISTS projeto_barbearia;
USE projeto_barbearia;

-- Tabela contatos (usada no backend)
CREATE TABLE IF NOT EXISTS contatos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome_cliente VARCHAR(100) NOT NULL,
  telefone_cliente VARCHAR(20) NOT NULL,
  data DATE NOT NULL,
  corte_cabelo VARCHAR(100) NOT NULL
);

-- Tabela de clientes
CREATE TABLE clientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  telefone VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de serviços (tipos de corte, barba, etc.)
CREATE TABLE servicos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  preco DECIMAL(10,2) NOT NULL
);

-- Tabela de agendamentos
CREATE TABLE agendamentos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT NOT NULL,
  servico_id INT NOT NULL,
  data DATETIME NOT NULL,
  observacoes TEXT,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id),
  FOREIGN KEY (servico_id) REFERENCES servicos(id)
);

-- Inserir dados de teste
INSERT INTO clientes (nome, telefone, email)
VALUES
('João Silva', '11999999999', 'joao@email.com'),
('Maria Souza', '11888888888', 'maria@email.com');

INSERT INTO servicos (nome, preco)
VALUES
('Corte Social', 40.00),
('Degradê', 50.00),
('Barba Completa', 30.00);

INSERT INTO agendamentos (cliente_id, servico_id, data, observacoes)
VALUES
(1, 1, '2026-03-05 14:00:00', 'Primeira visita'),
(2, 2, '2026-03-06 10:30:00', 'Cliente frequente');
  