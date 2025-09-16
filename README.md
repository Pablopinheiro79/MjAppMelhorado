🩺 MJ App – Registro de Plantões Médicos

Sistema simples e responsivo para que médicos registrem seus plantões em hospitais, com visualização consolidada mensal pelo administrador.

📱 Funcionalidades

Para Médicos:
- Cadastro com CPF e senha
- Registro de plantões com:
  - Data
  - Hora de início e fim (formato 24h, em blocos de 30 min)
  - Seleção de hospital (Pedro I, Edglay, Unimed, ISEA)
- Visualização dos próprios plantões cadastrados
- Exportação para CSV

Para Administrador:
- Visualização de todos os plantões registrados
- Filtros por mês/ano, médico e hospital
- Cálculo de horas totais por médico
- Exportação consolidada em CSV


🛠️ Tecnologias utilizadas

- HTML5 / CSS3 (com Bootstrap 5)
- JavaScript ES6 (modularizado)
- Firebase (Auth + Firestore)
- Firebase Hosting (opcional)
- Cleave.js (para máscara de CPF)

Autenticação

- **Login via CPF:** Convertido para email (`cpf@mjapp.com`)
- **Autenticação Firebase**
- **Proteção de rotas:** médicos só acessam os próprios dados, admin vê tudo

🗂️ Estrutura de Pastas

📁 MJ App
┣ 📄 index.html # Tela de login
┣ 📄 cadastro.html # Cadastro de novo médico
┣ 📄 registrar.html # Registro de plantões
┣ 📄 meus-plantoes.html # Tela "Meus Plantões"
┣ 📄 admin.html # Painel do administrador
┣ 📄 style.css # Estilo global
┣ 📄 firebase.js # Configuração Firebase
┣ 📄 auth.js # Login
┣ 📄 cadastro.js # Cadastro Firebase Auth
┣ 📄 registrar.js # Gravação de plantões no Firestore
┣ 📄 main.js # Tela do admin (listagem + filtros)
┣ 📄 meusPlantoes.js # Tela individual do médico
┗ 📄 authGuard.js # Proteção de rotas
Você pode usar Firebase Hosting ou empacotar com Cordova/Capacitor para transformar em app Android/iOS.

📍 Autor

Desenvolvido por Pablo, com base na necessidade de gestão mensal de plantões médicos.

📍 Localização: Rio de Janeiro – RJ


📌 Observações

O sistema é compatível com dispositivos móveis

Pode ser expandido para incluir:

Notificações por push

Upload de comprovantes

Validação por administrador
