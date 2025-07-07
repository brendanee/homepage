// apiKey from localStorage
import { read, write } from "./firebase.js";

function makeToast(message) {
  const toast = document.getElementById('toast');
  toast.innerHTML = `${message}<button onclick="document.getElementById('toast').style.display = 'none'">Ok</button>`;
  setTimeout(document.getElementById('toast').style.display = 'none', 5000);
  toast.style.display = 'block';
}

function removeDupes(array) {
  return Array.from(new Set(array));
}

function parseTags(listID) {
  let allTagsList = [];
  
  document.querySelectorAll(listID + ' li').forEach((element) => allTagsList = allTagsList.concat(element.querySelector('.tags-wrapper').innerText.replaceAll('#', ' ').split(' ')));
  allTagsList = removeDupes(allTagsList);
  allTagsList.splice(allTagsList.indexOf(''), 1);    
  let temp = '';
  allTagsList.forEach((element) => (temp += `<span onclick="filterList(this, '${element}', '${listID}');" class="tag">#${element}</span>`))
  document.querySelector(`*:has(+ ${listID})`).innerHTML = temp;
  
}

// more 11 o lock code gl brendan :)
function filterList(me, hashtag, listID) {
  if (!Array.from(document.getElementsByClassName('selected')).includes(me)) {
    me.classList.add('selected');
    document.querySelectorAll(listID + ' li').forEach((element) => element.innerHTML.includes('#' + hashtag) ? element.style.display = "flex" : element.style.display = "none");
  } else {
    me.classList.remove('selected');
    document.querySelectorAll(listID + ' li').forEach((element) => element.style.display = "");
  }
}

window.filterList = filterList;

export { removeDupes, parseTags }