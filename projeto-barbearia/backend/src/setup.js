const mysql = require("mysql2/promise");
require("dotenv").config();

async function setup() {
  const config = {
    host: process.env.DB_HOST || "127.0.0.1",
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "caiocamisa7"
  };

  console.log("\n--- ATUALIZANDO BANCO DE DADOS ---");
  
  try {
    const connection = await mysql.createConnection(config);
    
    // 1. Criar o Banco
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_DATABASE || 'projeto_barbearia'}\``);
    await connection.query(`USE \`${process.env.DB_DATABASE}\``);

    // 2. Criar/Atualizar a Tabela com a coluna 'horario'
    const createTableSql = `
      CREATE TABLE IF NOT EXISTS contatos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome_cliente VARCHAR(100) NOT NULL,
        telefone_cliente VARCHAR(20) NOT NULL,
        data VARCHAR(20) NOT NULL,
        horario VARCHAR(20) NOT NULL,
        corte_cabelo VARCHAR(100) NOT NULL,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await connection.query(createTableSql);
    
    // Verificar se a coluna 'horario' já existe, senão adicionar
    const [columns] = await connection.query("SHOW COLUMNS FROM contatos LIKE 'horario'");
    if (columns.length === 0) {
      await connection.query("ALTER TABLE contatos ADD COLUMN horario VARCHAR(20) NOT NULL AFTER data");
      console.log("- Coluna 'horario' adicionada.");
    }

    console.log("- Tabela 'contatos' atualizada com sucesso.");
    await connection.end();
  } catch (err) {
    console.error("\n[ERRO] Não foi possível atualizar o banco:", err.message);
    process.exit(1);
  }
}

setup();
