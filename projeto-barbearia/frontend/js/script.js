// Renderizar contatos (GET)
async function renderContacts() {
  try {
    const res = await fetch("http://localhost:3001/contatos");
    const data = await res.json();

    if (!Array.isArray(data)) {
      console.error("Erro do servidor:", data);
      return;
    }

    let rows = "";
    data.forEach((c) => {
      // Melhora a exibição da data (evita o formato ISO com T03:00...)
      let dataExibicao = c.data;
      if (dataExibicao && dataExibicao.includes('T')) {
        dataExibicao = dataExibicao.split('T')[0];
      }
      const dataFormatada = dataExibicao.split('-').reverse().join('/');
      
      rows += `<tr>
        <td>${c.nome_cliente}</td>
        <td>${c.telefone_cliente}</td>
        <td>${c.corte_cabelo}</td>
        <td>${dataFormatada}</td>
        <td>${c.horario || "-"}</td>
        <td>
          <button class="btn btn-danger btn-sm delete-btn" data-id="${c.id}">Remover</button>
        </td>
      </tr>`;
    });
    
    $("#agendamentsTable tbody").html(rows);
  } catch (err) {
    console.error("Erro ao buscar contatos:", err);
  }
}

// Cadastrar contato (POST)
$("#contatoForm").on("submit", async function (e) {
  e.preventDefault();
  
  const contato = {
    nome_cliente: $("input[name='name']").val(),
    telefone_cliente: $("input[name='phone']").val(),
    data: $("input[name='date']").val(),
    horario: $("input[name='time']").val(),
    corte_cabelo: $("select[name='service']").val()
  };

  try {
    const res = await fetch("http://localhost:3001/contatos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(contato)
    });

    if (res.ok) {
      this.reset();
      await renderContacts();
      // Alerta de sucesso removido conforme solicitado
    } else {
      const errorData = await res.json();
      console.error("Erro ao agendar:", errorData.error);
    }
  } catch (err) {
    console.error("Erro ao salvar contato:", err);
  }
});

// Remover agendamento (DELETE) - REMOÇÃO DIRETA SEM AVISOS
$(document).on("click", ".delete-btn", async function() {
  const id = $(this).data("id");
  
  // Confirmação removida conforme solicitado
  try {
    const res = await fetch(`http://localhost:3001/contatos/${id}`, { 
      method: 'DELETE' 
    });
    
    if (res.ok) {
      await renderContacts(); // Atualiza a lista instantaneamente
    } else {
      console.error("Erro ao remover agendamento.");
    }
  } catch (err) {
    console.error("Erro ao remover:", err);
  }
});

// Inicial
$(document).ready(function() {
  renderContacts();
});
