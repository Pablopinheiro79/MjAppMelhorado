// admin.js
import { db } from './firebase.js';
import { collection, getDocs } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { formatarData, calcularValorPlantao } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
  const tabela = document.querySelector('#tabelaPlantoes tbody');

  try {
    const snapshot = await getDocs(collection(db, 'plantoes'));
    tabela.innerHTML = "";

    snapshot.forEach(doc => {
      const dados = doc.data();

      const valor = calcularValorPlantao(
        dados.horas || 0,
        dados.hospital,
        dados.data,
        dados.tipo,
        dados.especialidade,
        dados.horaInicio || null
      );

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${dados.medico || ""}</td>
        <td>${dados.especialidade || ""}</td>
        <td>${formatarData(dados.data) || ""}</td>
        <td>${dados.hospital || ""}</td>
        <td>${dados.tipo || "PLANTAO"}</td>
        <td>${dados.horas || "-"}</td>
        <td>R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
      `;

      tabela.appendChild(tr);
    });
  } catch (error) {
    console.error("Erro ao carregar plantões:", error);
  }
});
