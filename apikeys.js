// Note to self: localStoage is persistent, sessionStorage is until all tabs are closed
// If there is no API key in the computer localStorage
if (localStorage.getItem('apiNinjaKey') === null) {
  // Set a localStorage item to user input (does not set any const variables)
  localStorage.setItem('apiNinjaKey', window.prompt("Enter API key for API Ninja"));
}

// If there is no firebaseConfig in computer localStorage
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