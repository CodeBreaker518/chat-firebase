import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js';

import {
  getAuth,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js';

const firebaseConfig = {
  apiKey: 'AIzaSyAgCvPIQ85bAgQBbhGyfIzy5zzdYe2zySM',
  authDomain: 'chat-firebase-codebreaker518.firebaseapp.com',
  projectId: 'chat-firebase-codebreaker518',
  storageBucket: 'chat-firebase-codebreaker518.appspot.com',
  messagingSenderId: '425082320536',
  appId: '1:425082320536:web:9d80cd630068af7ce802ed',
};

import {
  getFirestore, //obtiene la BD
  collection, // Enlaza a la coleccion en la DB
  addDoc, // agregar documento nuevo
  query, // realizar consultas (where)
  onSnapshot, // previamente guardado
  orderBy, // ordenacion de resultados
} from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js';

const acceder = document.querySelector('#acceder');
const salir = document.querySelector('#salir');
const formulario = document.querySelector('#formulario');
const templateChat = document.querySelector('#templateChat');
const chat = document.querySelector('#chat');
const btnEnviar = document.querySelector('#btnEnviar');
const mensajeLogOut = document.querySelector('#mensajeLogOut');

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
console.log('@@auth =>', auth);
const db = getFirestore(app);

const mostrarElemento = (elemento) => {
  elemento.classList.remove('d-none');
};

const ocultarElemento = (elemento) => {
  elemento.classList.add('d-none');
};

//variable para controlar un usuario suscrito
let unsubscribe;

onAuthStateChanged(auth, (user) => {
  if (user) {
    mostrarElemento(salir);
    mostrarElemento(chat);
    mostrarElemento(formulario);
    ocultarElemento(acceder);
    ocultarElemento(mensajeLogOut);

    // chat.innerHTML = '';
    const q = query(collection(db, 'chat'), orderBy('fecha'));
    unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          pintarChat(change.doc.data());
        }
        chat.scrollTop = chat.scrollHeight;
      });
    });
  } else {
    ocultarElemento(chat);
    ocultarElemento(formulario);
    mostrarElemento(acceder);
    mostrarElemento(mensajeLogOut);

    // Verificar si hay una suscripción activa antes de cancelarla
    if (unsubscribe) {
      unsubscribe();
    }
  }
});

acceder.addEventListener('click', () => {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider)
    .then((result) => {
      // El usuario ha iniciado sesión correctamente
      console.log('Usuario autenticado:', result.user);
    })
    .catch((error) => {
      // Ha ocurrido un error al autenticar al usuario
      console.error('Error al autenticar usuario:', error);
    });
});

salir.addEventListener('click', () => {
  signOut(auth)
    .then(() => {
      ocultarElemento(salir);
      console.log('Sesión cerrada');
    })
    .catch((error) => {
      console.error(error);
    });
});
