// cadastro.js - Atualizado com especialidade, validações e confirmação de senha
import { auth, db } from './firebase.js';
import { createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { doc, setDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { validarCPF, cpfParaEmail, validarSenha } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('cadastroForm');
  const loader = document.getElementById('loader');

  // Máscara para CPF
  new Cleave('#cpf', {
    delimiters: ['.', '.', '-'],
    blocks: [3, 3, 3, 2],
    numericOnly: true
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    loader.style.display = 'block';

    const nome = document.getElementById('nome').value.trim();
    const cpf = document.getElementById('cpf').value.trim();
    const senha = document.getElementById('senha').value;
    const confirmaSenha = document.getElementById('confirmaSenha').value;
    const especialidade = document.querySelector('input[name="especialidade"]:checked')?.value;

    // Validações
    if (!nome || !cpf || !senha || !confirmaSenha || !especialidade) {
      Toastify({ text: 'Preencha todos os campos e selecione a especialidade.', backgroundColor: 'red' }).showToast();
      loader.style.display = 'none';
      return;
    }
    if (!validarCPF(cpf)) {
      Toastify({ text: 'CPF inválido.', backgroundColor: 'red' }).showToast();
      loader.style.display = 'none';
      return;
    }
    if (!validarSenha(senha)) {
      Toastify({ text: 'Senha deve ter 8+ chars, 1 maiúscula, 1 dígito e 1 especial.', backgroundColor: 'red' }).showToast();
      loader.style.display = 'none';
      return;
    }
    if (senha !== confirmaSenha) {
      Toastify({ text: 'Senhas não coincidem.', backgroundColor: 'red' }).showToast();
      loader.style.display = 'none';
      return;
    }

    try {
      const email = cpfParaEmail(cpf);
      const credenciais = await createUserWithEmailAndPassword(auth, email, senha);
      const uid = credenciais.user.uid;

      // Salva dados no Firestore incluindo especialidade
      await setDoc(doc(db, 'medicos', uid), { 
        nome, 
        cpf, 
        especialidade 
      });

      Toastify({ text: 'Cadastro realizado com sucesso!', backgroundColor: 'green' }).showToast();
      window.location.href = 'index.html';
    } catch (error) {
      Toastify({ text: 'Erro no cadastro: ' + error.message, backgroundColor: 'red' }).showToast();
    } finally {
      loader.style.display = 'none';
    }
  });
});
