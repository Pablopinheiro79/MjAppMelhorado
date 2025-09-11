// registrar.js - Final com Evolução e Sobreaviso
import { auth, db } from './firebase.js';
import { collection, addDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { buscarDadosMedico, calcularHorasTrabalhadas } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
  onAuthStateChanged(auth, (user) => {
    if (!user) return;
    const uid = user.uid;
    const form = document.getElementById('plantaoForm');
    const loader = document.getElementById('loader');

    let medicoCache = null;

    async function configurarFormulario() {
      medicoCache = await buscarDadosMedico(uid);

      // Mostrar checkbox de acordo com a especialidade
      if (medicoCache.especialidade === "CLINICO" || medicoCache.especialidade === "ESPECIALISTA") {
        document.getElementById('evolucaoContainer').style.display = "block";
      }

      if (medicoCache.especialidade === "ANESTESISTA") {
        document.getElementById('sobreavisoContainer').style.display = "block";
      }
    }

    configurarFormulario();

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      loader.style.display = 'block';

      const dataSelecionada = document.getElementById('data').value;
      const horaInicio = document.getElementById('horaInicio').value;
      const horaFim = document.getElementById('horaFim').value;
      const checkEvolucao = document.getElementById('checkEvolucao')?.checked;
      const checkSobreaviso = document.getElementById('checkSobreaviso')?.checked;

      const hospitalSelecionado = document.querySelector('input[name="hospital"]:checked');
      if (!hospitalSelecionado) {
        Toastify({ text: 'Selecione o hospital.', style: { background: 'red' } }).showToast();
        loader.style.display = 'none';
        return;
      }

      try {
        let dadosPlantao = {
          uid,
          medico: medicoCache.nome,
          especialidade: medicoCache.especialidade || "NÃO INFORMADA",
          data: dataSelecionada,
          hospital: hospitalSelecionado.value
        };

        if (checkEvolucao) {
          dadosPlantao.tipo = "EVOLUCAO";
          dadosPlantao.horas = 0;
        } else if (checkSobreaviso) {
          dadosPlantao.tipo = "SOBREAVISO";
          dadosPlantao.horas = 0;
        } else {
          const horas = calcularHorasTrabalhadas(horaInicio, horaFim);
          if (horas <= 0) {
            Toastify({ text: 'Horas inválidas.', style: { background: 'red' } }).showToast();
            loader.style.display = 'none';
            return;
          }
          dadosPlantao.horaInicio = horaInicio;
          dadosPlantao.horaFim = horaFim;
          dadosPlantao.horas = horas;
          dadosPlantao.tipo = "PLANTAO";
        }

        await addDoc(collection(db, 'plantoes'), dadosPlantao);

        Toastify({ text: 'Plantão registrado com sucesso! ✅', style: { background: 'green' } }).showToast();
        form.reset();
      } catch (error) {
        console.error('Erro ao salvar plantão:', error);
        Toastify({ text: 'Erro ao salvar. Tente novamente.', style: { background: 'red' } }).showToast();
      } finally {
        loader.style.display = 'none';
      }
    });
  });
});
