import firebase from "https://www.gstatic.com/firebasejs/7.20.0/firebase-app.js";
import "https://www.gstatic.com/firebasejs/7.20.0/firebase-auth.js";
import "https://www.gstatic.com/firebasejs/7.20.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCIo7CBX5jzAGlDFBu0mMb6BFfUsecaf7I",
    authDomain: "discovery-pets.firebaseapp.com",
    projectId: "discovery-pets",
    storageBucket: "discovery-pets.appspot.com",
    messagingSenderId: "481355972999",
    appId: "1:481355972999:web:5f5fa07f75b3fc9f4c5322"
};

firebase.initializeApp(firebaseConfig);

export const auth = firebase.auth();
export const db = firebase.firestore();
export default firebase;





































