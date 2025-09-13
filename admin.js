// admin.js
import { db } from './firebase.js';
import {
  collection,
  getDocs,
  query,
  orderBy
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', async () => {
  const tabelaPlantoes = document.getElementById('tabelaPlantoes').getElementsByTagName('tbody')[0];
  const resumoPlantoes = document.getElementById('resumoPlantoes');
  const filtroMedico = document.getElementById('filtroMedico');
  const filtroHospital = document.getElementById('filtroHospital');
  const filtroMes = document.getElementById('filtroMes');
  const exportarCSV = document.getElementById('exportarCSV');

  let todosPlantoes = [];

  // 🔹 Buscar plantões no Firestore
  async function carregarPlantoes() {
    try {
      const q = query(collection(db, 'plantoes'), orderBy('data', 'desc'));
      const querySnapshot = await getDocs(q);

      todosPlantoes = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      popularFiltroMedicos(todosPlantoes);
      exibirPlantoes(todosPlantoes);
    } catch (error) {
      console.error('Erro ao carregar plantões:', error);
      Toastify({
        text: "Erro ao carregar plantões",
        duration: 3000,
        backgroundColor: "red"
      }).showToast();
    }
  }

  // 🔹 Popular filtro de médicos dinamicamente
  function popularFiltroMedicos(plantoes) {
    const medicosUnicos = [...new Set(plantoes.map(p => p.medico).filter(Boolean))];
    filtroMedico.innerHTML = '<option value="Todos">Todos</option>';

    medicosUnicos.forEach(medico => {
      const option = document.createElement('option');
      option.value = medico;
      option.textContent = medico;
      filtroMedico.appendChild(option);
    });
  }

  // 🔹 Aplicar filtros
  function aplicarFiltros(plantoes) {
    const medicoSelecionado = filtroMedico.value;
    const hospitalSelecionado = filtroHospital.value;
    const mesSelecionado = filtroMes.value; // Ex: "01", "02", ..., "12"

    return plantoes.filter(p => {
      const dataPlantao = p.data ? new Date(p.data) : null;

      let passaMedico = medicoSelecionado === "Todos" || p.medico === medicoSelecionado;
      let passaHospital = hospitalSelecionado === "Todos" || p.hospital === hospitalSelecionado;
      let passaMes = true;

      if (mesSelecionado !== "Todos" && dataPlantao instanceof Date && !isNaN(dataPlantao)) {
        const mesPlantao = String(dataPlantao.getMonth() + 1).padStart(2, '0');
        passaMes = mesPlantao === mesSelecionado;
      }

      return passaMedico && passaHospital && passaMes;
    });
  }

  // 🔹 Exibir os plantões na tabela
  function exibirPlantoes(plantoes) {
    tabelaPlantoes.innerHTML = '';

    if (plantoes.length === 0) {
      tabelaPlantoes.innerHTML = '<tr><td colspan="5">Nenhum plantão encontrado</td></tr>';
      resumoPlantoes.innerHTML = '';
      return;
    }

    let totalValor = 0;

    plantoes.forEach(p => {
      const row = tabelaPlantoes.insertRow();

      row.insertCell(0).textContent = p.data || '-';
      row.insertCell(1).textContent = p.medico || '-';
      row.insertCell(2).textContent = p.hospital || '-';
      row.insertCell(3).textContent = p.horas || '-';
      row.insertCell(4).textContent = p.valor ? `R$ ${p.valor.toFixed(2)}` : 'R$ 0,00';

      totalValor += p.valor || 0;
    });

    resumoPlantoes.innerHTML = `
      <p><strong>${plantoes.length}</strong> plantões encontrados</p>
      <p><strong>Total a pagar:</strong> R$ ${totalValor.toFixed(2)}</p>
    `;
  }

  // 🔹 Exportar CSV
  function exportarParaCSV(plantoes) {
    if (!plantoes || plantoes.length === 0) {
      Toastify({
        text: "Nenhum plantão para exportar",
        duration: 3000,
        backgroundColor: "orange"
      }).showToast();
      return;
    }

    const header = ["Data", "Médico", "Hospital", "Horas", "Valor"];
    const rows = plantoes.map(p => [
      p.data || '',
      p.medico || '',
      p.hospital || '',
      p.horas || '',
      p.valor ? `R$ ${p.valor.toFixed(2)}` : 'R$ 0,00'
    ]);

    let csvContent = "data:text/csv;charset=utf-8," + [header, ...rows].map(e => e.join(";")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "plantoes_admin.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Eventos de filtro
  filtroMedico.addEventListener('change', () => exibirPlantoes(aplicarFiltros(todosPlantoes)));
  filtroHospital.addEventListener('change', () => exibirPlantoes(aplicarFiltros(todosPlantoes)));
  filtroMes.addEventListener('change', () => exibirPlantoes(aplicarFiltros(todosPlantoes)));

  // Exportar CSV
  exportarCSV.addEventListener('click', () => exportarParaCSV(aplicarFiltros(todosPlantoes)));

  // Inicializar
  carregarPlantoes();
});
