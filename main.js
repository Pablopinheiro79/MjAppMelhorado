// main.js - Atualizado com paginação, lazy loading e validações
import { db } from './firebase.js';
import { collection, getDocs } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { formatarData, calcularHorasTrabalhadas } from './utils.js';

let dadosCompletos = [];
let paginaAtual = 1;
const itensPorPagina = 10;

async function carregarPlantões() {
  try {
    const snapshot = await getDocs(collection(db, 'plantoes'));
    dadosCompletos = snapshot.docs.map(doc => doc.data());
    popularFiltros(dadosCompletos);
    renderizarTabela(dadosCompletos.slice(0, itensPorPagina));
    aplicarFiltros(dadosCompletos);
    atualizarPaginacao(dadosCompletos.length);
  } catch (error) {
    console.error('Erro ao carregar plantões:', error);
    Toastify({ text: 'Erro ao carregar dados.', backgroundColor: 'red' }).showToast();
  }
}

function renderizarTabela(lista) {
  const tbody = document.querySelector('table tbody');
  tbody.innerHTML = '';

  let contagem = {};
  let horasTotais = {};

  lista.forEach(p => {
    if (!p.medico || !p.data || !p.horaInicio || !p.horaFim) return;
    const linha = `<tr><td>${formatarData(p.data)}</td><td>${p.horaInicio}</td><td>${p.horaFim}</td><td>${p.medico}</td><td>${p.hospital}</td></tr>`;
    tbody.innerHTML += linha;
    contagem[p.medico] = (contagem[p.medico] || 0) + 1;
    const horas = calcularHorasTrabalhadas(p.horaInicio, p.horaFim);
    horasTotais[p.medico] = (horasTotais[p.medico] || 0) + horas;
  });

  const contagemDiv = document.querySelector('.mb-4.text-end');
  contagemDiv.innerHTML = Object.keys(contagem).map(nome => `<div><strong class="gold">${nome}: ${contagem[nome]} plantões (Total: ${horasTotais[nome]}h)</strong></div>`).join('');
}

function aplicarFiltros(dados) {
  const selMes = document.querySelector('select:nth-of-type(1)');
  const selMedico = document.querySelector('select:nth-of-type(2)');
  const selHospital = document.querySelector('select:nth-of-type(3)');

  function filtrar() {
    let lista = [...dados];
    if (selMes.value !== 'Todos') {
      const [mesNome, ano] = selMes.value.split(' ');
      const mes = new Date(`${mesNome} 1, ${ano}`).getMonth() + 1;
      lista = lista.filter(p => p.data.startsWith(`${ano}-${String(mes).padStart(2, '0')}`));
    }
    if (selMedico.value !== 'Todos') lista = lista.filter(p => p.medico === selMedico.value);
    if (selHospital.value !== 'Todos') lista = lista.filter(p => p.hospital === selHospital.value);

    paginaAtual = 1;
    renderizarTabelaPaginada(lista);
    atualizarPaginacao(lista.length);
  }

  [selMes, selMedico, selHospital].forEach(sel => sel.addEventListener('change', filtrar));
}

function renderizarTabelaPaginada(dadosFiltrados) {
  const inicio = (paginaAtual - 1) * itensPorPagina;
  const fim = inicio + itensPorPagina;
  renderizarTabela(dadosFiltrados.slice(inicio, fim));
}

function atualizarPaginacao(totalItens) {
  const totalPaginas = Math.ceil(totalItens / itensPorPagina);
  const paginacaoDiv = document.getElementById('paginacao');
  paginacaoDiv.innerHTML = '';
  for (let i = 1; i <= totalPaginas; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.className = 'btn btn-outline-light mx-1';
    btn.onclick = () => {
      paginaAtual = i;
      renderizarTabelaPaginada(dadosFiltrados);
    };
    paginacaoDiv.appendChild(btn);
  }
}

function popularFiltros(dados) {
  const meses = new Set();
  const medicos = new Set();
  const hospitais = new Set();

  dados.forEach(p => {
    if (p.data) {
      const [ano, mes] = p.data.split('-');
      meses.add(`${converterNumeroParaMes(mes)} ${ano}`);
    }
    if (p.medico) medicos.add(p.medico);
    if (p.hospital) hospitais.add(p.hospital);
  });

  preencherSelect(document.querySelector('select:nth-of-type(1)'), meses, 'Mês');
  preencherSelect(document.querySelector('select:nth-of-type(2)'), medicos, 'Médico');
  preencherSelect(document.querySelector('select:nth-of-type(3)'), hospitais, 'Hospital');
}

function preencherSelect(select, itens, label) {
  select.innerHTML = `<option>Todos</option>`;
  [...itens].sort().forEach(item => {
    select.innerHTML += `<option>${item}</option>`;
  });
}

function exportarCSV() {
  const linhas = [];
  const tabela = document.querySelector('table');

  for (const row of tabela.rows) {
    const cols = Array.from(row.cells).map(td => `"${td.innerText}"`);
    linhas.push(cols.join(','));
  }

  const blob = new Blob([linhas.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'plantoes_mj.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

document.querySelector('.btn-gold').addEventListener('click', exportarCSV);
carregarPlantões();