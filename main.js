// apiKey from localStorage
import { apiNinjaKey } from "./apikeys.js";
import { read, write } from "./firebase.js";

await fetch("https://api.api-ninjas.com/v1/quotes?catagory=love", { headers: { "X-Api-Key": apiNinjaKey } })
  .then((response) => response.json())
  .then((data) => document.querySelector('body > blockquote').innerHTML = `${data[0].quote}&nbsp&nbsp&nbsp—&nbsp<i>${data[0].author}</i>`)
  .catch((error) => console.error(`404: Cannot fetch quote due to ${error}`))

let search = [];
await fetch("https://raw.githubusercontent.com/brendanee/Taskbar/main/result.json")
  .then((response) => response.json())
  .then((data) => search = data)
  .catch((error) => console.error(`404: Cannot fetch search data due to ${error}`));

// Function called when something's typed in the search box. Called each key stroke
// Needs global scope because code compares it against previous version before overwriting
let matches = [];
function refreshSearch() {
  // Make typed the current text input value
  let typed = document.getElementById("search").value;
  // If nothing is typed (i.e. user backspaced everything they typed)
  if (typed == "") {
    // Hide pop-up with search results (since there are none)
    document.getElementById("search-results").style.display = "none";
    // End function (no need to check for search term matches as there are none)
    return;
  }
  // If the last character typed is a number (special case to open link)
  // This deals with already typed text
  if (!isNaN(typed.slice(typed.length - 1))) {
    // Set matchIndex to the this number
    let matchIndex = typed.slice(typed.length - 1);
    // No clue || the number is more than the length of the results
    if (typed.slice(typed.length - 1) == 0 || typed.slice(typed.length - 1) > matches.length) {
      // Set the index to the last result
      matchIndex = matches.length;
    }
    // Open the corresponding result link
    window.open("https://" + search[matches[matchIndex - 1]].link, "_blank");
    // Hide pop-up with search results
    document.getElementById("search-results").style.display = "none";
    // Clear the input
    document.getElementById("search").value = "";
    // End (search has been completed)
    return;
  }
  // Reset matches array
  matches = [];
  let currentKeywords = [];
  // Iterate for each object in the search array
  for (let i = 0; i < search.length; i++) {
    // Make an array of the search terms for the current (iterated) object using the space seperated array of keywords
    currentKeywords = search[i].keywords.split(" ");
    // Add the name to the list in lower case
    currentKeywords.push(search[i].name.toLowerCase());
    // Check if the current input matches any of these
    let j = 0;
    while (j < currentKeywords.length) {
      if (currentKeywords[j].includes(typed)) {
        // If the current keyword includes what is currently typed, add the object number to the results
        matches.push(i);
      }
      j++;
    }
  }
  // Remove duplicates (happens when result is matched twice)
  matches = removeDupes(matches);
  document.getElementById("search-results").innerHTML = "";
  for (let i = 0; i < matches.length; i++) {
    addResult(matches[i]);
  }
  // Show pop-up with results
  document.getElementById("search-results").style.display = "block";
}

function removeDupes(array) {
  return Array.from(new Set(array));
}

// Add a result to #results, the results unordered list (called iteratively)
function addResult(index) {
  let element = document.createElement("li");
  element.innerHTML = `<a href="https://${search[index].link}" target="_blank">${search[index].name}</a><span> #${search[index].tags.replaceAll(" ", " #")}</span>`;
  document.getElementById("search-results").appendChild(element);
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
      newClass = "homework";
      break;
    case 'homework':
      newClass = "study";
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

let todoListData = await read('todo', 'main');
let todoListPrivate = todoListData.private;
todoListData = todoListData.data;

for (let i = 0; i < todoListData.length; i++) {
  addTodoElement(parseTodo(todoListData[i], ''), parseTodo(todoListData[i], 'tags'), todoListPrivate[i]);
}

function addToTodo(event) {
  if (event.code === 'Enter') {
    let rawFromInput = document.getElementById('todo-input').value;
    addTodoElement(parseTodo(rawFromInput, ''), parseTodo(rawFromInput, 'tags'), document.getElementById('todo-important').checked);
    document.getElementById('todo-input').value = '';
  }
}

/*
content: Text stored in data as string in array
tags: JSON.stringify of array in array
isImportant: boolean
*/
function addTodoElement(content, tags, isImportant) {
  let element = document.createElement("li");
  element.spellcheck = false;
  element.contentEditable = true;
  element.innerHTML = content;
  let plaintextTags = '';
  tags.forEach((element) => (plaintextTags += `<span class="tag">#${element}</span>`))
  console.log(plaintextTags);
  element.innerHTML += `<span class="tags-wrapper">${plaintextTags}</span>`;
  element.innerHTML += `<input type="checkbox" ${isImportant ? 'checked' : ''}></span><img onclick="this.parentNode.remove();" src="./assets/trash.svg" alt="">`;
  document.getElementById("todo").prepend(element);
}

function updateTodo() {
  todoListData = [];
  document.querySelectorAll('ul li').forEach((element, index) => (todoListData.unshift(element.innerText)))
  todoListPrivate = [];
  document.querySelectorAll('li input').forEach((element) => (todoListPrivate.unshift(element.checked)))
  write('todo', 'main', {data: todoListData, private: todoListPrivate});
}

function parseTodo(item, toReturn) {
  let wordArray = item.split('#');
  if (toReturn === "tags") {
    return wordArray.slice(1);
  } else {
    return wordArray[0];
  }
}
// brendan good luck figuring this out (written at 11 at noght)
function parseTags() {
  let allTagsList = [];
  document.querySelectorAll('ul li').forEach((element) => allTagsList = allTagsList.concat(parseTodo(element.innerText, 'tags')));
  allTagsList = removeDupes(allTagsList);
  let temp = '';
  allTagsList.forEach((element) => (temp += `<span class="tag">#${element}</span>`))
  document.querySelector('.input-wrapper ~ .tags-wrapper').innerHTML = temp;
  return allTagsList;
}

console.log(parseTags());

// Makes function global to window, needed bc modules aren't. Not the best practice, but needed as they're referenced from HTMl. Avoidable using eventListener
window.cycleClasses = cycleClasses;
window.resetClasses = resetClasses;
window.refreshSearch = refreshSearch;
window.updateClasses = updateClasses;
window.addToTodo = addToTodo;
window.updateTodo = updateTodo;