// Import various functions from Google's Firebase. You're supposed to do this via npm, but...
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, collection, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCNzLIk62KYdSsHOcOHj0NMBDtMEwipO1A",
  authDomain: "total-casing-389917.firebaseapp.com",
  projectId: "total-casing-389917",
  storageBucket: "total-casing-389917.firebasestorage.app",
  messagingSenderId: "323564904571",
  appId: "1:323564904571:web:b88c2197a6a8d54d4082de",
  measurementId: "G-G42N5TP70D"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();

// Bit like an event listener
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.querySelector('#sign-in-wrapper > span').innerHTML = user.displayName;
    document.getElementById('sign-out').style.display = 'inline-block';
    document.querySelector('form').style.display = 'none';
    // Custom- so fancy! Listened for in every other module currently in use.
    document.dispatchEvent(new Event('firebasedone'));
  }
})

function signIn() {
  const email = document.getElementById('email-input').value;
  const password = document.getElementById('password-input').value;
  signInWithEmailAndPassword(auth, email, password)
  .catch((error) => alert(`${error.code}: ${error.message}`));
}

// Function is async because we need await for fetch request
async function read(collection, document) {
    const docRef = doc(db, collection, document);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      // docSnap.data() will be undefined in this case
      console.error(`404: Firestore document '${document}' in collection '${collection}' not found.`);
      return;
    }
}

async function readAll(col) {
  let querySnapshot = await getDocs(collection(db, col))
  let build = [];
  querySnapshot.forEach((doc) => {
    build.push(doc.data());
  })
  return build;
}

async function write(collection, document, data) {
  const docRef = doc(db, collection, document);
  await setDoc(docRef, data, { merge: true });
}

/**
 * Delete specified document
 * @param {String} collection Collection of doc to be deleted (list, bubbles, etc.)
 * @param {String} documentID Document to delete (for list, timestamp)
 */
async function del(collection, documentID) {
  await deleteDoc(doc(db, collection, documentID));
}

document.getElementById('sign-in').addEventListener('click', signIn, false);
document.getElementById('sign-out').addEventListener('click', () => {
  signOut(auth).catch((error) => console.error(error));
  location.reload();
}, false);

export { read, readAll, write, del };