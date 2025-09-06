// registrar.js - Atualizado com validações robustas, feedback melhorado e loader
import { auth, db } from './firebase.js';
import { collection, addDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { validarCPF, buscarNomeMedico, gerarHoras } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
  onAuthStateChanged(auth, (user) => {
    if (!user) return;
    const uid = user.uid;
    const form = document.getElementById('plantaoForm');
    const loader = document.getElementById('loader');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      loader.style.display = 'block'; // Mostra loader

      const dataSelecionada = document.getElementById('data').value;
      const horaInicio = document.getElementById('horaInicio').value;
      const horaFim = document.getElementById('horaFim').value;

      // Validações aprimoradas
      if (!dataSelecionada.match(/^\d{4}-\d{2}-\d{2}$/)) {
        Toastify({ text: 'Data inválida. Use o formato AAAA-MM-DD.', backgroundColor: 'red' }).showToast();
        loader.style.display = 'none';
        return;
      }
      if (!horaInicio || !horaFim || horaInicio >= horaFim) {
        Toastify({ text: 'Horários inválidos. Início deve ser antes do fim.', backgroundColor: 'red' }).showToast();
        loader.style.display = 'none';
        return;
      }

      const hospitalSelecionado = document.querySelector('input[name="hospital"]:checked');
      if (!hospitalSelecionado) {
        Toastify({ text: 'Selecione o hospital.', backgroundColor: 'red' }).showToast();
        loader.style.display = 'none';
        return;
      }

      try {
        const nomeMedico = await buscarNomeMedico(uid);
        await addDoc(collection(db, 'plantoes'), {
          uid,
          medico: nomeMedico,
          data: dataSelecionada,
          horaInicio,
          horaFim,
          hospital: hospitalSelecionado.value
        });
        Toastify({ text: 'Plantão registrado com sucesso! ✅', backgroundColor: 'green' }).showToast();
        form.reset();
      } catch (error) {
        console.error('Erro ao salvar plantão:', error);
        Toastify({ text: 'Erro ao salvar. Tente novamente.', backgroundColor: 'red' }).showToast();
      } finally {
        loader.style.display = 'none'; // Esconde loader
      }
    });
  });

  // Gera horas ao carregar
  gerarHoras('horaInicio');
  gerarHoras('horaFim');
});