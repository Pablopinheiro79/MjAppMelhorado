// main.js - Atualizado para usar campo "horas" direto do Firestore
import { db } from './firebase.js';
import { collection, getDocs } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { formatarData, calcularValorPlantao } from './utils.js';

let listaPlantoes = [];

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const snapshot = await getDocs(collection(db, 'plantoes'));
    listaPlantoes = snapshot.docs.map(doc => doc.data());
    popularFiltros();
    renderizarTabela(listaPlantoes);
    aplicarFiltros();
  } catch (error) {
    console.error('Erro ao carregar plantões:', error);
    Toastify({ text: 'Erro ao carregar dados.', style: { background: 'red' } }).showToast();
  }
});

function renderizarTabela(plantoes) {
  const tbody = document.querySelector('table tbody');
  tbody.innerHTML = '';

  const totaisPorMedico = {};

  plantoes.forEach(p => {
    if (!p.data || !p.horas) return;

    const valor = calcularValorPlantao(p.horas, p.hospital, p.data, "PLANTAO", p.especialidade);

    const linha = `
      <tr>
        <td>${p.medico || '-'}</td>
        <td>${p.especialidade || '-'}</td>
        <td>${formatarData(p.data)}</td>
        <td>${p.hospital || '-'}</td>
        <td>${p.horas}h</td>
        <td>R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
      </tr>`;
    tbody.innerHTML += linha;

    // Acumula por médico
    if (!totaisPorMedico[p.medico]) {
      totaisPorMedico[p.medico] = { horas: 0, valor: 0, qtd: 0 };
    }
    totaisPorMedico[p.medico].horas += p.horas;
    totaisPorMedico[p.medico].valor += valor;
    totaisPorMedico[p.medico].qtd++;
  });

  // Resumo por médico
  const resumo = document.getElementById('resumoMedicos');
  if (resumo) {
    resumo.innerHTML = '<h5 class="gold mt-3">Resumo por Médico</h5><ul>';
    Object.keys(totaisPorMedico).forEach(medico => {
      const { horas, valor, qtd } = totaisPorMedico[medico];
      resumo.innerHTML += `
        <li>
          <strong>${medico}</strong> 
          (${qtd} plantões, ${horas}h) → 
          <span class="gold">R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </li>
      `;
    });
    resumo.innerHTML += '</ul>';
  }
}

function aplicarFiltros() {
  const selMes = document.getElementById('mesAno');
  const selHospital = document.getElementById('filtroHospital');

  function filtrar() {
    let listaFiltrada = [...listaPlantoes];

    if (selMes.value !== 'Todos') {
      const [mesNome, ano] = selMes.value.split(' ');
      const mes = converterMesNomeParaNumero(mesNome);
      listaFiltrada = listaFiltrada.filter(p => p.data?.startsWith(`${ano}-${mes}`));
    }

    if (selHospital.value !== 'Todos') {
      listaFiltrada = listaFiltrada.filter(p => p.hospital === selHospital.value);
    }

    renderizarTabela(listaFiltrada);
  }

  selMes.addEventListener('change', filtrar);
  selHospital.addEventListener('change', filtrar);
}

function popularFiltros() {
  const selMes = document.getElementById('mesAno');
  const mesesSet = new Set();

  listaPlantoes.forEach(p => {
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
  linhas.push(['Médico', 'Especialidade', 'Data', 'Hospital', 'Horas', 'Valor']); 

  for (const row of tabela.rows) {
    if (row.cells.length > 1) {
      const cols = Array.from(row.cells).map(td => `"${td.innerText}"`);
      linhas.push(cols);
    }
  }

  const blob = new Blob([linhas.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'plantões_admin.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

window.exportarCSV = exportarCSV;
