

// Sistema de agendamento de barbearia
const express = require('express');
const mercadopago = require('mercadopago');
const axios = require('axios');
const prompt = require('prompt-sync')();





// Lista de serviços disponíveis
const servicos = [
  { nome: "Corte de Cabelo", preco: 35 },
  { nome: "Barba", preco: 20 },
  { nome: "Corte + Barba", preco: 50 }
];

// Função para agendar serviço
function agendarServico(nome) {
    console.log("Bem-vindo à Barbearia!");
    nome = prompt("Digite seu nome: ");
  console.log("Serviços disponíveis:");
  servicos.forEach((s, i) => console.log(`${i + 1} - ${s.nome} (R$${s.preco})`));

  let escolha = parseInt(prompt("Digite o número do serviço desejado:"));
  let servicoEscolhido = servicos[escolha - 1];

  if (!servicoEscolhido) {
    console.log("Serviço inválido. Tente novamente.");
    return;
  }

  console.log(`Agendamento feito para ${nome}, serviço: ${servicoEscolhido.nome}, valor: R$${servicoEscolhido.preco}`);

  // Exemplo de integração com API de pagamento
  fetch("http://localhost:3000/pagamentos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      valor: servicoEscolhido.preco,
      descricao: servicoEscolhido.nome,
      email: "cliente@teste.com"
    })
  })
    .then(res => res.json())
    .then(data => console.log("Pagamento registrado:", data))
    .catch(err => console.error("Erro no pagamento:", err));
}

// Exemplo de chamada
agendarServico();

