import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


const firebaseConfig = {
    apiKey: "AIzaSyCHxBM5kqxB-u__OD02Lo5vxc2KtY4Gyys",
    authDomain: "gamerlab-1a163.firebaseapp.com",
    projectId: "gamerlab-1a163",
    storageBucket: "gamerlab-1a163.firebasestorage.app",
    messagingSenderId: "276427434116",
    appId: "1:276427434116:web:e0345c1d4e88cc1472fad1"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);


export { app, auth, db };