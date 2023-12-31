import { read, write } from "./firebase.js";
import { removeDupes } from "./main.js";

let todoListData = await read('todo', 'main');
let todoListImportant = todoListData.important;
todoListData = todoListData.data;

for (let i = 0; i < todoListData.length; i++) {
  addTodoElement(parseTodo(todoListData[i], ''), parseTodo(todoListData[i], 'tags'), todoListImportant[i]);
}

function addToTodo(event) {
  if (event.code === 'Enter') {
    let rawFromInput = document.getElementById('todo-input').value;
    addTodoElement(parseTodo(rawFromInput, ''), parseTodo(rawFromInput, 'tags'), document.getElementById('todo-important').checked);
    document.getElementById('todo-input').value = '';
    parseTags();
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
  element.innerHTML += `<span class="tags-wrapper">${plaintextTags}</span>`;
  element.innerHTML += `<input type="checkbox" ${isImportant ? 'checked' : ''}></span><img onclick="this.parentNode.remove();" src="./assets/trash.svg" alt="">`;
  document.getElementById("todo").prepend(element);
}

function updateTodo() {
  todoListData = [];
  document.querySelectorAll('ul li').forEach((element, index) => (todoListData.unshift(element.innerText)))
  todoListImportant = [];
  document.querySelectorAll('li input').forEach((element) => (todoListImportant.unshift(element.checked)))
  write('todo', 'main', {data: todoListData, important: todoListImportant});
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
  allTagsList.forEach((element) => (temp += `<span onclick="filterTodo(this, '${element}');" class="tag">#${element}</span>`))
  document.querySelector('.input-wrapper ~ .tags-wrapper').innerHTML = temp;
  return allTagsList;
}

// more 11 o lock code gl brendan :)
function filterTodo(me, hashtag) {
  if (document.getElementById('todoSelected') !== me) {
    me.setAttribute('id', 'todoSelected');
    document.querySelectorAll('ul li').forEach((element) => element.innerHTML.includes('#' + hashtag) ? element.style.display = "flex" : element.style.display = "none");
  } else {
    me.setAttribute('id', '');
    document.querySelectorAll('ul li').forEach((element) => element.style.display = "flex");
  }
}

parseTags();

window.addToTodo = addToTodo;
window.updateTodo = updateTodo;
window.filterTodo = filterTodo;