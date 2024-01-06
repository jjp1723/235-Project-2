// Onload
window.onload = (e) => {
    // Calling displayBreeds to fill the 'breeds' select - Calling in "onload" breaks localStorage
    displayBreeds();

    document.querySelector("#search").onclick = searchButtonClicked;
    document.querySelector(".rightArrow").onclick = nextPage;
    document.querySelector(".leftArrow").onclick = prevPage;

    // Using Local Storage to store the value of the search limit and breed
    limitField = document.querySelector("#limit");
    breedField = document.querySelector("#breeds");

    // Grabbing the stored data - Will return 'null' if the user has never been to this page before
    const storedLimit = localStorage.getItem("limitKey");

    // If a previously set limit is found, it is displayed
    if (storedLimit) {
        limitField.value = storedLimit;
    }
    else {
        limitField.value = 10;
    }

    // When the user changes the values of the selects, update localStorage
    limitField.onchange = storeLimit;
    breedField.onchange = storeBreed;
};

// Fields
let limitField;
let breedField;
let prefix;
let limitKey;
let breedKey;


let displayTerm = "";
let url = "";
let breedSub;
let index = 0;
let max = 0;
let limit = 0;



// -------------------------------
// ---------- Functions ----------
// -------------------------------



// ----- Storage Functions -----

function storeLimit(e) {
    localStorage.setItem("limitKey", e.target.value);
}

function storeBreed(e) {
    localStorage.setItem("breedKey", e.target.value);
}



// ----- Display Related Functions -----

function displayBreeds() {
    const ALL_DOG_URL = "https://dog.ceo/api/breeds/list/all";

    let allURL = ALL_DOG_URL;

    getAll(allURL);
}

function getAll(all) {
    // Create a new XHR object
    let xhr = new XMLHttpRequest();

    // Set the 'onload' handler
    xhr.onload = loadAll;

    // Set the 'onerror' handler
    xhr.onerror = dataError;

    // Open connection and send the request
    xhr.open("GET", all);
    xhr.send();
}

function loadAll(e) {
    // event.target is the 'xhr' object
    let xhr = e.target;

    // 'xhr'.responseText is the JSON file we just downloaded
    //console.log(xhr.responseText);

    // Turn the text into a parsable JavaScript object
    let message = JSON.parse(xhr.responseText).message;
    //console.log(message);
    //console.log(typeof message);
    let breedList = Object.keys(message);
    //console.log(breedList);
    //console.log(breedList.length);
    let select = document.querySelector("#breeds");

    // Loop through the breeds to parse the names of each breed into the select object
    for (let i = 0; i < breedList.length; i++) {
        let breed = breedList[i];
        breed = breed[0].toUpperCase() + breed.substring(1);
        let option = document.createElement("option");
        option.text = breed;
        option.value = breed;
        select.appendChild(option);

        //breedSub = breed.toLowerCase();
        //console.log(breedSub);

        let subList = message[breed.toLocaleLowerCase()];
        //console.log(subList);

        if (message[breed.toLocaleLowerCase()] != []) {
            for (let j = 0; j < subList.length; j++) {
                let subBreed = subList[j];
                subBreed = subBreed[0].toUpperCase() + subBreed.substring(1);
                let subOption = document.createElement("option");
                subOption.text = breed + " - " + subBreed;
                subOption.value = breed + "/" + subBreed;
                select.appendChild(subOption);
            }
        }
    }
    
    const storedBreed = localStorage.getItem("breedKey");

    // If a previously set breed is found, it is displayed
    if (storedBreed) {
        breedField.value = storedBreed;
    }
    else {
        breedField.value = "Affenpinscher";
    }

    // Displaying the results for the stored data
    //searchButtonClicked();
}



// ----- Search Related Functions -----

function searchButtonClicked() {
    index = 0;
    max = 0;

    const DOG_URL_1 = "https://dog.ceo/api/breed/";
    const DOG_URL_2 = "/images"

    // Building the URL string
    url = DOG_URL_1;

    // Getting the selected text
    let dogs = document.querySelector("#breeds");
    let term = dogs.options[dogs.selectedIndex].value;
    //console.log(term);

    // Get rid of any leading and trailing spaces
    term = term.trim();

    // Encode spaces and special characters
    //term = encodeURIComponent(term);

    // Set term to lower case
    term = term.toLowerCase();

    // If there's no term to search then bail out of the function (return does this)
    if (term.length < 1) return;

    // Append the search term to the URL
    url += term + DOG_URL_2;
    //console.log(url);

    getData(url);
}

function getData(currentURL) {
    // Create a new XHR object
    let xhr = new XMLHttpRequest();

    // Set the 'onload' handler
    xhr.onload = dataLoaded;

    // Set the 'onerror' handler
    xhr.onerror = dataError;

    // Open connection and send the request
    xhr.open("GET", currentURL);
    xhr.send();
}

function dataLoaded(e) {
    // event.target is the 'xhr' object
    let xhr = e.target;

    // 'xhr'.responseText is the JSON file we just downloaded
    //console.log(xhr.responseText);

    // Turn the text into a parsable JavaScript object
    let obj = JSON.parse(xhr.responseText);

    // If there are no results, print a message and return
    if (!obj.message || obj.message.length == 0) {
        document.querySelector("#status").innerHTML = "<b>No results found for '" + displayTerm + "'</b>";
        return; // Bail out
    }

    // Displaying search status
    let dogs = document.querySelector("#breeds");
    let term = dogs.options[dogs.selectedIndex].text;
    document.querySelector("#status").innerHTML = "<b>Seaching for pictures of " + term + " dogs...</b>";

    // Start building an HTML string we will display to the user
    let results = obj.message;
    //console.log("results.length = " + results.length);
    let bigString = "";

    //Establishing the limit
    let limits = document.querySelector("#limit");
    limit = limits.options[limits.selectedIndex].text;
    limit = parseInt(limit) + index;

    // Loop through the array of results
    for (index; index < limit; index++) {
        // Get the URL to the image
        let result = results[index];
        let smallURL = result;
        let resultURL = result;
        if (!smallURL) smallURL = "images/no-image-found.png";
        //console.log(smallURL);

        // Build a <div> to hold each result with ES6 String Templating
        bigString += `<div class='result'><span><a target='_blank' href='${resultURL}'><img src='${smallURL}' title= '${result.id}' alt='${term}'/></a></span></div>`;

        // Making sure an image exists at the next index - Ends the loop if not
        if (!results[index + 1]) {
            //console.log(!results[index + 1]);
            index = limit;
        }
    }

    // Showing the content to the user
    document.querySelector("#content").innerHTML = bigString;

    // Updating the the status
    let num = limit;
    //console.log("Limit: " + limit);
    //console.log("Results: " + results.length);
    if (limit >= results.length) {
        num = results.length;
        index--;
    }
    document.querySelector("#status").innerHTML = "<b>Success!</b><p><i>Here are " + (index - parseInt(limits.options[limits.selectedIndex].text) + 1) + "-" + num + " results for '" + term + "'</i></p>";

    max = results.length;
}



// ----- Page Related Functions -----

function nextPage() {
    //console.log("Next page button clicked");
    if (index < max) {
        //console.log(index + " < " + max);
        //console.log(url);
        getData(url);
    }
    else {
        //console.log(max + " >= " + index);
    }
}

function prevPage() {
    //console.log("Prev page button clicked");
    if (index > 0) {
        let limits = document.querySelector("#limit");
        index -= 2 * parseInt(limits.options[limits.selectedIndex].text);
        if (index < 0) {
            index = 0;
        }
        //console.log(index);
        getData(url);
    }
}



// ----- Error Function -----

function dataError(e) { console.log("An error occurred"); }


// ----- Debbuger (un-comment when needed) -----
//debugger;