import { read, readAll, write } from "./firebase.js";

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
    write('bubbles', curIndex, {double: clip});
    bubbles.push({'double': clip});
    renderBubble(bubbles.length - 1);
  }
}

let bubbles = await readAll('bubbles');
bubbles.forEach((e, i) => {
  renderBubble(i);
})
function renderBubble(index) {
  let ele = document.createElement('div');
  ele.setAttribute('class', 'bubble');
  ele.setAttribute('onclick', `processBubble(${index})`);
  ele.innerHTML = `<img src="https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${bubbles[index].double}&size=64">`;
  document.getElementById('bubbles').prepend(ele);
}



// Hacky but oh well
window.createNew = createNew;