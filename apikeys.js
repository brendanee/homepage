// localStorage is persistent, sessionStorage stays until all tabs are closed
if (localStorage.getItem('apiNinjaKey') === null) {
  // Set a localStorage item to user input, done before firebase.js runs
  let apiNinjaKey = window.prompt("Enter API key for API Ninja (click cancel to skip)");
  if (apiNinjaKey !== null) {
    localStorage.setItem('apiNinjaKey', apiNinjaKey);
  }
}

if (localStorage.getItem('firebaseConfig') === null) {
  // Make an empty firebaseConfigObject with empty strings 
  let firebaseConfigObject = {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
    measurementId: ''
  }
  // Loop that loops through all keys in object5
  for (let i = 0; i < Object.keys(firebaseConfigObject).length; i++) {
    // Prompt value for each key
    firebaseConfigObject[Object.keys(firebaseConfigObject)[i]] = window.prompt(`Enter value for ${Object.keys(firebaseConfigObject)[i]} in firebaseConfig`);
  }
  // Set localStorage item to JSON string of object (will unconvert later)
  localStorage.setItem('firebaseConfig', JSON.stringify(firebaseConfigObject));
}

// Set two variables to API key and Firebase config respectively
const apiNinjaKey = localStorage.getItem('apiNinjaKey');
// Note that firebaseConfig is un-JSON stringified
const firebaseConfig = JSON.parse(localStorage.getItem('firebaseConfig'));

// Export twp variables (directly read from localStorage)
export { apiNinjaKey, firebaseConfig }