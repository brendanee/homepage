import { readAll, write, del } from "./firebase.js";
let bubbles = [];

function createNew() {
  // Get clipboard text *then* run rest
  navigator.clipboard.readText().then((clipboardText) => {
    // Force string
    let curIndex = String(document.querySelector('#bubbles').childElementCount - 2);
    // Prepend http
    if (clipboardText.substring(0, 4) !== 'http') {
      clipboardText = 'https://' + clipboardText;
    }
    const title = document.getElementById('bubbles-input').value;
    write('bubbles', String(Date.now()), {link: clipboardText, title: title, id: Date.now()});
    bubbles.push({link: clipboardText, title: title, id: Date.now()});
    renderBubble(bubbles.length - 1);
  });
}

// Prepends bubbles
function renderBubble(index) {
  const bubble = bubbles[index];
  const ele = document.createElement('a');
  ele.setAttribute('class', 'bubble');
  ele.setAttribute('href', bubble.link);
  ele.innerHTML = `<img src="https://www.google.com/s2/favicons?sz=32&domain=${bubble.link}"><p>${bubble.title}</p>`;
  ele.addEventListener('contextmenu', (e) => {e.preventDefault(); del('bubbles', String(bubble.id)); e.currentTarget.remove()}, false);
  document.getElementById('bubbles').prepend(ele);
}

document.addEventListener('firebasedone', async () => {
  document.querySelector('div.bubble').addEventListener('click', createNew, false);
  bubbles = await readAll('bubbles');
  bubbles.forEach((e, i) => renderBubble(i))
  console.log(bubbles)
}, false)