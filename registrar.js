// registrar.js - Final com Evolução e Sobreaviso (corrigido para salvar valor)
import { auth, db } from './firebase.js';
import { collection, addDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { buscarDadosMedico, calcularHorasTrabalhadas, calcularValorPlantao } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
  onAuthStateChanged(auth, (user) => {
    if (!user) return;
    const uid = user.uid;
    const form = document.getElementById('registrarForm');
    const loader = document.getElementById('loader');

    let medicoCache = null;

    async function configurarFormulario() {
      medicoCache = await buscarDadosMedico(uid);

      // Mostrar checkbox de acordo com a especialidade
      if (medicoCache?.especialidade?.toUpperCase() === "CLINICO" || medicoCache?.especialidade?.toUpperCase() === "ESPECIALISTA") {
        document.getElementById('evolucaoContainer')?.style && (document.getElementById('evolucaoContainer').style.display = "block");
      }

      if (medicoCache?.especialidade?.toUpperCase() === "ANESTESISTA") {
        document.getElementById('sobreavisoContainer')?.style && (document.getElementById('sobreavisoContainer').style.display = "block");
      }
    }

    configurarFormulario();

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (loader) loader.style.display = 'block';

      const dataSelecionada = document.getElementById('data').value;
      const horaInicio = document.getElementById('horaInicio').value;
      const horaFim = document.getElementById('horaFim').value;
      const hospitalSelecionado = document.getElementById('hospital').value;

      const checkEvolucao = document.getElementById('checkEvolucao')?.checked;
      const checkSobreaviso = document.getElementById('checkSobreaviso')?.checked;

      if (!hospitalSelecionado) {
        Swal.fire({
          icon: 'warning',
          title: 'Selecione o hospital',
          text: 'É necessário escolher um hospital para registrar o plantão.',
          confirmButtonColor: '#FFD700',
          background: '#111',
          color: '#fff'
        });
        if (loader) loader.style.display = 'none';
        return;
      }

      try {
        let dadosPlantao = {
          uid,
          medico: medicoCache?.nome || "DESCONHECIDO",
          especialidade: medicoCache?.especialidade?.toUpperCase() || "NÃO INFORMADA",
          data: dataSelecionada,
          hospital: hospitalSelecionado
        };

        if (checkEvolucao) {
          dadosPlantao.tipo = "EVOLUCAO";
          dadosPlantao.horas = 0;
          dadosPlantao.valor = calcularValorPlantao(0, dadosPlantao.hospital, dadosPlantao.data, "EVOLUCAO", dadosPlantao.especialidade);
        } else if (checkSobreaviso) {
          dadosPlantao.tipo = "SOBREAVISO";
          dadosPlantao.horas = 0;
          dadosPlantao.valor = calcularValorPlantao(0, dadosPlantao.hospital, dadosPlantao.data, "SOBREAVISO", dadosPlantao.especialidade);
        } else {
          const horas = calcularHorasTrabalhadas(horaInicio, horaFim);
          if (horas <= 0) {
            Swal.fire({
              icon: 'error',
              title: 'Horas inválidas',
              text: 'Verifique os horários de início e fim.',
              confirmButtonColor: '#FFD700',
              background: '#111',
              color: '#fff'
            });
            if (loader) loader.style.display = 'none';
            return;
          }
          dadosPlantao.horaInicio = horaInicio;
          dadosPlantao.horaFim = horaFim;
          dadosPlantao.horas = horas;
          dadosPlantao.tipo = "PLANTAO";
          dadosPlantao.valor = calcularValorPlantao(horas, dadosPlantao.hospital, dadosPlantao.data, "PLANTAO", dadosPlantao.especialidade, horaInicio);
        }

        await addDoc(collection(db, 'plantoes'), dadosPlantao);

        Swal.fire({
          icon: 'success',
          title: 'Plantão registrado!',
          text: 'O plantão foi salvo com sucesso.',
          confirmButtonColor: '#FFD700',
          background: '#111',
          color: '#fff'
        }).then(() => {
          form.reset();
        });

      } catch (error) {
        console.error('Erro ao salvar plantão:', error);
        Swal.fire({
          icon: 'error',
          title: 'Erro ao salvar plantão',
          text: error.message,
          confirmButtonColor: '#FFD700',
          background: '#111',
          color: '#fff'
        });
      } finally {
        if (loader) loader.style.display = 'none';
      }
    });
  });
});
