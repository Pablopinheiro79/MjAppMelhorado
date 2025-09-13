import { db, auth } from "./firebase.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

let plantoes = [];

// Buscar plantões do usuário logado
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  const q = query(collection(db, "plantoes"), where("uid", "==", user.uid));
  const querySnapshot = await getDocs(q);

  plantoes = querySnapshot.docs.map(doc => doc.data());

  atualizarTabela();
});

// Aplicar filtros
function aplicarFiltros(lista) {
  const filtroHospital = document.getElementById("filtroHospital").value;
  const filtroMes = document.getElementById("filtroMes").value;

  return lista.filter(p => {
    let passaHospital = filtroHospital === "Todos" || p.hospital === filtroHospital;

    let mesPlantao = "";
    if (p.data) {
      mesPlantao = new Date(p.data).getMonth() + 1; // Janeiro = 0
      mesPlantao = mesPlantao.toString().padStart(2, "0");
    }

    let passaMes = filtroMes === "Todos" || mesPlantao === filtroMes;

    return passaHospital && passaMes;
  });
}

// Atualizar tabela
function atualizarTabela() {
  const plantoesFiltrados = aplicarFiltros(plantoes);
  renderizarTabela(plantoesFiltrados);
}

// Renderizar tabela
function renderizarTabela(lista) {
  const tbody = document.getElementById("listaPlantoes");
  tbody.innerHTML = "";

  let total = 0;

  lista.forEach(p => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.data}</td>
      <td>${p.hospital}</td>
      <td>${p.cargaHoraria || "-"}</td>
      <td>R$ ${p.valor.toFixed(2)}</td>
    `;
    tbody.appendChild(tr);
    total += p.valor;
  });

  document.getElementById("resumoPlantoes").innerText = `Total: R$ ${total.toFixed(2)}`;
}

// Eventos dos filtros
document.getElementById("filtroHospital").addEventListener("change", atualizarTabela);
document.getElementById("filtroMes").addEventListener("change", atualizarTabela);

// Exportar CSV
document.getElementById("exportarCSV").addEventListener("click", () => {
  let csv = "Data,Hospital,Carga Horária,Valor\n";
  const lista = aplicarFiltros(plantoes);

  lista.forEach(p => {
    csv += `${p.data},${p.hospital},${p.cargaHoraria || "-"},${p.valor}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "plantoes.csv";
  a.click();
  URL.revokeObjectURL(url);
});

