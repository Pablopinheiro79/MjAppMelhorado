// authGuard.js - Atualizado com loader e verificação de roles
import { auth } from './firebase.js';
import { onAuthStateChanged, getIdTokenResult } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';

const loader = document.getElementById('auth-loading');

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = 'index.html';
    return;
  }

  // Verificação de role (assumindo campo 'role' no token ou Firestore)
  const tokenResult = await getIdTokenResult(user);
  if (tokenResult.claims.role !== 'admin' && window.location.pathname.includes('admin.html')) {
    window.location.href = 'registrar.html';
  }

  if (loader) loader.style.display = 'none';
});