let ninjaAPIKey = '';
let firebaseConfig = [];

function unpackAPIKey(rawString) {
    localStorage.setItem('allAPI', rawString)
    let rawAPIArray = rawString.split(';');
    ninjaAPIKey = rawAPIArray.pop();
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
      firebaseConfigObject[Object.keys(firebaseConfigObject)[i]] = rawAPIArray[i];
    }
    firebaseConfig = firebaseConfigObject;
    document.getElementById('apiKeyMessage').remove();
}


document.getElementById('apiKeyInput').addEventListener('keyup', (e) => e.code === ('Enter') ? unpackAPIKey(document.getElementById('apiKeyInput').value) : null, false)

if (localStorage.getItem('allAPI') !== null) {
  unpackAPIKey(localStorage.getItem('allAPI'));
}

document

// Export twp variables (directly read from localStorage)
export { ninjaAPIKey, firebaseConfig }