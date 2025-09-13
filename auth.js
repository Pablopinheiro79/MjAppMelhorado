// auth.js
import { auth } from './firebase.js';
import { signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { validarCPF, cpfParaEmail } from './utils.js';

// ✅ Importando Cleave.js via ES6 (corrige erro "Cleave is not defined")
import Cleave from "https://cdn.jsdelivr.net/npm/cleave.js@1.6.0/dist/cleave-esm.min.js";

document.addEventListener('DOMContentLoaded', () => {
  // Máscara para CPF
  new Cleave('#cpf', {
    delimiters: ['.', '.', '-'],
    blocks: [3, 3, 3, 2],
    numericOnly: true
  });

  const form = document.getElementById('loginForm');
  const loader = document.getElementById('loader');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const cpf = document.getElementById('cpf').value;
    const senha = document.getElementById('senha').value;

    if (!validarCPF(cpf)) {
      alert('CPF inválido!');
      return;
    }

    try {
      loader.style.display = 'block';

      const email = cpfParaEmail(cpf);
      await signInWithEmailAndPassword(auth, email, senha);

      window.location.href = 'registrar.html';
    } catch (error) {
      console.error('Erro no login:', error);
      alert('Erro no login: ' + error.message);
    } finally {
      loader.style.display = 'none';
    }
  });
});
