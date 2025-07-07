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
  tags = deDupe(tags);
  tags.forEach((e) => addListTag(e));
  filterList();
}

/**
 * 
 * @param {Array} list List of items to draw to the screen
 */
function drawList(list) {
  list.sort((a, b) => a.due - b.due);
  document.getElementById('list-content').innerHTML = '';
  list.forEach((e) => {
    const ele = document.createElement('li');
    // Due date minus now (nanoseconds) to ms to sec to min to hr
    const daysUntil = Math.floor((e.due - Date.now()) / 1000 / 60 / 60 / 24) + 1;
    switch (true) {
      case daysUntil < -1:
        ele.innerHTML = `<b>${daysUntil} days ago</b>`;
        break;
      case daysUntil === -1:
        ele.innerHTML = `<b>Yesterday</b>`;
        break;
      case daysUntil === 0:
        ele.innerHTML = `<b>Today</b>`;
        break;
      case daysUntil === 1:
        ele.innerHTML = `<b>Tmrw</b>`;
        break;
      case daysUntil > 7:
        ele.innerHTML = `<b>Month</b>`;
        break;
      default:
        ele.innerHTML = `<b>${daysUntil} days</b>`;
        break;
    }
    ele.innerHTML += ` ${e.value}`;
    e.tags.forEach((e) => ele.innerHTML += `<span class="tag">${e}</span>`);
    if (e.completed) {
      ele.innerHTML += '<span class="list-delete">🗑️</span>';
      ele.className = 'completed';
    } else {
      ele.innerHTML += '<span class="list-done">✅</span><span class="list-important">📌</span><span class="list-delete">🗑️</span>';
      if (daysUntil < 1) {
        ele.className = 'due';
      } else {
        ele.className = (e.important ? 'important' : '');
      }
    }
    document.getElementById('list-content').appendChild(ele);
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

function deDupe(array) {
  return Array.from(new Set(array));
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
  let newList = list;

  if (checkedList[0]) {
    // Filter to not due today
    newList = newList.filter((e) => (Math.floor((e.due - Date.now()) / 1000 / 60 / 60 / 24) + 1 >= 1));
  }
  if (checkedList[1]) {
    // Filter to not important
    newList = newList.filter((e) => !e.important);
  }
  if (checkedList[2]) {
    // Filter to those who are not important or due today
    newList = newList.filter((e) => (Math.floor((e.due - Date.now()) / 1000 / 60 / 60 / 24) + 1 < 1) || e.important);
  }
  if (checkedList[3]) {
    newList = newList.filter((e) => !e.completed);
  }
  for (let i = 4; i < checkedList.length; i++) {
    if (!checkedList[i]) {
      const tagName = document.querySelector(`#list-tags-wrapper > label:nth-child(${i + 1})`).innerText.substring(1);
      newList = newList.filter((e) => (e.tags.includes(tagName)));
    }
  }
  drawList(newList);
}