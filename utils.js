// utils.js - Funções utilitárias compartilhadas para reduzir repetição e melhorar manutenibilidade
import { getDoc, doc, getFirestore } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js'; // Atualizado para versão mais recente

const db = getFirestore();

// Validação de CPF com algoritmo real (fonte: algoritmo brasileiro oficial)
function validarCPF(cpf) {
  cpf = cpf.replace(/\D/g, '');
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  let soma = 0, resto;
  for (let i = 1; i <= 9; i++) soma += parseInt(cpf[i - 1]) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf[9])) return false;
  soma = 0;
  for (let i = 1; i <= 10; i++) soma += parseInt(cpf[i - 1]) * (12 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  return resto === parseInt(cpf[10]);
}

// Converte CPF para e-mail (mantido para compatibilidade, mas considere usar e-mails reais)
function cpfParaEmail(cpf) {
  return cpf.replace(/\D/g, '') + '@mjapp.com';
}

// Formata data para dd/mm/aaaa
function formatarData(dataStr) {
  const [ano, mes, dia] = dataStr.split('-');
  return `${dia}/${mes}/${ano}`;
}

// Calcula horas trabalhadas com validação
function calcularHorasTrabalhadas(inicio, fim) {
  if (!inicio || !fim || !/^\d{2}:\d{2}$/.test(inicio) || !/^\d{2}:\d{2}$/.test(fim)) return 0;
  const [h1, m1] = inicio.split(':').map(Number);
  const [h2, m2] = fim.split(':').map(Number);
  let start = h1 * 60 + m1;
  let end = h2 * 60 + m2;
  if (end < start) end += 24 * 60;
  return Math.round((end - start) / 60);
}

// Gera opções de horas para selects (00:00 a 23:30)
function gerarHoras(selectId) {
  const select = document.getElementById(selectId);
  select.innerHTML = '<option value="">Selecione</option>';
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hora = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      const option = document.createElement('option');
      option.value = hora;
      option.textContent = hora;
      select.appendChild(option);
    }
  }
}

// Busca nome do médico no Firestore
async function buscarNomeMedico(uid) {
  try {
    const refMedico = doc(db, 'medicos', uid);
    const snap = await getDoc(refMedico);
    if (!snap.exists()) throw new Error('Nome do médico não encontrado');
    return snap.data().nome;
  } catch (error) {
    console.error('Erro ao buscar médico:', error);
    throw error;
  }
}

// Validação de senha forte
function validarSenha(senha) {
  return /(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}/.test(senha); // Mín 8 chars, 1 maiúscula, 1 dígito, 1 especial
}

// Testes básicos (use Jest para executar): 
// test('validarCPF', () => expect(validarCPF('12345678909')).toBe(true));
// test('formatarData', () => expect(formatarData('2023-10-15')).toBe('15/10/2023'));

export { validarCPF, cpfParaEmail, formatarData, calcularHorasTrabalhadas, gerarHoras, buscarNomeMedico, validarSenha };