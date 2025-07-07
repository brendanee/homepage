import { read, readAll, write, del } from "./firebase.js";

let list = [];

async function init() {
  const today = new Date;
  const btnDayTimes = [
    0, // Today
    1, // Tmrw
    2, // Day after tmrw
    7 - today.getDay(), // This week
    7, // Seven days
    (new Date(today.getFullYear(), today.getMonth() - 1, 0)).getDate() - today.getDate() // End of the current month minus today (scuffed)
  ]
  document.querySelectorAll('#list-input-wrapper > button').forEach((e, i) => e.addEventListener('click', () => addListItem(btnDayTimes[i]), false));
  list = await readAll('list');
  console.log(list);
  drawList(list);
  document.querySelectorAll('#list-tags-wrapper > label').forEach((e) => e.addEventListener('click', filterList, false))
  let tags = [];
  list.map((e) => tags.push(...e.tags));
  tags.forEach((e) => addListTag(e));
}

/**
 * 
 * @param {Array} list List of items to draw to the screen
 */
function drawList(list) {
  document.getElementById('list-content').innerHTML = '';
  list.forEach((e) => {
    const ele = document.createElement('li');
    // Due date minus now (nanoseconds) to ms to sec to min to hr
    const daysUntil = Math.floor((e.due - Date.now()) / 1000 / 60 / 60 / 24) + 1;
    if (e.completed) {
      ele.innerHTML = `${e.value}<span class="list-delete">🗑️</span>`;
      ele.className = 'completed';
    } else {
      ele.innerHTML = `${e.value}<span class="list-done">✅</span><span class="list-important">📌</span><span class="list-delete">🗑️</span>`;
      if (daysUntil < 1) {
        ele.className = 'due';
      } else {
        ele.className = (e.important ? 'important' : '') + (e.completed ? 'completed' : '');
      }
      
    }
    
    document.getElementById('list-content').append(ele);
    document.querySelector('#list-content > li:last-of-type > .list-delete').addEventListener('click', () => deleteListItem(e.creation), false);
  });
}

document.addEventListener('firebasedone', init, false);

async function addListItem(dueDate) {
  const input = document.getElementById('list-input');
  if (!input.value) {return;}
  const today = Date.now();
  const hashtagSplit = input.value.split(' #')
  const value = hashtagSplit.shift();
  const item = {
    completed: false, //TODO
    creation: today,
    due: today + dueDate * 24 * 60 * 60 * 1000, // Hr to min to sec to mc
    important: false, //TODO
    tags: hashtagSplit,
    value: value,
  }
  write('list', "" + today, item);
  input.value = '';
  list.push(item);
  drawList(list);
}

async function deleteListItem(creation) {
  await del('list', "" + creation);
  debugger
  list = list.filter((e) => (e.creation !== creation));
  drawList(list);
}

function addListTag(tag) {
  const ele = document.createElement('label');
  ele.innerHTML = `<input type="checkbox" checked name="tags-${tag}">#${tag}`;
  ele.addEventListener('click', filterList, false);
  document.getElementById('list-tags-wrapper').append(ele);
}

function filterList() {
  let checkedList = Array.from(document.querySelectorAll('#list-tags-wrapper > label > input')).map((e) => e.checked);
  console.log(checkedList)
  /*
  if (document.querySelector(`#list-tags-wrapper > label > input[name=tags-${tag}]`).checked) {
    drawList(list);
  } else {
    drawList(list.filter((e) => (e.tags.includes(tag))));
  }
    */
}