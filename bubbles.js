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
/*
// Pushes clicked bubble to top, adds <a>, then adds other links
function processBubble(index) {
  let data = bubbles[index];
  let curBubble = document.querySelector(`#bubbles > .bubble:nth-child(${document.querySelector('#bubbles').childElementCount - index - 2})`);
  curBubble.innerHTML = `<a href="${data.double}">` + curBubble.innerHTML + "</a>";
  curBubble.style.zIndex = 99;
  curBubble.style.position = 'relative';
  curBubble.setAttribute('onclick', '');
  addDir('up', data.up === undefined ? 'plus' : data.up, curBubble, index);
  addDir('down', data.down === undefined ? 'plus' : data.down, curBubble, index);
  addDir('left', data.left === undefined ? 'plus' : data.left, curBubble, index);
  addDir('right', data.right === undefined ? 'plus' : data.right, curBubble, index);
}

// If no link is found, render plus, otherwise favicon
function addDir(dir, url, curBubble, index) {
  let ele = document.createElement('img');
  ele.setAttribute('id', dir)
  if (url === 'plus') {
    ele.setAttribute('src', './assets/plus.svg');
    ele.setAttribute('onclick', `setDir('${dir}', ${index})`);
  } else {
    ele.setAttribute('src', `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${url}&size=64`);
    ele.setAttribute('onmouseover', `location.href = '${url}'`)
  }
  curBubble.prepend(ele);
}

// Called on small bubble click
function setDir(dir, index, url) {
  // Same strat as creating bubbles
  if (url === undefined) {
    navigator.clipboard.readText().then((clipText) => {setDir(dir, index, clipText)});
  } else {
    if (url.substring(0, 4) !== 'http') {
      url = 'https://' + url;
    }
    write('bubbles', index + "", {[dir]: url, ...bubbles[index]});
    bubbles[index] = {[dir]: url, ...bubbles[index]};
    let curBubble = document.querySelector(`#bubbles > .bubble:nth-child(${document.querySelector('#bubbles').childElementCount - index - 2})`);
    document.querySelector(`#bubbles > .bubble:nth-child(${document.querySelector('#bubbles').childElementCount - index - 2}) > #${dir}`).remove();
    addDir(dir, url, curBubble, index);
  }
}
*/
// Hacky but oh well
window.createNew = createNew;

document.addEventListener('firebasedone', async () => {
  
  bubbles = await readAll('bubbles');
  console.log(bubbles);
  
  bubbles.forEach((e, i) => {
    renderBubble(i);
  })
  
}, false)