// Object containing config details, from localStorage
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
import { firebaseConfig } from "./apikeys.js";

// Import the functions you need from the SDKs you need
// The Firebase app itself, needed for literally everything to work
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
// Firestore, the product that we're using to store data, plus some functions we need from it
import { getFirestore, doc, getDoc, setDoc} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// Initialize Firebase config-ralted things
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function is async because we need await for fetch request
async function read(collection, document) {
    const docRef = doc(db, collection, document);
    const docSnap = await getDoc(docRef);
    // If the doc we're looking for exists...
    if (docSnap.exists()) {
      // Return it out of the function
      return docSnap.data();
    } else {
      // docSnap.data() will be undefined in this case
      console.error(`404: Firestore document '${document}' in collection '${collection}' not found.`);
      return;
    }
}

// One more property than read because we need to define what to write and what field
async function write(collection, document, data) {
  const docRef = doc(db, collection, document);
  // Very jank, implements security holes
  await setDoc(docRef, data);
}

// JS modules: Exporting read and write to main.js
export { read, write };