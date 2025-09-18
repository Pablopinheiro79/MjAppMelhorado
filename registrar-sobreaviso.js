import { auth, db } from './firebase.js';
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { buscarDadosMedico, calcularValorPlantao } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
  onAuthStateChanged(auth, (user) => {
    if (!user) return;
    const uid = user.uid;
    const form = document.getElementById('sobreavisoForm');

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
          tipo: "SOBREAVISO",
          horas: 0,
          valor: calcularValorPlantao(0, "", dataSelecionada, "SOBREAVISO", medico?.especialidade)
        };

        await addDoc(collection(db, "plantoes"), dados);

        Swal.fire({
          icon: "success",
          title: "Sobreaviso registrado!",
          text: "O sobreaviso foi salvo com sucesso.",
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
          title: "Erro ao registrar sobreaviso",
          text: error.message,
          confirmButtonColor: "#FFD700",
          background: "#111",
          color: "#fff"
        });
      }
    });
  });
});
