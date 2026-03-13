const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

let contatos = [];

app.get("/contatos", (req, res) => {
  res.json(contatos);
});

app.post("/contatos", (req, res) => {
  const contato = req.body;
  contatos.push(contato);
  res.status(201).json({ message: "Agendamento realizado!", contato });
});

app.delete("/contatos/:index", (req, res) => {
  const index = req.params.index;
  contatos.splice(index, 1);
  res.json({ message: "Agendamento removido com sucesso!" });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
