const prompt = require("prompt-sync")({ sigint: true });
const { db } = require("./src/config/database");

const SERVICOS = [
  { id: 1, nome: "Corte de Cabelo", preco: 35 },
  { id: 2, nome: "Barba", preco: 20 },
  { id: 3, nome: "Corte + Barba", preco: 50 },
  { id: 4, nome: "Corte + Luzes", preco: 100 }
];

async function agendaCLI() {
  console.log("\n====================================");
  console.log("      AGENDAMENTO BARBEARIA BRUTU'S  ");
  console.log("====================================\n");

  const nome = prompt("Nome do Cliente: ");
  const telefone = prompt("Telefone: ");
  const data = prompt("Data (DD-MM-AAAA): ");
  const horario = prompt("Horário (HH:MM): ");

  console.log("\nServiços:");
  SERVICOS.forEach(s => console.log(`${s.id}. ${s.nome} (R$ ${s.preco.toFixed(2)})`));
  const escolha = parseInt(prompt("\nEscolha o número do serviço: "));
  const servico = SERVICOS.find(s => s.id === escolha);

  if (!servico) {
    console.error("\n[ERRO] Serviço inválido!");
    process.exit(1);
  }

  console.log(`\n--- RESUMO DO AGENDAMENTO ---`);
  console.log(`Cliente: ${nome}`);
  console.log(`Data: ${data} às ${horario}`);
  console.log(`Serviço: ${servico.nome}`);
  console.log(`Valor: R$ ${servico.preco.toFixed(2)}`);
  
  const confirmar = prompt("\nConfirma o agendamento? (s/n): ").toLowerCase();
  if (confirmar !== 's') {
    console.log("\nAgendamento cancelado.");
    process.exit(0);
  }

  try {
    const sql = "INSERT INTO contatos (nome_cliente, telefone_cliente, data, horario, corte_cabelo) VALUES (?, ?, ?, ?, ?)";
    const [result] = await db.query(sql, [nome, telefone, data, horario, servico.nome]);
    
    console.log("\n====================================");
    console.log("   AGENDAMENTO SALVO COM SUCESSO!   ");
    console.log(`   ID: ${result.insertId} | Valor: R$ ${servico.preco.toFixed(2)} `);
    console.log("====================================\n");
  } catch (err) {
    console.error("\n[ERRO] Falha ao salvar no banco:", err.message);
  } finally {
    process.exit(0);
  }
}

agendaCLI();
