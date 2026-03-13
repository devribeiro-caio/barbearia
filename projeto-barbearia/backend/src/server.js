const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MercadoPagoConfig, Payment } = require("mercadopago");
const { db, testConnection } = require("./config/database");

const app = express();
app.use(cors());
app.use(express.json());

// 1. ROTA DE SAÚDE (HEALTH CHECK)
app.get("/health", async (req, res) => {
  try {
    await db.query("SELECT 1");
    res.json({ status: "online", database: "conectado" });
  } catch (err) {
    res.status(500).json({ status: "online", database: "erro", message: err.message });
  }
});

// 2. ROTAS DE AGENDAMENTOS (CONTATOS)
// GET: Lista todos os agendamentos
app.get("/contatos", async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM contatos ORDER BY criado_em DESC");
    res.json(results);
  } catch (err) {
    console.error("Erro ao buscar contatos:", err);
    res.status(500).json({ error: "Erro interno ao buscar agendamentos", detail: err.message });
  }
});

// POST: Cria um novo agendamento
app.post("/contatos", async (req, res) => {
  const { nome_cliente, telefone_cliente, data, horario, corte_cabelo } = req.body;
  
  if (!nome_cliente || !telefone_cliente || !data || !horario || !corte_cabelo) {
    return res.status(400).json({ error: "Preencha todos os campos obrigatórios (nome, telefone, data, horario, corte)." });
  }

  try {
    const sql = "INSERT INTO contatos (nome_cliente, telefone_cliente, data, horario, corte_cabelo) VALUES (?, ?, ?, ?, ?)";
    const [result] = await db.query(sql, [nome_cliente, telefone_cliente, data, horario, corte_cabelo]);
    res.status(201).json({ id: result.insertId, message: "Agendamento realizado com sucesso!" });
  } catch (err) {
    console.error("Erro ao salvar contato:", err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE: Remove um agendamento pelo ID
app.delete("/contatos/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query("DELETE FROM contatos WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Agendamento não encontrado." });
    }
    res.json({ message: "Agendamento removido com sucesso!" });
  } catch (err) {
    console.error("Erro ao remover contato:", err);
    res.status(500).json({ error: err.message });
  }
});

// 3. ROTA DE PAGAMENTO (MERCADO PAGO)
const mpToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
if (mpToken) {
  const client = new MercadoPagoConfig({ accessToken: mpToken });
  const payment = new Payment(client);

  app.post("/pagamentos", async (req, res) => {
    try {
      const body = {
        transaction_amount: req.body.valor,
        description: req.body.descricao,
        payment_method_id: "pix",
        payer: { email: req.body.email || "cliente@barbearia.com" }
      };
      const response = await payment.create({ body });
      res.json(response);
    } catch (error) {
      console.error("Erro MP:", error);
      res.status(500).json({ error: error.message });
    }
  });
}

// INICIALIZAÇÃO
const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
  console.log(`\n--- Servidor Rodando: http://localhost:${PORT} ---`);
  await testConnection();
});
