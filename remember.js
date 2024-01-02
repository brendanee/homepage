import { read, write } from "./firebase.js";

let remember = await read('remember', 'main');
remember = remember.main;
let rememberDiv = document.getElementById('remember');

rememberDiv.innerHTML = remember;

let cursorPos = 0;
// Had to be keypress, keyup and keydown don't work for preventDefault()
rememberDiv.addEventListener('keypress', (e) => {
  if (e.code === 'Enter') {
    e.preventDefault();
    if (window.getSelection().anchorOffset === 0) {
      window.getSelection().setPosition(rememberDiv.firstChild, cursorPos);
    } else {
      cursorPos = window.getSelection().anchorOffset;
    }
    console.log(window.getSelection().anchorOffset);
    console.log(cursorPos);
    rememberDiv.innerHTML = rememberDiv.innerHTML.substring(0, cursorPos) + '&#13;&#10;' + rememberDiv.innerHTML.substring(cursorPos);
  }
}, false)

function updateRemember() {
  write('remember', 'main', {main: rememberDiv.innerHTML});
}

window.updateRemember = updateRemember;