// utils.js
import { db } from './firebase.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// ============================
// Função: Formatar data (dd-mm-aaaa)
// ============================
export function formatarData(dataStr) {
  if (!dataStr) return "";
  const d = new Date(dataStr);
  const dia = String(d.getUTCDate()).padStart(2, "0");
  const mes = String(d.getUTCMonth() + 1).padStart(2, "0");
  const ano = d.getUTCFullYear();
  return `${dia}-${mes}-${ano}`;
}

// ============================
// Função: Calcular horas trabalhadas
// ============================
export function calcularHorasTrabalhadas(horaInicio, horaFim) {
  if (!horaInicio || !horaFim) return 0;
  const [hIni, mIni] = horaInicio.split(":").map(Number);
  const [hFim, mFim] = horaFim.split(":").map(Number);

  let inicio = hIni * 60 + mIni;
  let fim = hFim * 60 + mFim;

  if (fim < inicio) {
    // passou da meia-noite
    fim += 24 * 60;
  }

  return Math.round((fim - inicio) / 60);
}

// ============================
// Função: Verificar se é fim de semana
// ============================
function ehFimDeSemana(dataStr) {
  const d = new Date(dataStr);
  const dia = d.getUTCDay(); // 0 = domingo, 6 = sábado
  return dia === 0 || dia === 6;
}

// ============================
// Lista de feriados fixos
// ============================
const feriadosFixos = [
  "01-01", // Confraternização Universal
  "21-04", // Tiradentes
  "01-05", // Dia do Trabalho
  "24-06", // São João
  "26-07", // Padroeira
  "05-08", // Aniversário da cidade
  "07-09", // Independência
  "11-10", // Data local
  "12-10", // Nossa Senhora Aparecida
  "02-11", // Finados
  "15-11", // Proclamação da República
  "25-12"  // Natal
];

// ============================
// Função: Verificar se é feriado
// ============================
function ehFeriado(dataStr) {
  const d = new Date(dataStr);
  const diaMes = d.toISOString().slice(5, 10); // "MM-DD"
  return feriadosFixos.includes(diaMes);
}

// ============================
// Função: Verificar se é feriado especial
// ============================
function ehFeriadoEspecial(dataStr) {
  const d = new Date(dataStr);
  const dia = d.getUTCDate();
  const mes = d.getUTCMonth() + 1;

  return (
    (dia === 24 && mes === 12) ||
    (dia === 25 && mes === 12) ||
    (dia === 31 && mes === 12) ||
    (dia === 1 && mes === 1)
  );
}

// ============================
// Valores base
// ============================
const valores = {
  semana: {
    CLINICO: { 12: 1080, 6: 540 },
    ESPECIALISTA: { 12: 1300, 6: 650 },
    ANESTESISTA: { 12: 1800, 6: 900 }
  },
  fds: {
    CLINICO: { 12: 1290, 6: 645 },
    ESPECIALISTA: { 12: 1500, 6: 750 },
    ANESTESISTA: { 12: 2000, 6: 1000 }
  },
  evolucao: 540,
  sobreaviso: 800,
  unimed: {
    semana: { 12: 1500, 6: 750 },
    fds: { 12: 1700, 6: 850 }
  }
};

// ============================
// Função principal: calcular valor do plantão
// ============================
export function calcularValorPlantao(horas, hospital, data, tipo, especialidade, horaInicio = null) {
  if (!especialidade) return 0;

  // 🔹 Normaliza especialidade para maiúsculo
  especialidade = especialidade.toUpperCase();

  // Evolução
  if (tipo === "EVOLUCAO") {
    return valores.evolucao;
  }

  // Sobreaviso
  if (tipo === "SOBREAVISO") {
    return valores.sobreaviso;
  }

  // Se não for 6h ou 12h, ignora
  if (![6, 12].includes(horas)) {
    return 0;
  }

  // 🔹 Regras exclusivas para UNIMED
  if (hospital === "Unimed") {
    if (ehFimDeSemana(data) || ehFeriado(data)) {
      return valores.unimed.fds[horas] || 0;
    } else {
      return valores.unimed.semana[horas] || 0;
    }
  }

  // 🔹 Demais hospitais
  let base = valores.semana;
  if (ehFimDeSemana(data) || ehFeriado(data)) {
    base = valores.fds;
  }

  let valor = base[especialidade]?.[horas] || 0;

  // 🔹 Feriados especiais (apenas hospitais que NÃO são Unimed)
  if (ehFeriadoEspecial(data)) {
    const d = new Date(data);
    const dia = d.getUTCDate();
    const mes = d.getUTCMonth() + 1;

    // 24 e 31 só dobram se começar às 19h ou mais
    if ((dia === 24 || dia === 31) && mes === 12) {
      if (horaInicio) {
        const [h] = horaInicio.split(":").map(Number);
        if (h >= 19) {
          valor *= 2;
        }
      }
    } else {
      // 25/12 e 01/01 dobram todo o dia
      valor *= 2;
    }
  }

  return valor;
}

// ============================
// Função: Converter CPF em e-mail para login
// ============================
export function cpfParaEmail(cpf) {
  const cpfLimpo = cpf.replace(/\D/g, '');
  return `${cpfLimpo}@mjapp.com`;
}

// ============================
// Função: Validar CPF
// ============================
export function validarCPF(cpf) {
  cpf = cpf.replace(/[^\d]+/g, '');
  if (cpf.length !== 11) return false;

  // Rejeita CPFs com todos os dígitos iguais
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  let soma = 0;
  let resto;

  // Primeiro dígito verificador
  for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  resto = (soma * 10) % 11;
  if ((resto === 10) || (resto === 11)) resto = 0;
  if (resto !== parseInt(cpf.substring(9, 10))) return false;

  // Segundo dígito verificador
  soma = 0;
  for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  resto = (soma * 10) % 11;
  if ((resto === 10) || (resto === 11)) resto = 0;
  if (resto !== parseInt(cpf.substring(10, 11))) return false;

  return true;
}

// ============================
// Função: Validar Senha Forte
// ============================
export function validarSenha(senha) {
  if (!senha) return false;

  // Pelo menos 8 caracteres, uma letra maiúscula, uma minúscula, um número e um caractere especial
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(senha);
}

// ============================
// Função: Buscar dados do médico no Firestore
// ============================
export async function buscarDadosMedico(uid) {
  try {
    // 🔹 Primeiro tenta buscar pelo UID
    let ref = doc(db, "usuarios", uid);
    let snap = await getDoc(ref);

    // 🔹 Se não encontrar, tenta buscar pelo CPF (caso tenha sido salvo assim)
    if (!snap.exists()) {
      console.warn("Usuário não encontrado pelo UID, tentando CPF...");
      ref = doc(db, "usuarios", uid.replace(/\D/g, "")); // remove pontos/hífens do CPF
      snap = await getDoc(ref);
    }

    if (snap.exists()) {
      return snap.data();
    } else {
      console.warn("Usuário não encontrado no Firestore.");
      return null;
    }
  } catch (error) {
    console.error("Erro ao buscar dados do médico:", error);
    return null;
  }
}
