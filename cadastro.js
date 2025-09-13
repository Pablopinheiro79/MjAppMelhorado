// cadastro.js
import { auth, db } from './firebase.js';
import { createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { setDoc, doc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { validarCPF, cpfParaEmail, validarSenha } from './utils.js';

// ✅ Importando Cleave.js via ES6
import Cleave from "https://cdn.jsdelivr.net/npm/cleave.js@1.6.0/dist/cleave-esm.min.js";

document.addEventListener('DOMContentLoaded', () => {
  // Máscara para CPF
  new Cleave('#cpf', {
    delimiters: ['.', '.', '-'],
    blocks: [3, 3, 3, 2],
    numericOnly: true
  });

  const form = document.getElementById('cadastroForm');
  const loader = document.getElementById('loader');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = document.getElementById('nome').value;
    const cpf = document.getElementById('cpf').value;
    const senha = document.getElementById('senha').value;
    const confirmarSenha = document.getElementById('confirmarSenha').value;
    const especialidade = document.querySelector('input[name="especialidade"]:checked')?.value;

    if (!validarCPF(cpf)) {
      alert('CPF inválido!');
      return;
    }

    if (!especialidade) {
      alert('Por favor, selecione sua especialidade.');
      return;
    }

    if (!validarSenha(senha)) {
      alert('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (senha !== confirmarSenha) {
      alert('As senhas não coincidem.');
      return;
    }

    try {
      loader.style.display = 'block';

      const email = cpfParaEmail(cpf);

      // Cria usuário no Firebase Auth
      await createUserWithEmailAndPassword(auth, email, senha);

      // Salva dados no Firestore
      await setDoc(doc(db, 'usuarios', cpf), {
        nome,
        cpf,
        especialidade,
        criadoEm: new Date()
      });

      alert('Cadastro realizado com sucesso!');
      window.location.href = 'index.html';
    } catch (error) {
      console.error('Erro no cadastro:', error);
      alert('Erro no cadastro: ' + error.message);
    } finally {
      loader.style.display = 'none';
    }
  });
});

