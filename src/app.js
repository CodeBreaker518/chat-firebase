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

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
console.log('@@auth =>', auth)
const db = getFirestore(app)

const mostrarElemento = (elemento) => {
  elemento.classList.remove('d-none')
}

const ocultarElemento = (elemento) => {
  elemento.classList.add('d-none')
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
  e.preventDefault() //es para prevenir que el submit haga un refresh en la pagna
  if (!auth.currentUser) return
  if (!formulario.msg.value.trim()) {
    formulario.msg.focus()
    formulario.msg.value = ''
    return
  }

  try {
    btnEnviar.disabled = true
    const mensaje = await addDoc(collection(db, 'chat'), {
      msg: formulario.msg.value.trim(),
      fecha: Date.now(),
      uid: auth.currentUser.uid,
      username: auth.currentUser.displayName,
    })
    console.log('@@@ Mensaje', mensaje)
    formulario.msg.value = ''
  } catch (error) {
    console.log(error)
  } finally {
    btnEnviar.disabled = false
  }
})

const pintarChat = ({ msg, uid, username, fecha }) => {
  const clone = templateChat.content.cloneNode(true)
  const div = clone.querySelector('div')
  if (div) {
    if (uid === auth.currentUser.uid) {
      div.classList.add('text-end')
      div.querySelector('span').classList.add('bg-success')
    } else {
      div.classList.add('text-start')
      div.querySelector('span').classList.add('bg-secondary')
    }
  }
  const span = clone.querySelector('span')
  if (span) {
    span.textContent = msg
  }
  const userName = clone.querySelector('p.username')
  if (userName) {
    if (username === auth.currentUser.displayName) {
    } else {
      userName.textContent = username
    }
  }
  const fechaElement = clone.querySelector('small.fecha')
  if (fechaElement) {
    const fechaDate = new Date(fecha)
    const fechaFormatted = fechaDate.toLocaleString()
    fechaElement.textContent = fechaFormatted
  }
  chat.append(clone)
}
