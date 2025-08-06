import { read, readAll, write, del } from "./firebase.js";

let list = [];
let tags = [];
// hr * min * sec * ms
const dayInMs = 24 * 60 * 60 * 1000;
/**
 * Date object to nearest day, offset by current timezone
 */
const today = new Date(Date.now() - (Date.now() % (dayInMs)) + ((new Date).getTimezoneOffset() * 60 * 1000));
function deDupe(array) {return Array.from(new Set(array));}

async function init() {
  const btnDayTimes = [
    0, // Today
    1, // Tmrw
    2, // Day after tmrw
    7 - today.getDay(), // This week
    7, // Seven days
    (new Date(today.getFullYear(), today.getMonth() - 1, 0)).getDate() - today.getDate() // End of the current month minus today (scuffed)
  ]
  // These two lines attach eventListeners to already-there buttons (generated ones are attached on creation)
  document.querySelectorAll('#list-input-wrapper > button').forEach((e, i) => e.addEventListener('click', () => addListItem(btnDayTimes[i]), false));
  document.querySelectorAll('#list-tags-wrapper > label').forEach((e) => e.addEventListener('click', filterList, false))
  list = await readAll('list');
  list.forEach((e) => tags.push(...e.tags));
  tags = deDupe(tags);
  tags.forEach((e) => addListTag(e));
  filterList();
}

/**
 * DO NOT CALL ME CALL filterList()
 * @param {Array} list List of items to draw to the screen
 */
function drawList(list) {
  // Sort by due date, push important forward, push done back
  list.sort((a, b) => a.due - b.due);
  list.sort((a, b) => b.important - a.important);
  list.sort((a, b) => a.completed - b.completed);
  document.getElementById('list-content').innerHTML = '';
  list.forEach((e) => {
    const ele = document.createElement('li');
    // Due date minus now (nanoseconds) to ms to sec to min to hr
    const daysUntil = Math.floor((e.due - today) / 1000 / 60 / 60 / 24);
    switch (true) {
      // Completed don't show due date (it's negative gazillion for ordering)
      case e.completed === true:
        ele.innerHTML = ``;
        break;
      case daysUntil < -1:
        ele.innerHTML = `<b>${Math.abs(daysUntil)} days ago</b> `;
        break;
      case daysUntil === -1:
        ele.innerHTML = `<b>Yesterday</b> `;
        break;
      case daysUntil === 0:
        ele.innerHTML = `<b>Today</b> `;
        break;
      case daysUntil === 1:
        ele.innerHTML = `<b>Tmrw</b> `;
        break;
      case daysUntil > 7:
        ele.innerHTML = `<b>Month</b> `;
        break;
      default:
        ele.innerHTML = `<b>${daysUntil} days</b> `;
        break;
    }
    ele.innerHTML += e.value;
    e.tags.forEach((e) => ele.innerHTML += `<span class="tag">${e}</span>`);
    if (e.completed) {
      ele.innerHTML += '<span class="list-delete">🗑️</span>';
      ele.className = 'completed';
    } else {
      ele.innerHTML += '<span class="list-done">✅</span><span class="list-important">📌</span><span class="list-delete">🗑️</span>';
      if (daysUntil < 1) {
        ele.className = 'due' + (e.important ? ' important' : '');
      } else {
        ele.className = (e.important ? 'important' : '');
      }
    }
    document.getElementById('list-content').appendChild(ele);
    // Makes buttons work- ?. is if it doesn't exist (for completed elements)
    document.querySelector('#list-content > li:last-of-type > .list-delete').addEventListener('click', () => deleteListItem(e.creation), false);
    document.querySelector('#list-content > li:last-of-type > .list-done')?.addEventListener('click', (event) => completeListItem(e.creation, event), false);
    document.querySelector('#list-content > li:last-of-type > .list-important')?.addEventListener('click', () => importantListItem(e.creation), false);
  });
}

async function addListItem(dueDate) {
  const input = document.getElementById('list-input');
  if (!input.value) {return;}
  const hashtagSplit = input.value.split(' #')
  const value = hashtagSplit.shift();
  // Needed as using Date.now() in multiple places can be off by miliseconds - kinda cool!
  const rightNow = Date.now();
  const item = {
    completed: false,
    creation: rightNow,
    due: today.valueOf() + (dueDate * dayInMs), // Hr to min to sec to mc
    important: false,
    tags: hashtagSplit,
    value: value,
  }

  if (value.includes('http')) {
    item.value = `<a href="${value}">${value}</a>`
  }

  write('list', String(rightNow), item);
  list.push(item);
  // Add new tags to menu bar
  if (deDupe(tags.concat(...hashtagSplit)).length !== tags.length) {
    hashtagSplit.forEach((e) => addListTag(e));
    tags.push(...hashtagSplit);
    deDupe(tags);
  }

  input.value = '';
  filterList()
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
    newList = newList.filter((e) => (Math.floor((e.due - today) / 1000 / 60 / 60 / 24) + 1 >= 1));
  }
  if (checkedList[1]) {
    // Filter to not important
    newList = newList.filter((e) => !e.important);
  }
  if (checkedList[2]) {
    // Filter to those who are not important or due today
    newList = newList.filter((e) => (Math.floor((e.due - today) / 1000 / 60 / 60 / 24) + 1 < 1) || e.important);
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

async function deleteListItem(creation) {
  await del('list', String(creation));
  list = list.filter((e) => (e.creation !== creation));
  filterList();
}

async function completeListItem(creation, event) {
  // Completed items are sorted based on exact completion time reverse chron (hence due being negative)
  await write('list', String(creation), { completed: true, important: false, due: -1 * Date.now(), tags: []});
  list.find((e) => e.creation === creation).completed = true;
  filterList();
  createConfetti(event.clientX, event.clientY);
}

async function importantListItem(creation) {
  let listItem = list.find((e) => e.creation === creation);
  listItem.important = !listItem.important;
  await write('list', String(creation), { important: listItem.important });
  filterList();
}

function createConfetti(x, y) {
  for (let i = 0; i < 200; i++) {
    const ele = document.createElement('div');
    ele.className = 'confetti';
    ele.style = `
      --endX: ${x + rand(-200, 200)}px;
      --endY: ${y + rand(-200, 200)}px;
      --endRot: ${rand(-180, 180)}deg;
      top: ${y + rand(-20, 20)}px;
      left: ${x + rand(-20, 20)}px;
      background-color: hsl(${rand(0, 360)} ${rand(50, 100)} ${rand(30, 100)});
      width: ${rand(5,15)}px;
      height: ${rand(10,25)}px;
      transform: rotate(${rand(45, -45)}deg);`;
    document.querySelector('body').append(ele);
  }
  window.setTimeout(() => {
    document.querySelectorAll('.confetti').forEach((e) => e.remove());
  }, 1000);
}

document.addEventListener('firebasedone', init, false);

//from mdn
function rand(from, to) {
  return Math.floor(Math.random() * (to - from)) + from;
}

