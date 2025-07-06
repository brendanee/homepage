import { read, readAll, write, del } from "./firebase.js";


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
  let list = await readAll('list');
  console.log(list);
  drawList(list);
}

/**
 * 
 * @param {Array} list List of items to draw to the screen
 */
function drawList(list) {
  list.forEach((e) => {
    const ele = document.createElement('li');
    // Due date minus now (nanoseconds) to ms to sec to min to hr
    const daysUntil = Math.floor((e.due - Date.now()) / 1000 / 60 / 60 / 24);
    if (e.completed) {
      ele.innerHTML = `${e.value}<span class="list-delete">🗑️</span>`;
      ele.className = 'list-completed';
    } else {
      ele.innerHTML = `${e.value}<span class="list-done">✅</span><span class="list-important">📌</span><span class="list-delete">🗑️</span>`;
      if (daysUntil < 1) {
        ele.className = 'due';
      } else {
        ele.className = e.important ? 'important' : '' + e.completed ? 'important' : '';
      }
      
    }
    
    document.getElementById('list-content').append(ele);
  });
}

document.addEventListener('firebasedone', init, false);

async function addListItem(dueDate) {
  const input = document.getElementById('list-input')
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
}