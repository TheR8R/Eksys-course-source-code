/*
 * The following use Javascript promise (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises) together with the async/await keywords. Understanding promises and uses of the async/await keywords:https://www.geeksforgeeks.org/difference-between-promise-and-async-await-in-node-js/
 * We use the Fetch API (https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) to talk to the server
 * Note: We could also use the common "fat arrow" (https://www.freecodecamp.org/news/when-and-why-you-should-use-es6-arrow-functions-and-when-you-shouldnt-3d851d7f0b26/) notation for our anonymous functions, but it makes the code less readable.
 */
let validUsers = ["VINNIE", "ANDERS", "TOA"];
let timeout = 69;

let username = document.cookie;

while (!validUsers.includes(getCookie("username").toUpperCase())) {
    user = prompt("Hvem er du?").toUpperCase();
    document.cookie = "username" + "=" + user + ";";
    if (!validUsers.includes(user)) {
        alert("Det er ikke en bruger vi kender.");
    }
}

if (getCookie("timeStamp") === "") {
    document.cookie = "timeStamp" + "=" + "0" + ";";
}

function getCookie(cookie) {
    let name = cookie + "=";
    let spli = document.cookie.split(";");
    for (var j = 0; j < spli.length; j++) {
        let char = spli[j];
        while (char.charAt(0) == " ") {
            char = char.substring(1);
        }
        if (char.indexOf(name) == 0) {
            return char.substring(name.length, char.length);
        }
    }
    return "";
}

let sorteringsvariabel = "id";

//function to create the todo object which holds all the information needed for the todo
function createToDo() {
    let titel = document.querySelector("#newTitel");
    let deadline = document.querySelector("#newDeadline");
    let fælles = document.querySelector("#newFælles");
    let obs = document.querySelector("#newOBS");
    let prioritet = document.querySelector("#newPrioritet");
    let status = document.querySelector("#newStatus");
    let beskrivelse = document.querySelector("#newBeskrivelse");

    let todo = {
        title: titel.value,
        deadline: deadline.value,
        priority: prioritet.value,
        status: status.value,
        description: beskrivelse.value,
        author: getCookie("username"),
        section: getCookie("username"),
    };

    if (fælles.checked) {
        todo.author = "COMMON";
        todo.section = "COMMON";
    }
    if (obs.checked) {
        todo.section = "OBS";
    }
    if (status.value === "Afsluttet") {
        todo.section = "COMPLETED";
    }

    titel.value = "";
    deadline.value = "";
    prioritet.value = "Low";
    status.value = "Afventer";
    beskrivelse.value = "";
    fælles.checked = false;
    obs.checked = false;

    return todo;
}

/**
 * post the todo to the server and adds the returning object to the DOM
 */
async function addNewTodo() {
    let titel = document.querySelector("#newTitel");
    let addNewTodoModal = new bootstrap.Modal(document.getElementById('addNewTodoModal'));

    if (titel.value.trim() === "") {
        alert("Titel skal være udfyldt for at lave en ny todo");
        addNewTodoModal.toggle();
        titel.value = "";
        return;
    }

    let todo = createToDo();
    res = await postTodoToServer(todo);
    if (res.timestamp !== undefined) {
        document.cookie = "timeStamp" + "=" + res.timestamp + ";";
    }

    setTimeout(() => {
        fetchTodos();
    }, timeout);
}

/**
 * post todo to server
 * @return {Promise} returns a promise we have to await for
 * @return {resolved} when promise is resolve, it returns a json object with id and todo
 * @throws {Error} returns Error object with status code
 *
 * The async keyword allow us to use the await prefix for the fetch function.
 */
async function postTodoToServer(data = {}) {
    const response = await fetch("/todo", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify(data),
    });
    //We add this additional fail condition to capture connection issues
    if (!response.ok) {
        throw new Error(
            `Connection failed with status code ${response.status}`
        );
    }
    return await response.json();
}


async function checkForUpdate() {
    let timeStamp = getCookie("timeStamp");
    let response = await fetch("/checkUpdate/" + timeStamp, {
        method: "POST",
        headers: {
            Accept: "application/json",
        },
    });

    return await response.json();
}

/**
 * Appends a specific json todo object to the DOM
 * @param {Object} todoJson Todo object to append
 */
function appendTodoToList(todoJson) {
    let Todolist = document.querySelector("#theTodosList");

    let newTodo = document.createElement("div");
    newTodo.classList.add("input-group", "mb-3", "todo-item");
    newTodo.setAttribute("id", todoJson.id);

    let titleButton = document.createElement("button");
    titleButton.classList.add(
        "btn",
        "btn-outline-secondary",
        "fill-remaining-space"
    );
    titleButton.setAttribute("type", "button");
    titleButton.setAttribute("data-bs-toggle", "modal");
    titleButton.setAttribute("data-bs-target", "#detailsTodoModal");

    titleButton.addEventListener("click", (e) => {
        showDetails(titleButton);
    });

    titleButton.innerText = todoJson.title;


    let prioritetSpan = document.createElement("span");
    prioritetSpan.classList.add("input-group-text", "priority");
    prioritetSpan.setAttribute("id", "basic-addon3");
    prioritetSpan.innerText = "Prioritet: " + translateToDanish(todoJson.priority);

    let deadlineSpan = document.createElement("span");
    deadlineSpan.classList.add("input-group-text");
    deadlineSpan.setAttribute("data-bs-toggle", "tooltip");
    deadlineSpan.setAttribute("data-bs-position", "top");
    let deadline = todoJson.deadline;
    if (deadline != undefined) {
        deadline = deadline.split("-").reverse().join("-");
    } else {
        deadline = "Ingen deadline";
    }
    deadlineSpan.setAttribute("title", "Deadline: " + deadline);
    deadlineSpan.setAttribute("id", "basic-addon3");

    let svgClock = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
    );
    svgClock.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svgClock.setAttribute("width", "16");
    svgClock.setAttribute("height", "16");
    svgClock.setAttribute("fill", "currentColor");
    svgClock.classList.add("bi", "bi-clock");
    svgClock.setAttribute("viewBox", "0 0 16 16");

    clock1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
    clock1.setAttribute(
        "d",
        "M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"
    );

    clock2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
    clock2.setAttribute(
        "d",
        "M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"
    );

    svgClock.appendChild(clock1);
    svgClock.appendChild(clock2);
    deadlineSpan.appendChild(svgClock);

    let editButton = document.createElement("button");
    editButton.classList.add("btn", "btn-outline-secondary");
    editButton.setAttribute("id", "editTodo");
    editButton.setAttribute("data-bs-toggle", "modal");
    editButton.setAttribute("data-bs-target", "#editTodoModal");

    let svgEdit = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgEdit.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svgEdit.setAttribute("width", "16");
    svgEdit.setAttribute("height", "16");
    svgEdit.setAttribute("fill", "currentColor");
    svgEdit.classList.add("bi", "bi-pencil-square");
    svgEdit.setAttribute("viewBox", "0 0 16 16");

    edit1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
    edit1.setAttribute(
        "d",
        "M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"
    );

    edit2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
    edit2.setAttribute("fill-rule", "evenodd");
    edit2.setAttribute(
        "d",
        "M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"
    );

    svgEdit.appendChild(edit1);
    svgEdit.appendChild(edit2);
    editButton.appendChild(svgEdit);

    editButton.addEventListener("click", (e) => {
        editTodo(editButton);
    });

    let statusTodo = document.createElement("span");
    statusTodo.classList.add("input-group-text");
    statusTodo.setAttribute("id", "status");

    let statusP = document.createElement("p");
    statusP.classList.add("todo-status-" + todoJson.status);
    statusP.innerText = todoJson.status;
    statusTodo.appendChild(statusP);

    let completeButton = document.createElement("button");
    completeButton.classList.add("btn", "btn-outline-secondary");
    completeButton.setAttribute("id", "completeButton");

    let svgComplete = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
    );
    svgComplete.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svgComplete.setAttribute("width", "16");
    svgComplete.setAttribute("height", "16");
    svgComplete.setAttribute("fill", "currentColor");
    svgComplete.classList.add("bi", "bi-check-square");
    svgComplete.setAttribute("viewBox", "0 0 16 16");

    complete1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
    complete1.setAttribute(
        "d",
        "M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"
    );

    complete2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
    complete2.setAttribute(
        "d",
        "M10.97 4.97a.75.75 0 0 1 1.071 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.235.235 0 0 1 .02-.022z"
    );

    svgComplete.appendChild(complete1);
    svgComplete.appendChild(complete2);
    completeButton.appendChild(svgComplete);

    newTodo.appendChild(titleButton);
    newTodo.appendChild(prioritetSpan);
    newTodo.appendChild(deadlineSpan);
    newTodo.appendChild(editButton);
    newTodo.appendChild(statusTodo);
    newTodo.appendChild(completeButton);
    Todolist.appendChild(newTodo);

    completeButton.addEventListener("click", (e) => {
        let confirmation = confirm(
            "Er du sikker på at du vil afslutte denne To-do?"
        );
        if (confirmation) {
            todo = completeTodo(completeButton);
        }
    });
}

function translateToDanish(prioritet) {
    if (prioritet == "Low") {
        return "Lav";
    } else if (prioritet == "Medium") {
        return "Mellem";
    } else if (prioritet == "High") {
        return "Høj";
    }
}


/**
 * complete todo to server
 * @param {Event} evt click event
 * @return {Promise} returns a promise we have to await for
 * @return {resolved} when promise is resolve, it returns a json object with id and todo
 * @throws {Error} returns Error object with status code
 *
 * The async keyword allow us to use the await prefix for the fetch function.
 */
async function completeTodoToServer(id) {
    const response = await fetch("/todo/" + id, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
    });
    //We add this additional fail condition to capture connection issues
    if (!response.ok) {
        throw new Error(
            `Connection failed with status code ${response.status}`
        );
    }
    return await response.json();
}

function completeTodo(button) {
    let id = button.parentNode.id;
    completeTodoToServer(id);
    setTimeout(() => {
        fetchTodos();
    }, timeout);
}

function editTodo(button) {
    let id = button.parentNode.id;
    currentID = id;
    let todoPromise = getSingleTodoFromServer(id);
    todoPromise.then((todo) => {
        buildEditModal(todo);
    });
}

function showDetails(button) {
    let id = button.parentNode.id;
    let todoPromise = getSingleTodoFromServer(id);
    todoPromise.then((todo) => {
        buildDetailsModal(todo);
    });
}

function buildDetailsModal(todo) {
    let titel = document.querySelector("#title-details");
    titel.innerText = todo.title;

    let deadline = document.querySelector("#deadline-details");
    if (todo.deadline != undefined) {
        deadline.innerText = todo.deadline;
    } else {
        deadline.innerText = "Ingen deadline";
    }

    let prioritet = document.querySelector("#priority-details");
    prioritet.innerText = translateToDanish(todo.priority);

    let status = document.querySelector("#status-details");
    status.setAttribute("class", "details-status-" + todo.status + " badge");
    status.innerText = todo.status;

    let beskrivelse = document.querySelector("#details-details");
    beskrivelse.innerText = todo.description;
}

function buildEditModal(todo) {
    let titel = document.querySelector("#editTitel");
    titel.value = todo.title;

    let deadline = document.querySelector("#editDeadline");
    deadline.value = todo.deadline;

    let prioritet = document.querySelector("#editPrioritet");
    prioritet.value = todo.priority;

    let status = document.querySelector("#editStatus");
    status.value = todo.status;

    let beskrivelse = document.querySelector("#editBeskrivelse");
    beskrivelse.value = todo.description;

    let fælles = document.querySelector("#editFælles");
    if (todo.author == "COMMON" || todo.section == "COMMON") {
        fælles.checked = true;
    } else {
        fælles.checked = false;
    }

    let obs = document.querySelector("#editOBS");

    if (todo.section == "OBS") {
        obs.checked = true;
    } else {
        obs.checked = false;
    }
}

function saveEdit() {
    let titel = document.querySelector("#editTitel");
    let deadline = document.querySelector("#editDeadline");
    let prioritet = document.querySelector("#editPrioritet");
    let status = document.querySelector("#editStatus");
    let beskrivelse = document.querySelector("#editBeskrivelse");
    let fælles = document.querySelector("#editFælles");
    let obs = document.querySelector("#editOBS");

    let todo = {
        title: titel.value,
        deadline: deadline.value,
        priority: prioritet.value,
        status: status.value,
        description: beskrivelse.value,
        author: getCookie("username"),
        section: getCookie("username"),
    };

    if (fælles.checked) {
        todo.author = "COMMON";
        todo.section = "COMMON";
    }
    if (obs.checked) {
        todo.section = "OBS";
    }
    if (status.value === "Afsluttet") {
        todo.section = "COMPLETED";
    }

    saveEditToServer(todo, currentID);
    setTimeout(() => {
        fetchTodos();
    }, timeout);
}

function buildAddTodoModal() {
    fællesSectionChecked = fællesSection.classList.contains("active");
    fælles = document.querySelector("#newFælles");
    if (fællesSectionChecked) {
        fælles.checked = true;
    } else {
        fælles.checked = false;
    }
}

async function saveEditToServer(data = {}, id) {
    const response = await fetch("/updateTodo/" + id, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify(data),
    });
    //We add this additional fail condition to capture connection issues
    if (!response.ok) {
        throw new Error(
            `Connection failed with status code ${response.status}`
        );
    }
    return await response.json();
}

/**
 * Fetch todos fetch out todolist and append them to the DOM elemeent
 * async/await keywords allow us to wait for the return as object (and not promise)
 */
async function fetchTodos() {
    let Todolist = document.querySelector("#theTodosList");
    Todolist.replaceChildren();
    section = document.querySelector(".active").id;

    try {
        let todos = await getTodosFromServer(section, sorteringsvariabel);
        todos.forEach((todo) => {
            appendTodoToList(todo);
        });
    } catch (err) {
        console.log(err);
    }
}

async function fetchTodosCommon() {
    let Todolist = document.querySelector("#theTodosList");
    Todolist.replaceChildren();
    section = document.querySelector(".active").id;

    try {
        let todos = await getTodosFromServer(section, sorteringsvariabel);
        todos.forEach((todo) => {
            appendTodoToList(todo);
        });
        res = await getTimestamp();
        document.cookie = "timeStamp" + "=" + res.timestamp + ";";
        document.querySelector("#notification-dot").setAttribute("style", "display: none");
    } catch (err) {
        console.log(err);
    }
}

async function getTimestamp() {
    const response = await fetch("/getTimestamp", {
        method: "GET",
        headers: {
            Accept: "application/json",
        },
    });

    return await response.json();
}


function activeSection() {
    let activeSection = document.querySelector("#" + getCookie("username"));
    activeSection.classList.toggle("active");
}

/**
 * Get Todo's from the server using the Fetch API
 * @return {Promise} returns a promise we have to await for
 * @return {resolved} when promise is resolve, it returns a json list of todo
 * @throws {Error} returns Error object with status code
 *
 * The async keyword allow us to use the await prefix for the fetch function.
 */
async function getTodosFromServer(section, sorting) {
    const response = await fetch("/todo/" + section + "/" + sorting, {
        method: "GET",
        headers: {
            Accept: "application/json",
        },
    });
    //We add this additional fail condition to capture connection issues
    if (!response.ok) {
        throw new Error(
            `Connection failed with status code ${response.status}`
        );
    }
    return await response.json();
}

async function getSingleTodoFromServer(id) {
    const response = await fetch("/singleTodo/" + id, {
        method: "GET",
        headers: {
            Accept: "application/json",
        },
    });
    //We add this additional fail condition to capture connection issues
    if (!response.ok) {
        throw new Error(
            `Connection failed with status code ${response.status}`
        );
    }
    return await response.json();
}

function deleteTodo() {
    let confirmation = confirm("Er du sikker på du vil slette denne todo?");
    if (confirmation) {
        deleteTodoToServer(currentID);
    }
    setTimeout(() => {
        fetchTodos();
    }, timeout);
}

/**
 * delete todo on server
 * @return {Promise} returns a promise we have to await for
 * @return {resolved} when promise is resolve, it returns 204 from server
 * @throws {Error} returns Error object with status code
 *
 * The async keyword allow us to use the await prefix for the fetch function.
 */
async function deleteTodoToServer(id) {
    const response = await fetch("/todo/" + id, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
    });
    //We add this additional fail condition to capture connection issues
    if (!response.ok) {
        throw new Error(
            `Connection failed with status code ${response.status}`
        );
    }
    return;
}

function setSortingVariable(sorting) {
    sorteringsvariabel = sorting;
    fetchTodos();
}

async function checkTimestamp() {
    res = await checkForUpdate();

    if (res.notify) {
        document.querySelector("#notification-dot").setAttribute("style", "display: block");
    } else {
        document.querySelector("#notification-dot").setAttribute("style", "display: none");
    }

}


//HANDLERS
let editTodoModal = document.querySelector("#editTodoModal");
let currentID;

//BUTTONS
let saveNewTodo = document.querySelector("#gemNyTodo");
let completeTodoButton = document.querySelector("#completeButton");
let vinnieSection = document.querySelector("#VINNIE");
let toaSection = document.querySelector("#TOA");
let andersSection = document.querySelector("#ANDERS");
let fællesSection = document.querySelector("#COMMON");
let færdigeSection = document.querySelector("#COMPLETED");
let obsSection = document.querySelector("#OBS");
let editButton = document.querySelector("#editTodo");
let deletebutton = document.querySelector("#sletTodo");
let saveEditTodo = document.querySelector("#gemTodo");


//click handlers
saveNewTodo.onclick = addNewTodo;
vinnieSection.onclick = fetchTodos;
toaSection.onclick = fetchTodos;
andersSection.onclick = fetchTodos;
fællesSection.onclick = fetchTodosCommon;
færdigeSection.onclick = fetchTodos;
obsSection.onclick = fetchTodos;
saveEditTodo.onclick = saveEdit;
deletebutton.onclick = deleteTodo;

activeSection();
fetchTodos();
setInterval(checkTimestamp, 10000); // check for update every 10 seconds