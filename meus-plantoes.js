// meus-plantoes.js - Carrega e exibe os plantões do médico logado com filtros
import { auth, db } from './firebase.js';
import { collection, getDocs, query, where } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { formatarData, calcularHorasTrabalhadas } from './utils.js';

let listaPlantões = [];

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    Toastify({ text: 'Usuário não autenticado. Faça login.', style: { background: 'red' } }).showToast();
    window.location.href = 'index.html';
    return;
  }

  const uid = user.uid;
  try {
    const snapshot = await getDocs(query(collection(db, 'plantoes'), where('uid', '==', uid)));
    listaPlantões = snapshot.docs.map(doc => doc.data());
    popularFiltros();
    renderizarTabela();
    aplicarFiltros();
  } catch (error) {
    console.error('Erro ao carregar plantões:', error);
    Toastify({ text: 'Erro ao carregar dados.', style: { background: 'red' } }).showToast();
  }
});

function renderizarTabela() {
  const tbody = document.querySelector('table tbody');
  tbody.innerHTML = '';
  let contagem = 0;
  let totalHoras = 0;

  listaPlantões.forEach(p => {
    if (!p.data || !p.horaInicio || !p.horaFim) return; // Pula entradas incompletas
    const horas = calcularHorasTrabalhadas(p.horaInicio, p.horaFim);
    const linha = `
      <tr>
        <td>${formatarData(p.data)}</td>
        <td>${p.horaInicio}</td>
        <td>${p.horaFim}</td>
        <td>${p.hospital || '-'}</td>
        <td>${horas}h</td>
      </tr>`;
    tbody.innerHTML += linha;
    contagem++;
    totalHoras += horas;
  });

  document.getElementById('contador').innerHTML = `<div><strong class="gold">${contagem} plantões encontrados (Total: ${totalHoras}h)</strong></div>`;
}

function aplicarFiltros() {
  const selMes = document.getElementById('mesAno');
  const selHospital = document.getElementById('filtroHospital');

  function filtrar() {
    let listaFiltrada = [...listaPlantões];

    if (selMes.value !== 'Todos') {
      const [mesNome, ano] = selMes.value.split(' ');
      const mes = converterMesNomeParaNumero(mesNome);
      listaFiltrada = listaFiltrada.filter(p => p.data?.startsWith(`${ano}-${mes}`));
    }

    if (selHospital.value !== 'Todos') {
      listaFiltrada = listaFiltrada.filter(p => p.hospital === selHospital.value);
    }

    listaPlantões = listaFiltrada; // Atualiza a lista global
    renderizarTabela();
  }

  selMes.addEventListener('change', filtrar);
  selHospital.addEventListener('change', filtrar);
}

function popularFiltros() {
  const selMes = document.getElementById('mesAno');
  const mesesSet = new Set();

  listaPlantões.forEach(p => {
    if (p.data) {
      const [ano, mes] = p.data.split('-');
      const nomeMes = new Date(`${p.data}T00:00:00`).toLocaleString('pt-BR', { month: 'long' });
      mesesSet.add(`${capitalize(nomeMes)} ${ano}`);
    }
  });

  selMes.innerHTML = '<option value="Todos">Todos</option>';
  Array.from(mesesSet).sort().forEach(m => {
    selMes.innerHTML += `<option value="${m}">${m}</option>`;
  });
}

function converterMesNomeParaNumero(nome) {
  const meses = {
    'Janeiro': '01', 'Fevereiro': '02', 'Março': '03',
    'Abril': '04', 'Maio': '05', 'Junho': '06',
    'Julho': '07', 'Agosto': '08', 'Setembro': '09',
    'Outubro': '10', 'Novembro': '11', 'Dezembro': '12'
  };
  return meses[nome] || '01';
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function exportarCSV() {
  const linhas = [];
  const tabela = document.querySelector('table');
  linhas.push(['Data', 'Hora Início', 'Hora Fim', 'Hospital', 'Horas Trabalhadas']); // Cabeçalho

  for (const row of tabela.rows) {
    if (row.cells.length > 1) { // Pula o cabeçalho
      const cols = Array.from(row.cells).map(td => `"${td.innerText}"`);
      linhas.push(cols);
    }
  }

  const blob = new Blob([linhas.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'meus_plantões.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Torna a função exportarCSV global para o onclick no HTML
window.exportarCSV = exportarCSV;