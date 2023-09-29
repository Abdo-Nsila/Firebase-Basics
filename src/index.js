import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  orderBy,
  limit,
  getCountFromServer,
} from "firebase/firestore";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signOut,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";

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

//* real time collection data
// onSnapshot(colRef, (snapshot) => {

//     const select = document.querySelector('#ids');
//     let users = [];

//     snapshot.docs.forEach((doc)=>{
//       users.push({...doc.data(), id: doc.id})
//     })
//     console.log(users)
// })

//! Adding document post
const postForm = document.querySelector(".post");
postForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  const customId = crypto.randomUUID();
  await setDoc(doc(db, "posts", `${customId}`), {
    title: postForm.title.value,
    img_url: postForm.img_url.files[0].name,
    likes: "0",
    createdAt: serverTimestamp(),
  }).then(() => {
    postForm.reset();
  });
  // ADD post ID into array user 
  await updateDoc(doc(db, "users", "KAMADO"), {
    post_ids: arrayUnion(customId),
  });
});

//! Delete document post
const delete_postForm = document.querySelector(".delete_post");
delete_postForm.addEventListener('submit', async (e) => {
  e.preventDefault()

  await deleteDoc(doc(db, "posts", "id1"));
  await updateDoc(doc(db, "users", "KAMADO"), {
    post_ids: arrayRemove("id1"),
  });
  alert("Deleted")
});








//! Adding document user
const signupForm = document.querySelector(".signup");
const addUser = async () => {
  await setDoc(doc(db, "users", `${signupForm.username.value}`), {
    username: signupForm.username.value,
    email: signupForm.email.value,
    password: signupForm.password.value,
    createdAt: serverTimestamp(),
  }).then(() => {
    signupForm.reset();
  });
};

//! Sign up user
signupForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = signupForm.email.value;
  const password = signupForm.password.value;

  //* Create User Sign up
  createUserWithEmailAndPassword(auth, email, password)
    .then((cred) => {
      //* Add user
      addUser();
      console.log("user created: ", cred.user);
      signupForm.reset();
    })
    .catch((err) => {
      console.log(err.message);
    });
});

//! Sign-in == login user
const loginForm = document.querySelector(".login");

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = loginForm.email.value;
  const password = loginForm.password.value;
  //*   Sign-in
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log(user);
      alert("Login success");
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(errorCode, errorMessage);
    });
});

//! Logout user
const logoutForm = document.querySelector(".logout");
logoutForm.addEventListener("submit", (e) => {
  e.preventDefault();
  signOut(auth)
    .then(() => {
      console.log("Sign-out successful.");
    })
    .catch((error) => {
      console.log(error);
    });
});

const q1 = query(colRef, where("username", "in", ["KAMADO", "Abdellah"]));
const q2 = query(colRef, orderBy("username", "asc"), limit(3));
const q3 = query(colRef);
const querySnapshot = async (q) => {
  const d = await getCountFromServer(q);
  console.log(d.data().count);
  // const d = await getDocs(q)
  // d.forEach((doc) => {
  //   console.log(doc.id, " => ", doc.data());
  // });
};

// querySnapshot(q1);
// querySnapshot(q2)
// querySnapshot(q3)

const getData = async (path) => {
  const querySnapshot = await getDocs(collection(db, path));
  let d = [];
  querySnapshot.forEach((doc) => {
    // console.log(doc.id, "->", doc.data());
    d.push(doc.data());
  });
  return d;
};

const go = () =>
  onSnapshot(colRef, async (snapshot) => {
    const listCol = document.querySelector("#listCol");
    // listCol.innerHTML += `<ol>
    //   <li>${await getData("oses")}</li>
    //   <li>${await getData("oses/windows/children")}</li>
    //   <li>${await getData("oses/windows/children")}</li>
    // </ol>`
    const ids = await getData("users");
    console.log(ids);
    // listCol.innerHTML = `<ol>
    //   ${ids}
    // </ol>`
  });
// go()
