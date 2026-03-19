const { db } = require("../config/database");

const TABLE = "contatos";

async function getAll() {
  const [rows] = await db.query(`SELECT * FROM ${TABLE} ORDER BY criado_em DESC`);
  return rows;
}

async function create({ nome_cliente, telefone_cliente, data, horario, corte_cabelo }) {
  const [result] = await db.query(
    `INSERT INTO ${TABLE} (nome_cliente, telefone_cliente, data, horario, corte_cabelo) VALUES (?, ?, ?, ?, ?)`,
    [nome_cliente, telefone_cliente, data, horario, corte_cabelo]
  );

  return { id: result.insertId };
}

async function remove(id) {
  const [result] = await db.query(`DELETE FROM ${TABLE} WHERE id = ?`, [id]);
  return result;
}

module.exports = { getAll, create, remove };
