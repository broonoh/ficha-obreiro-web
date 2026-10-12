// js/firebase-init.js
// Inicializa o Firebase usando o SDK "compat" (via <script> direto, sem
// precisar de bundler/npm — mais simples pra um site estático no GitHub
// Pages). Carregado depois de firebase-config.js e dos <script> do CDN
// do Firebase (ver index.html / ficha.html).

firebase.initializeApp(FIREBASE_CONFIG);

const db = firebase.firestore();
