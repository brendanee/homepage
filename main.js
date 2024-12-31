// apiKey from localStorage
import { ninjaAPIKey } from "./apikeys.js";
import { read, write } from "./firebase.js";

function removeDupes(array) {
  return Array.from(new Set(array));
}

await fetch("https://api.api-ninjas.com/v1/quotes?catagory=love", { headers: { "X-Api-Key": ninjaAPIKey } })
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
// Init classesValues to all nones (in case Cloud Firestore fails to connect)
let classesValues = ["none", "none", "none", "none", "none", "none", "none", "none", "none", "none"]
classesValues = await read("classes", "main");
// This can't be done in the await, so we redefine
classesValues = classesValues.data;

// Set HTML elements to array value
for (let i = 0; i < classesValues.length; i++) {
  document.querySelector(`#classes div:nth-child(${i + 1})`).className = classesValues[i];
}

// Called on click of a classes button. Simply cycles through the possible classes, and updates array
function cycleClasses(index) {
  let newClass;
  // Plus one is required because CSS starts at one, and we're using querySelector
  switch (document.querySelector(`#classes div:nth-child(${index + 1})`).className) {
    case 'none':
      newClass = "mon";
      break;
    case 'mon':
      newClass = "tue";
      break;
    case 'study':
      newClass = "test";
      break;
    default:
      newClass = "none";
  }
  document.querySelector(`#classes div:nth-child(${index + 1})`).className = newClass;
  // Updating master array
  classesValues[index] = newClass;
}

// Called on right-click of the classes button. Resets classes button to none.
function resetClasses(index) {
  document.querySelector(`#classes div:nth-child(${index + 1})`).className = "none";
  classesValues[index] = "none";
}

// Called when blue cloud is clicked.
function updateClasses() {
  write('classes', 'main', {data: classesValues});
}


// Makes function global to window, needed bc modules aren't. Not the best practice, but needed as they're referenced from HTMl. Avoidable using eventListener
window.cycleClasses = cycleClasses;
window.resetClasses = resetClasses;
window.updateClasses = updateClasses;
window.filterList = filterList;
export { removeDupes, parseTags }