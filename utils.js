// utils.js

// ----------------------
// Formatar data YYYY-MM-DD -> DD/MM/YYYY
// ----------------------
export function formatarData(dataStr) {
  if (!dataStr) return "";
  const [ano, mes, dia] = dataStr.split("-");
  return `${dia}/${mes}/${ano}`;
}

// ----------------------
// Calcular horas trabalhadas entre início e fim
// ----------------------
export function calcularHorasTrabalhadas(inicio, fim) {
  if (!inicio || !fim) return 0;
  const [h1, m1] = inicio.split(":").map(Number);
  const [h2, m2] = fim.split(":").map(Number);

  let start = h1 * 60 + m1;
  let end = h2 * 60 + m2;
  if (end < start) end += 24 * 60; // passou da meia-noite

  return Math.round((end - start) / 60);
}

// ----------------------
// Calcular valor do plantão
// ----------------------
export function calcularValorPlantao(
  horas,
  hospital,
  data,
  tipo = "PLANTAO",
  especialidade = "CLINICO",
  horaInicio = null
) {
  if (!data || !hospital) return 0;

  // ⚠️ Unimed ainda sem regra definida
  if (hospital.toUpperCase() === "UNIMED") {
    return 0;
  }

  // 📌 Casos especiais fixos
  if (tipo === "EVOLUCAO") {
    return 540;
  }
  if (tipo === "SOBREAVISO") {
    return 800;
  }

  const dataObj = new Date(data + "T00:00:00");
  const diaSemana = dataObj.getDay(); // 0 = Domingo ... 6 = Sábado
  const mmdd = data.substring(5); // "MM-DD"

  // 📌 Feriados normais
  const feriadosNormais = [
    "04-21", "05-01", "06-24", "07-26",
    "08-05", "09-07", "10-11", "10-12",
    "11-02", "11-15", "12-25"
  ];
  const ehFeriadoNormal = feriadosNormais.includes(mmdd);

  // 📌 Feriados especiais
  const eh2412 = mmdd === "12-24";
  const eh3112 = mmdd === "12-31";
  const eh2501 = mmdd === "12-25" || mmdd === "01-01";

  // 📌 Tabelas base (12h)
  const tabelaSemana12h = {
    CLINICO: 1080,
    ESPECIALISTA: 1300,
    ANESTESISTA: 1800
  };

  const tabelaFds12h = {
    CLINICO: 1290,
    ESPECIALISTA: 1500,
    ANESTESISTA: 2000
  };

  // 📌 Define valor base
  let valorBase = 0;
  const ehFDSouFeriado = diaSemana === 0 || diaSemana === 6 || ehFeriadoNormal;

  if (ehFDSouFeriado) {
    valorBase = tabelaFds12h[especialidade] || 0;
  } else {
    valorBase = tabelaSemana12h[especialidade] || 0;
  }

  // 📌 Ajusta proporcionalidade para 6h
  if (horas === 6) {
    valorBase = valorBase / 2;
  }

  // ----------------------
  // 📌 Regras de feriados especiais
  // ----------------------
  if (horaInicio) {
    const [h] = horaInicio.split(":").map(Number);

    // 24 e 31 Dez → dobra só se início >= 19h
    if ((eh2412 || eh3112) && h >= 19) {
      valorBase *= 2;
    }

    // 25 Dez e 01 Jan → dobra só se início < 19h (diurno)
    if (eh2501 && h < 19) {
      valorBase *= 2;
    }
  }

  return valorBase;
}
