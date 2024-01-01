import { read } from "./firebase.js";
import { removeDupes, parseTags } from "./main.js";

let search = await read('search', 'main');
search = search.main.split(';');
search.forEach((element, index) => search[index] = JSON.parse(element));

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
    if (search[i].keywords !== undefined) {
    // Make an array of the search terms for the current (iterated) object using the space seperated array of keywords
    currentKeywords = search[i].keywords.split(" ");
    }

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
  parseTags('#search-results');
}



// Add a result to #results, the results unordered list (called iteratively)
function addResult(index) {
  let element = document.createElement("li");

  element.innerHTML = `<a href="https://${search[index].link}" target="_blank">${search[index].name}</a>`
  //Add tags (stolen from todo)
  let plaintextTags = '';
  search[index].tags.split(' ').forEach((element) => (plaintextTags += `<span class="tag">#${element}</span>`))
  element.innerHTML += `<span class="tags-wrapper">${plaintextTags}</span>`;
  document.getElementById("search-results").appendChild(element);
}

window.refreshSearch = refreshSearch;
