// auth.js - Atualizado com máscara, feedback e "lembrar-me"
import { auth } from './firebase.js';
import { signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { validarCPF, cpfParaEmail } from './utils.js';

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
    loader.style.display = 'block';

    const cpf = document.getElementById('cpf').value;
    const senha = document.getElementById('senha').value;
    const lembrar = document.getElementById('lembrar').checked;

    if (!cpf || !senha) {
      Toastify({ text: 'Preencha CPF e senha.', backgroundColor: 'red' }).showToast();
      loader.style.display = 'none';
      return;
    }
    if (!validarCPF(cpf)) {
      Toastify({ text: 'CPF inválido.', backgroundColor: 'red' }).showToast();
      loader.style.display = 'none';
      return;
    }

    try {
      const email = cpfParaEmail(cpf);
      await signInWithEmailAndPassword(auth, email, senha);
      if (lembrar) localStorage.setItem('lembrar', 'true');
      window.location.href = 'registrar.html';
    } catch (error) {
      Toastify({ text: 'CPF ou senha incorretos.', backgroundColor: 'red' }).showToast();
    } finally {
      loader.style.display = 'none';
    }
  });
});