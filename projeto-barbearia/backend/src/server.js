const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

// Load env vars from backend/.env (when running from the repo root)
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const { MercadoPagoConfig, Payment } = require("mercadopago");
const { testConnection } = require("./config/database");
const contatosRoutes = require("./routes/contatos.routes");

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", async (req, res) => {
  try {
    await testConnection();
    res.json({ status: "online", database: "conectado" });
  } catch (err) {
    res.status(500).json({ status: "offline", database: "erro", message: err.message });
  }
});

// API routes
app.use("/api/contatos", contatosRoutes);

// Optional MercadoPago route (requires MERCADOPAGO_ACCESS_TOKEN)
const mpToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
if (mpToken) {
  const client = new MercadoPagoConfig({ accessToken: mpToken });
  const payment = new Payment(client);

  app.post("/api/pagamentos", async (req, res) => {
    try {
      const body = {
        transaction_amount: req.body.valor,
        description: req.body.descricao,
        payment_method_id: "pix",
        payer: { email: req.body.email || "cliente@barbearia.com" },
      };
      const response = await payment.create({ body });
      res.json(response);
    } catch (error) {
      console.error("Erro MP:", error);
      res.status(500).json({ error: error.message });
    }
  });
}

// Serve built frontend when in production
if (process.env.NODE_ENV === "production") {
  const distPath = path.resolve(__dirname, "../../dist/frontend");
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get("/*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
  console.log(`\n--- Servidor rodando: http://localhost:${PORT} ---`);
  await testConnection();
});
