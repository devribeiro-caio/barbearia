import "../css/tailwind-input.css";

const API_BASE = import.meta.env.VITE_API_BASE ?? "/api";
const API_CONTATOS = `${API_BASE}/contatos`;

const state = {
  contacts: [],
  filter: "",
  orderBy: "name",
  payment: null,
};

const elements = {
  tableBody: document.getElementById("agendamentsTable"),
  orderBy: document.getElementById("orderBy"),
  search: document.getElementById("search"),
  form: document.getElementById("contatoForm"),
  paymentPanel: document.getElementById("paymentPanel"),
  paymentContent: document.getElementById("paymentContent"),
  paymentClose: document.getElementById("paymentClose"),
};

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR");
}

function normalizePhone(phone) {
  return (phone || "").replace(/\D/g, "");
}

function getFilteredContacts() {
  const search = state.filter.trim().toLowerCase();
  return state.contacts
    .filter((c) => {
      if (!search) return true;
      const phone = normalizePhone(c.telefone_cliente);
      return phone.includes(normalizePhone(search));
    })
    .sort((a, b) => {
      const key = state.orderBy;
      const aValue = (a[key] || "").toString().toLowerCase();
      const bValue = (b[key] || "").toString().toLowerCase();
      return aValue.localeCompare(bValue, "pt-BR", { numeric: true });
    });
}

function getServiceAmount(serviceName) {
  const mapping = {
    "Corte de Cabelo": 35,
    Barba: 30,
    "Corte + Barba": 60,
    "Corte + Luzes": 120,
    "Corte + Alizante": 120,
    Pezinho: 20,
    Sobrancelha: 20,
  };
  return mapping[serviceName] ?? 0;
}

function renderContacts() {
  const contacts = getFilteredContacts();
  const rows = contacts
    .map((c) => {
      const amount = getServiceAmount(c.corte_cabelo);
      return `
      <tr class="hover:bg-slate-50">
        <td class="py-3 px-4 font-medium text-slate-800">${c.nome_cliente}</td>
        <td class="py-3 px-4">${c.telefone_cliente}</td>
        <td class="py-3 px-4">${c.corte_cabelo}</td>
        <td class="py-3 px-4">${formatDate(c.data)}</td>
        <td class="py-3 px-4">${c.horario || "-"}</td>
        <td class="py-3 px-4 flex flex-wrap gap-2">
          <button data-id="${c.id}" class="btn-remove inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-sm font-semibold text-red-700 transition hover:bg-red-100 hover:text-red-800">
            Remover
          </button>
          <button data-id="${c.id}" data-amount="${amount}" data-service="${c.corte_cabelo}" class="btn-pay inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 hover:text-blue-800">
            Pagar
          </button>
        </td>
      </tr>
    `;
    })
    .join("\n");

  elements.tableBody.innerHTML = rows || `<tr><td colspan="6" class="py-6 text-center text-sm text-slate-500">Nenhum agendamento encontrado.</td></tr>`;
}

async function fetchContacts() {
  try {
    const res = await fetch(API_CONTATOS);
    if (!res.ok) throw new Error("Falha ao buscar contatos");
    state.contacts = await res.json();
    renderContacts();
  } catch (err) {
    console.error(err);
  }
}

async function createContact(payload) {
  const res = await fetch(API_CONTATOS, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Erro ao salvar agendamento");
  }

  await fetchContacts();
}

async function deleteContact(id) {
  const res = await fetch(`${API_CONTATOS}/${id}`, { method: "DELETE" });
  if (!res.ok) {
    throw new Error("Erro ao remover agendamento");
  }
  await fetchContacts();
}

function showPaymentPanel(html) {
  if (!elements.paymentPanel) return;
  elements.paymentContent.innerHTML = html;
  elements.paymentPanel.classList.remove("hidden");
}

function hidePaymentPanel() {
  if (!elements.paymentPanel) return;
  elements.paymentPanel.classList.add("hidden");
  elements.paymentContent.innerHTML = "";
}

async function createPayment({ id, amount, service }) {
  const payload = {
    valor: amount,
    descricao: `${service} (agendamento #${id})`,
    email: "cliente@barbearia.com",
  };

  const res = await fetch(`${API_BASE}/pagamentos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Erro ao gerar pagamento");
  }

  const data = await res.json();

  // Tenta extrair QR Code da resposta do MercadoPago
  const qrCode =
    data?.point_of_interaction?.transaction_data?.qr_code ||
    data?.point_of_interaction?.transaction_data?.qr_code_base64 ||
    data?.qr_code;

  const qrImage = qrCode
    ? `<img src="${qrCode.startsWith("data:") ? qrCode : `data:image/png;base64,${qrCode}`}" alt="QR Code PIX" class="h-48 w-48" />`
    : "<p class=\"text-sm text-slate-600\">Não foi possível gerar o QR Code. Verifique a resposta do servidor no console.</p>";

  showPaymentPanel(`
    <div class="grid gap-4">
      <p class="text-sm text-slate-700">Copie o código abaixo e pague via PIX (ou use o QR Code):</p>
      <div class="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-800">
        <pre class="whitespace-pre-wrap break-words">${data?.point_of_interaction?.transaction_data?.qr_code || data?.point_of_interaction?.transaction_data?.qr_code_base64 || "(dados não disponíveis)"}</pre>
      </div>
      <div class="flex justify-center">${qrImage}</div>
    </div>
  `);
}

function initEvents() {
  elements.search.addEventListener("input", (e) => {
    state.filter = e.target.value;
    renderContacts();
  });

  elements.orderBy.addEventListener("change", (e) => {
    state.orderBy = e.target.value;
    renderContacts();
  });

  elements.tableBody.addEventListener("click", async (event) => {
    const removeBtn = event.target.closest("button.btn-remove[data-id]");
    if (removeBtn) {
      const id = removeBtn.dataset.id;
      try {
        await deleteContact(id);
      } catch (err) {
        console.error(err);
      }
      return;
    }

    const payBtn = event.target.closest("button.btn-pay[data-id]");
    if (payBtn) {
      const id = payBtn.dataset.id;
      const amount = Number(payBtn.dataset.amount ?? 0);
      const service = payBtn.dataset.service;
      try {
        await createPayment({ id, amount, service });
      } catch (err) {
        console.error(err);
      }
    }
  });

  elements.form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(elements.form);
    const payload = {
      nome_cliente: formData.get("name"),
      telefone_cliente: formData.get("phone"),
      data: formData.get("date"),
      horario: formData.get("time"),
      corte_cabelo: formData.get("service"),
    };

    try {
      await createContact(payload);
      elements.form.reset();
    } catch (err) {
      console.error(err);
    }
  });

  if (elements.paymentClose) {
    elements.paymentClose.addEventListener("click", () => {
      hidePaymentPanel();
    });
  }
}

async function bootstrap() {
  initEvents();
  await fetchContacts();
}

bootstrap();
