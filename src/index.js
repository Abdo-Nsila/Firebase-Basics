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
  get,
  getDoc,
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
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signOut,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  deleteUser,
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

// Create a root reference
const storage = getStorage();

//* real time collection data
// onSnapshot(colRef, (snapshot) => {

//     const select = document.querySelector('#ids');
//     let users = [];

//     snapshot.docs.forEach((doc)=>{
//       users.push({...doc.data(), id: doc.id})
//     })
//     console.log(users)
// })

const userData = () => {
  return JSON.parse(localStorage.getItem("userData"));
};

//! Adding document post
const postForm = document.querySelector(".post");
postForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const customId = crypto.randomUUID();
  uploadPostInfo(postForm.img_url.files[0], customId);
  // ADD post ID into array user
  await updateDoc(doc(db, "users", `${userData().username}`), {
    post_ids: arrayUnion(customId),
  });
});
//! Add image in storage
// const imgForm = document.querySelector('.uplImg')
const uploadPostInfo = (img, customId) => {
  const imgName = img.name;
  const imgType = img.type;
  const metaData = { contentType: imgType };
  const storage = getStorage();
  const storageRef = ref(storage, `Post_Images/${imgName}`);
  const uploadTask = uploadBytesResumable(storageRef, img, metaData);
  uploadTask.on(
    "state_changed",
    (snapshot) => {
      var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      console.log(`Upload: ${progress}%`);
    },
    (error) => {
      alert("Error: image not upload");
    },
    () => {
      getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
        setDoc(doc(db, "posts", customId), {
          sender: userData().username,
          title: postForm.title.value,
          likes: 0,
          createdAt: serverTimestamp(),
          img: {
            path: `Post_Images/${imgName}`,
            url: downloadURL,
            name: imgName,
            type: imgType,
          },
        }).then(() => {
          postForm.reset();
        });
      });
    }
  );
};

//! Delete document post
const delete_postForm = document.querySelector(".delete_post");
delete_postForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  await deleteDoc(doc(db, "posts", "id1"));
  // Delete post ID into array user
  await updateDoc(doc(db, "users", `${userData().username}`), {
    post_ids: arrayRemove("id1"),
  });
  alert("Post Deleted");
});

//! Adding document user
const signupForm = document.querySelector(".signup");
const addUser = () => {
  const img = signupForm.avatar.files[0];
  const imgName = img.name;
  const imgType = img.type;
  const metaData = { contentType: imgType };
  const storage = getStorage();
  const storageRef = ref(storage, `Avatars_Images/${imgName}`);
  const uploadTask = uploadBytesResumable(storageRef, img, metaData);
  uploadTask.on(
    "state_changed",
    (snapshot) => {
      var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      console.log(`Upload: ${progress}%`);
    },
    (error) => {
      alert("Error: image not upload");
    },
    () => {
      getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
        const userData = {
          username: signupForm.username.value,
          email: signupForm.email.value,
          password: signupForm.password.value,
          avatar: {
            path: `Avatars_Images/${imgName}`,
            url: downloadURL,
            name: imgName,
            type: imgType,
          },
          post_ids: {},
          type: "user",
          createdAt: serverTimestamp(),
        };
        await setDoc(
          doc(db, "users", `${signupForm.username.value}`),
          userData
        );
        localStorage.setItem("userData", JSON.stringify(userData));
        signupForm.reset();
        location.reload()
      });
    }
  );
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
      console.log("user created: ", cred.user);
      addUser();
    })
    .catch((err) => {
      console.log(err.message);
    });
});

//! Delete Account
const delete_userForm = document.querySelector(".deleteUser");
delete_userForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  //! Delete avatar firstly before nonAuth
  const desertRef = ref(storage, userData().avatar.path);
  // Delete the file
  await deleteObject(desertRef)
    .then(() => {
      console.log("File deleted successfully");
    })
    .catch((error) => {
      console.log(error);
    });

  const auth = getAuth();
  const user = auth.currentUser;
  // Current signed-in user to delete
  deleteUser(user)
    .then(async () => {
      console.log("Account deleted successfully");
      await deleteDoc(doc(db, "users", `${userData().username}`))
        .then(() => {
          localStorage.clear()
          console.log("User deleted successfully");
          location.reload()
        })
        .catch((error) => {
          console.log(error);
        });
    })
    .catch((error) => {
      // An error occurred
      // ...
    });
});

//! Get document user
const getUser = async (email) => {
  const q = query(collection(db, "users"), where("email", "==", email));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    localStorage.setItem("userData", JSON.stringify(doc.data()));
  });
};
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
      getUser(email);
      userData();
      console.log(user);
      location.reload()
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
      localStorage.clear();
      console.log("Sign-out successful.");
      location.reload()
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
