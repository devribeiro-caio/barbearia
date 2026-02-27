const express = require('express');
require('dotenv').config();
const { MercadoPagoConfig, Payment } = require('mercadopago');

const app = express();
app.use(express.json());

// Configuração do cliente MercadoPago
const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN });
const payment = new Payment(client);

// Endpoint de pagamento
app.post('/pagamentos', async (req, res) => {
  try {
    const body = {
      transaction_amount: req.body.valor,
      description: req.body.descricao,
      payment_method_id: 'pix',
      payer: { email: req.body.email }
    };

    const response = await payment.create({ body });
    res.json(response); // devolve o resultado para o agenda.js
  } catch (error) {
    console.error("Erro ao criar pagamento:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log("Servidor rodando na porta 3000"));
