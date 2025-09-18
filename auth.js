import { auth } from './firebase.js';
import { signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { validarCPF, cpfParaEmail } from './utils.js';

// ✅ Importando Cleave.js via ES6
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

  if (!form) {
    console.error("⚠️ Formulário de login não encontrado (id='loginForm').");
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const cpf = document.getElementById('cpf').value;
    const senha = document.getElementById('senha').value;

    if (!validarCPF(cpf)) {
      Swal.fire({
        icon: 'error',
        title: 'CPF inválido',
        text: 'Por favor, insira um CPF válido.',
        confirmButtonColor: '#FFD700',
        background: '#111',
        color: '#fff'
      });
      return;
    }

    try {
      if (loader) loader.style.display = 'block';

      const email = cpfParaEmail(cpf);
      await signInWithEmailAndPassword(auth, email, senha);

      // ✅ Redireciona para o Dashboard
      window.location.href = 'dashboard.html';

    } catch (error) {
      console.error('Erro no login:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erro no login',
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

