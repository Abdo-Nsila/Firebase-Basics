import { initializeApp } from "firebase/app";
import { getFirestore, collection,getDocs, onSnapshot,
        addDoc, deleteDoc, doc,
        query, where, orderBy, serverTimestamp,
        getDoc, updateDoc } from "firebase/firestore";
import { 
    getAuth, createUserWithEmailAndPassword,
    signOut, signInWithEmailAndPassword,
    onAuthStateChanged
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyD-HPUJt_qWug8C5hTiSNltC6jB9O_HIkE",
  authDomain: "discord-83553.firebaseapp.com",
  projectId: "discord-83553",
  storageBucket: "discord-83553.appspot.com",
  messagingSenderId: "567435687042",
  appId: "1:567435687042:web:b498591362b41de587709b",
};



// init firebase app
initializeApp(firebaseConfig);

// init services
const db = getFirestore();
const auth = getAuth();

// collection ref
const colRef = collection(db, "users");

// queries
// const q = query(colRef, where("username", "==", "KAMADO"))
const q = query(colRef, orderBy('createdAt','asc'))


// real time collection data
onSnapshot(q, (snapshot) => {

    const select = document.querySelector('#ids');
    let options = '';
    let users = [];

    snapshot.docs.forEach((doc)=>{
      users.push({...doc.data(), id: doc.id})
      options += `<option value="${doc.id}">${doc.id}</option>`
    })
    console.log(users)
    select.innerHTML = options
})

// Adding document
const addUserForm = document.querySelector('.add')
addUserForm.addEventListener('submit', (e) => {
    e.preventDefault()

    addDoc(colRef, {
        username: addUserForm.username.value,
        email: addUserForm.email.value,
        password: addUserForm.password.value,
        createdAt: serverTimestamp(),
    }).then(()=>{
        addUserForm.reset()
    })
})

// Deleting document
const deleteUserForm = document.querySelector('.delete')
deleteUserForm.addEventListener('submit', (e) => {
    e.preventDefault()

    const docRef = doc(db, 'users',deleteUserForm.id.value)
    
    deleteDoc(docRef).then(()=>{
        deleteUserForm.reset()
    })
})


// get single document
const docRef = doc(db, 'users','3jotshdLTdnw9yvTiDNs')

onSnapshot(docRef, (doc)=>{
    console.log({...doc.data(), id: doc.id})
})


// Updating document
const updateUserForm = document.querySelector('.update')
updateUserForm.addEventListener('submit', (e) => {
    e.preventDefault()

    const docRef = doc(db, 'users',updateUserForm.id.value)

    updateDoc(docRef, {
        username: updateUserForm.username.value,
        email: updateUserForm.email.value,
        password: updateUserForm.password.value,
    }).then(()=>{
        updateUserForm.reset()
    })
})


// sign up document
const signupForm = document.querySelector('.signup')
signupForm.addEventListener('submit', (e) => {
    e.preventDefault()

    const email = signupForm.email.value
    const password = signupForm.password.value

    createUserWithEmailAndPassword(auth, email, password)
    .then((cred)=>{
        console.log('user created: ',cred.user)
        signupForm.reset()
    })
    .catch((err)=>{
        console.log(err.message)
    })
})


// Log out
const logoutButton = document.querySelector('.logout')
logoutButton.addEventListener('click', (e) => {
    signOut(auth)
    .then(()=>{
        console.log('The user signed out')
    })
    .catch((err)=>{
        console.log(err.message)
    })
})


// Login
const loginForm = document.querySelector('.login')
loginForm.addEventListener('submit', (e) => {
    e.preventDefault()

    const hello = document.querySelector('#hello')
    const emaill = loginForm.email.value
    const password = loginForm.password.value

    signInWithEmailAndPassword(auth, emaill, password)
    .then((cred)=>{
        const name = cred.user.email.split("@")[0]
        console.log('user logged in', name)
        hello.innerText += ' '+name
    })
    .catch((err)=>{
        console.log(err.message)
    })
})

// Subscibing status
onAuthStateChanged(auth, (user)=>{
    console.log('user status changed: ', user)
})


// Unsubscibing status


