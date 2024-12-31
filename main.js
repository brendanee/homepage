// apiKey from localStorage
import { ninjaAPIKey } from "./apikeys.js";
import { read, write } from "./firebase.js";

function removeDupes(array) {
  return Array.from(new Set(array));
}

await fetch("https://api.api-ninjas.com/v1/quotes", { headers: { "X-Api-Key": ninjaAPIKey } })
  .then((response) => response.json())
  .then((data) => document.querySelector('body > blockquote').innerHTML = `${data[0].quote}&nbsp&nbsp&nbsp—&nbsp<i>${data[0].author}</i>`)
  .catch((error) => console.error(`404: Cannot fetch quote due to ${error}`))

function parseTags(listID) {
  let allTagsList = [];
  
  document.querySelectorAll(listID + ' li').forEach((element) => allTagsList = allTagsList.concat(element.querySelector('.tags-wrapper').innerText.replaceAll('#', ' ').split(' ')));
  allTagsList = removeDupes(allTagsList);
console.log(allTagsList.indexOf(''));
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

// All class selector code
// Init classesValues to all -1 (in case Cloud Firestore fails to connect)
let classesValues = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1]
classesValues = await read("classes", "main");
// This can't be done in the await, so we redefine
classesValues = classesValues.data;

// Set HTML elements to array value
classesValues.forEach((e,i) => toScreen(i));

function toScreen(i) {
  document.querySelector(`#classes > div:nth-child(${i + 1}) > span`).innerHTML = twoLetter(classesValues[i]);
  write('classes', 'main', {data: classesValues});
}

function twoLetter(num) {
  switch (num) {
    case 0:
      return 'Sn';
    case 1:
      return 'Mn';
    case 2:
      return 'Tu';
    case 3:
      return 'We';
    case 4:
      return 'Th';
    case 5:
      return 'Fr';
    case 6:
      return 'Sa';
    case 7:
      return '/';
    default:
      return '/'
  }
}

function cycleClasses(index) {
  if (classesValues[index] === -1) {
    classesValues[index] = (new Date).getDay();
  } else {
    classesValues[index] = (classesValues[index] + 1) % 7;
  }
  toScreen(index);
}

// Called on right-click of the classes button. Resets classes button to none.
function resetClasses(index) {
  classesValues[index] = -1;
  toScreen(index);
}

// Makes function global to window, needed bc modules aren't. Not the best practice, but needed as they're referenced from HTMl. Avoidable using eventListener
window.cycleClasses = cycleClasses;
window.resetClasses = resetClasses;
window.filterList = filterList;

export { removeDupes, parseTags }