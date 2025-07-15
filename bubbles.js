import { read, readAll, write } from "./firebase.js";
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
    write('bubbles', curIndex, {link: clipboardText, title: title});
    bubbles.push({link: clipboardText, title: title});
    renderBubble(bubbles.length - 1);
  });
}

// Prepends bubbles
function renderBubble(index) {
  const bubble = bubbles[index];
  const ele = document.createElement('a');
  ele.setAttribute('class', 'bubble');
  ele.setAttribute('href', bubble.link);
  ele.innerHTML = `<img src="https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${bubble.link}&size=64"><p>${bubble.title}</p>`;
  document.getElementById('bubbles').prepend(ele);
}

document.addEventListener('firebasedone', async () => {
  document.querySelector('div.bubble').addEventListener('click', createNew, false);
  bubbles = await readAll('bubbles');
  bubbles.forEach((e, i) => renderBubble(i))
}, false)