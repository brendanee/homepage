import { read, readAll, write } from "./firebase.js";
let bubbles = [];

function createNew(clip) {
  // If there's no clipboard text, get it, then recurse
  if (clip === undefined) {
    navigator.clipboard.readText().then((clipText) => {createNew(clipText)});
  } else {
    // Force string
    let curIndex = document.querySelector('#bubbles').childElementCount - 2 + "";
    // Prepend http
    if (clip.substring(0, 4) !== 'http') {
      clip = 'https://' + clip;
    }
    const title = document.getElementById('bubbles-input').value
    write('bubbles', curIndex, {link: clip, title: title});
    bubbles.push({link: clip, title: title});
    renderBubble(bubbles.length - 1);
  }
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