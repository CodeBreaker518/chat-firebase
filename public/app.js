import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js'

import {
  getAuth,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js'

const firebaseConfig = {
  apiKey: 'AIzaSyAgCvPIQ85bAgQBbhGyfIzy5zzdYe2zySM',
  authDomain: 'chat-firebase-codebreaker518.firebaseapp.com',
  projectId: 'chat-firebase-codebreaker518',
  storageBucket: 'chat-firebase-codebreaker518.appspot.com',
  messagingSenderId: '425082320536',
  appId: '1:425082320536:web:9d80cd630068af7ce802ed',
}

import {
  getFirestore, //obtiene la BD
  collection, // Enlaza a la coleccion en la DB
  addDoc, // agregar documento nuevo
  query, // realizar consultas (where)
  onSnapshot, // previamente guardado
  orderBy, // ordenacion de resultados
} from 'https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js'

const acceder = document.querySelector('#acceder')
const salir = document.querySelector('#salir')
const formulario = document.querySelector('#formulario')
const templateChat = document.querySelector('#templateChat')
const chat = document.querySelector('#chat')
const btnEnviar = document.querySelector('#btnEnviar')
const mensajeLogOut = document.querySelector('#mensajeLogOut')
const textInput = document.querySelector('#text-input > label')
const userInfo = document.querySelector('#user-info')

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
console.log('@@auth =>', auth)
const db = getFirestore(app)

const mostrarElemento = (elemento) => {
  elemento.classList.remove('hide')
}

const ocultarElemento = (elemento) => {
  elemento.classList.add('hide')
}

//variable para controlar un usuario suscrito
let unsubscribe = null

onAuthStateChanged(auth, (user) => {
  if (user) {
    mostrarElemento(salir)
    mostrarElemento(chat)
    mostrarElemento(formulario)
    ocultarElemento(acceder)
    ocultarElemento(mensajeLogOut)

    chat.innerHTML = ''
    const q = query(collection(db, 'chat'), orderBy('fecha'))
    unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          pintarChat(change.doc.data())
        }
        chat.scrollTop = chat.scrollHeight
      })
    })
  } else {
    ocultarElemento(chat)
    ocultarElemento(formulario)
    mostrarElemento(acceder)
    mostrarElemento(mensajeLogOut)

    if (unsubscribe) {
      unsubscribe()
    }
  }
})

acceder.addEventListener('click', () => {
  const provider = new GoogleAuthProvider()
  signInWithPopup(auth, provider)
    .then((result) => {
      // El usuario ha iniciado sesión correctamente
      console.log('Usuario autenticado:', result.user)
    })
    .catch((error) => {
      // Ha ocurrido un error al autenticar al usuario
      console.error('Error al autenticar usuario:', error)
    })
})

salir.addEventListener('click', () => {
  signOut(auth)
    .then(() => {
      ocultarElemento(salir)
      console.log('Sesión cerrada')
    })
    .catch((error) => {
      console.error(error)
    })
})

formulario.addEventListener('submit', async (e) => {
  e.preventDefault(); // Prevenir el refresh de la página por defecto
  if (!auth.currentUser) return;
  if (!formulario.msg.value.trim()) {
    formulario.msg.focus();
    formulario.msg.value = '';
    return;
  }

  try {
    btnEnviar.disabled = true;
    const mensaje = await addDoc(collection(db, 'chat'), {
      uid: auth.currentUser.uid,
      username: auth.currentUser.displayName,
      msg: formulario.msg.value.trim(),
      fecha: Date.now(),
    });
    console.log('@@@ Mensaje', mensaje);
    formulario.msg.value = '';
    formulario.msg.classList.remove('valid'); // Quitar la clase .valid
    M.updateTextFields(); // Actualizar campos de texto para quitar el enfoque
  } catch (error) {
    console.log(error);
  } finally {
    btnEnviar.disabled = false;
  }
});

const pintarChat = ({ msg, uid, username, fecha }) => {
  const clone = templateChat.content.cloneNode(true)
  const div = clone.querySelector('div')
  if (div) {
    if (uid === auth.currentUser.uid) {
      div.classList.add('msg-container-end')
      div.classList.add('msg-up-end')
      div.classList.add('msg-down-end')
      div.querySelector('span').classList.add('bg-success')
    } else {
      div.classList.add('msg-container-start')
      div.classList.add('msg-up-start')
      div.classList.add('msg-down-start')
      div.querySelector('span').classList.add('bg-secondary')
    }
  }
  // showing message
  const span = clone.querySelector('span')
  if (span) {
    span.textContent = msg
  }
  const userName = clone.querySelector('p.username')
  // showing username
  if (userName) {
    if (username === auth.currentUser.displayName) {
      userName.textContent = (`ME (${username})`)
    } else {
      userName.textContent = username
    }
  }

  //showing date & hour
  const fechaElement = clone.querySelector('p.fecha')
  if (fechaElement) {
    const fechaDate = new Date(fecha)
    const fechaFormatted = fechaDate.toLocaleString()
    fechaElement.textContent = fechaFormatted
  }
  
  
  // Agregar evento de clic al nombre de usuario
  userName.addEventListener('click', () => {
    const modalElement = document.querySelector('#modal');
    const modalUsernameElement = document.querySelector('#modalUsername');

    modalUsernameElement.innerHTML = username + '<br>' + msg;

    const modalInstance = M.Modal.init(modalElement);
    modalInstance.open();
  });
  chat.append(clone)
}
