// ⚠️ Reemplaza con los datos de tu proyecto Firebase
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TUPROYECTO.firebaseapp.com",
  projectId: "TUPROYECTO",
  storageBucket: "TUPROYECTO.appspot.com",
  messagingSenderId: "XXXXXX",
  appId: "1:XXXXXX:web:XXXXXX"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
