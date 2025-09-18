import { auth, db } from './firebase.js';
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { buscarDadosMedico, calcularValorPlantao } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
  onAuthStateChanged(auth, (user) => {
    if (!user) return;
    const uid = user.uid;
    const form = document.getElementById('evolucaoForm');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const dataSelecionada = document.getElementById('data').value;

      try {
        const medico = await buscarDadosMedico(uid);

        let dados = {
          uid,
          medico: medico?.nome || "DESCONHECIDO",
          especialidade: medico?.especialidade || "NÃO INFORMADA",
          data: dataSelecionada,
          tipo: "EVOLUCAO",
          horas: 0,
          valor: calcularValorPlantao(0, "", dataSelecionada, "EVOLUCAO", medico?.especialidade)
        };

        await addDoc(collection(db, "plantoes"), dados);

        Swal.fire({
          icon: "success",
          title: "Evolução registrada!",
          text: "A evolução foi salva com sucesso.",
          confirmButtonColor: "#FFD700",
          background: "#111",
          color: "#fff"
        }).then(() => {
          form.reset();
        });

      } catch (error) {
        console.error(error);
        Swal.fire({
          icon: "error",
          title: "Erro ao registrar evolução",
          text: error.message,
          confirmButtonColor: "#FFD700",
          background: "#111",
          color: "#fff"
        });
      }
    });
  });
});
