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

    const nome = document.getElementById('nome').value.trim();
    const cpf = document.getElementById('cpf').value.trim();
    const senha = document.getElementById('senha').value;
    const confirmarSenha = document.getElementById('confirmarSenha').value;
    const especialidade = document.getElementById('especialidade').value;

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

    if (!especialidade) {
      Swal.fire({
        icon: 'warning',
        title: 'Especialidade obrigatória',
        text: 'Por favor, selecione sua especialidade.',
        confirmButtonColor: '#FFD700',
        background: '#111',
        color: '#fff'
      });
      return;
    }

    if (!validarSenha(senha)) {
      Swal.fire({
        icon: 'warning',
        title: 'Senha fraca',
        text: 'A senha deve ter pelo menos 8 caracteres, com letras maiúsculas, minúsculas, números e símbolo.',
        confirmButtonColor: '#FFD700',
        background: '#111',
        color: '#fff'
      });
      return;
    }

    if (senha !== confirmarSenha) {
      Swal.fire({
        icon: 'error',
        title: 'Senhas diferentes',
        text: 'A senha e a confirmação devem ser iguais.',
        confirmButtonColor: '#FFD700',
        background: '#111',
        color: '#fff'
      });
      return;
    }

    try {
      if (loader) loader.style.display = 'block';

      const email = cpfParaEmail(cpf);

      // Cria usuário no Firebase Auth
      const userCred = await createUserWithEmailAndPassword(auth, email, senha);

      // 🔹 Salva dados no Firestore com especialidade em MAIÚSCULO
      await setDoc(doc(db, 'usuarios', userCred.user.uid), {
        nome,
        cpf,
        especialidade: especialidade.toUpperCase(),
        criadoEm: new Date()
      });

      Swal.fire({
        icon: 'success',
        title: 'Cadastro realizado!',
        text: 'Agora você já pode acessar o MJ App.',
        confirmButtonColor: '#FFD700',
        background: '#111',
        color: '#fff'
      }).then(() => {
        window.location.href = "index.html";
      });

    } catch (error) {
      console.error("Erro no cadastro:", error);
      Swal.fire({
        icon: 'error',
        title: 'Erro ao cadastrar',
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

