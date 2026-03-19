const mysql = require("mysql2");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

// Configurações do Banco vindas do .env
const dbConfig = {
  host: process.env.DB_HOST || "127.0.0.1",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE || "projeto_barbearia",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Criação do Pool
const pool = mysql.createPool(dbConfig);

// Facilitador de consultas (Promise-based)
const db = pool.promise();

// Função para testar conexão
async function testConnection() {
  try {
    const [rows] = await db.query("SELECT 1");
    console.log(`\n[SUCESSO] Conectado ao MySQL em ${dbConfig.host}:${dbConfig.port}`);
    return true;
  } catch (err) {
    console.error("\n[ERRO] Falha na conexão com o Banco de Dados:");
    console.error(`- Mensagem: ${err.message}`);
    console.error(`- Verifique se o XAMPP está rodando na porta ${dbConfig.port}`);
    return false;
  }
}

module.exports = { db, testConnection, config: dbConfig };
