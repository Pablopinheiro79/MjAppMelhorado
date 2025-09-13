// firebase.js - Atualizado com versão mais recente e comentários de segurança
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';

const firebaseConfig = {
  // Mantido igual - IMPORTANTE: Configure regras de segurança no Firebase Console para proteger dados
  apiKey: 'AIzaSyBJ2GYVsezyyrtMAbufHd8mg4ufsAK2mjw',
  authDomain: 'mj-app-fd7ac.firebaseapp.com',
  projectId: 'mj-app-fd7ac',
  storageBucket: 'mj-app-fd7ac.appspot.com',
  messagingSenderId: '492329302445',
  appId: '1:492329302445:web:afc2fd5a3f8e03d0bd8924'
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// NOTA DE SEGURANÇA: Vá para Firebase Console > Firestore > Regras e adicione:
// rules_version = '2';
// service cloud.firestore {
//   match /databases/{database}/documents {
//     match /{document=**} {
//       allow read, write: if request.auth != null;
//     }
//   }
// }
// Isso garante que apenas usuários autenticados acessem dados.