const contatoModel = require("../models/contato.model");

function validatePayload(body) {
  const required = ["nome_cliente", "telefone_cliente", "data", "horario", "corte_cabelo"];
  const missing = required.filter((key) => !body?.[key]);
  if (missing.length) {
    return `Preencha todos os campos obrigatórios: ${missing.join(", ")}`;
  }
  return null;
}

async function list(req, res) {
  try {
    const contatos = await contatoModel.getAll();
    res.json(contatos);
  } catch (err) {
    console.error("Erro ao buscar contatos:", err);
    res.status(500).json({ error: "Erro interno ao buscar agendamentos" });
  }
}

async function create(req, res) {
  const errorMessage = validatePayload(req.body);
  if (errorMessage) {
    return res.status(400).json({ error: errorMessage });
  }

  try {
    const created = await contatoModel.create(req.body);
    res.status(201).json({ id: created.id, message: "Agendamento realizado com sucesso!" });
  } catch (err) {
    console.error("Erro ao salvar contato:", err);
    res.status(500).json({ error: "Erro interno ao salvar agendamento" });
  }
}

async function remove(req, res) {
  const { id } = req.params;
  try {
    const result = await contatoModel.remove(id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Agendamento não encontrado." });
    }
    res.json({ message: "Agendamento removido com sucesso!" });
  } catch (err) {
    console.error("Erro ao remover contato:", err);
    res.status(500).json({ error: "Erro interno ao remover agendamento" });
  }
}

module.exports = { list, create, remove };
