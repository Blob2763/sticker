// Open database
let db;
const request = indexedDB.open("TodoListDB", 1);

request.onerror = (event) => {
    console.error("Why didn't you allow Sticker to use IndexedDB?!");
};

request.onsuccess = (event) => {
    db = event.target.result;
    console.log("Database opened successfully");

    renderTodos();
};

request.onupgradeneeded = (event) => {
    // Save the IDBDatabase interface
    const db = event.target.result;

    // Create an objectStore for todos (if it doesn't already exist)
    if (!db.objectStoreNames.contains("todos")) {
        const todoStore = db.createObjectStore("todos", { keyPath: "id" });
        todoStore.createIndex("completed", "completed", { unique: false });
    }
};

function addTodo(title, dueDate, id = Date.now(), completed=false) {
    const transaction = db.transaction(["todos"], "readwrite");
    const store = transaction.objectStore("todos");

    // Create a todo object
    const todo = {
        id: id,  // Using timestamp as a unique ID
        title: title,
        dueDate: dueDate,  // Date sting in the form YYYY-MM-DD
        dueDateObject: new Date(dueDate),
        completed: completed,  // Initially, a todo is not completed
    };

    const request = store.add(todo);

    request.onsuccess = () => {
        console.log("Todo added:", todo);
    };

    request.onerror = (event) => {
        console.error("Error adding todo:", event.target.error);
    };
}

function markTodoAsCompleted(todoId) {
    const transaction = db.transaction(["todos"], "readwrite");
    const store = transaction.objectStore("todos");

    // Fetch the todo by ID
    const request = store.get(todoId);

    request.onsuccess = (event) => {
        const todo = event.target.result;
        if (todo) {
            // Update the completed property
            todo.completed = true;

            // Save the updated todo back into the database
            const updateRequest = store.put(todo);
            updateRequest.onsuccess = () => {
                console.log("Todo marked as completed:", todo);
            };
        } else {
            console.error("Todo not found");
        }
    };

    request.onerror = (event) => {
        console.error("Error marking todo as completed:", event.target.error);
    };
}

function deleteTodo(todoId) {
    const transaction = db.transaction(["todos"], "readwrite");
    const store = transaction.objectStore("todos");

    const request = store.delete(todoId);

    request.onsuccess = () => {
        console.log("Todo deleted:", todoId);
    };

    request.onerror = (event) => {
        console.error("Error deleting todo:", event.target.error);
    };
}

function getAllTodos() {
    return new Promise((resolve, reject) => {
        // Open a transaction in readonly mode
        const transaction = db.transaction(["todos"], "readonly");
        const store = transaction.objectStore("todos");

        // Get all todos from the object store
        const request = store.getAll();

        request.onsuccess = (event) => {
            const todos = event.target.result;
            console.log("All Todos:", todos);  // This logs the list of todos
            resolve(todos);  // Resolve the promise with the todos
        };

        request.onerror = (event) => {
            console.error("Error retrieving todos:", event.target.error);
            reject(event.target.error);  // Reject the promise if there's an error
        };
    });
}

function fixTodos() {
    // used to make sure each todo has the same structure

    // Use the Promise returned by getAllTodos
    getAllTodos()
        .then(todos => {
            todos.forEach(todo => {
                console.log(todo);
                deleteTodo(todo.id);
                addTodo(todo.title, todo.dueDate, todo.id, todo.completed);
            });
        }).catch(error => {
            console.error('Failed to fix todos:', error);
        });
}

function formatDate(dateYMD) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const dateObject = new Date(dateYMD);

    let dateString = '';

    dateString += days[dateObject.getDay()] + ' ';
    dateString += dateObject.getDate() + ' ';
    dateString += months[dateObject.getMonth()] + ' ';
    dateString += dateObject.getFullYear();

    return dateString;
}

function getSettings() {
    return {
        sortBy: document.getElementById('sort-by').value,
    };
}

function renderTodos() {
    // Make sure all todos have the same structure
    fixTodos();

    const listElement = document.getElementById('todos');

    // Use the Promise returned by getAllTodos
    getAllTodos()
        .then(todos => {
            listElement.innerHTML = '';

            const settings = getSettings();
            if (settings.sortBy === 'due-earliest-first') {
                todos.sort((a, b) => a.dueDateObject.getTime() - b.dueDateObject.getTime());
            } else if (settings.sortBy === 'due-latest-first') {
                todos.sort((a, b) => b.dueDateObject.getTime() - a.dueDateObject.getTime());
            }

            todos.forEach(todo => {
                if (true) {
                    const todoElement = document.createElement('div');
                    todoElement.className = 'todo';

                    const todoBody = document.createElement('div');
                    todoBody.className = 'todo-body';

                    todoBody.innerHTML += `<h2 class="todo-title ${todo.completed ? 'complete' : 'incomplete'}">${todo.title}</h2>`;

                    if (todo.dueDate) {
                        todoBody.innerHTML += `
                            <p class="todo-due-date-container">
                            Due <span class="todo-due-date">${formatDate(todo.dueDate)}</span>
                            </p>
                        `;
                    } else {
                        todoBody.innerHTML += '<p class="todo-due-date-container"></p>';
                    }

                    todoElement.appendChild(todoBody);

                    if (todo.completed) {
                        todoElement.innerHTML += `
                            <div class="todo-controls">
                            <button onclick="deleteTodo(${todo.id}); renderTodos();" class="delete-button"><i class="fi fi-rr-trash"></i></button>
                            <!-- <button class="edit-button"><i class="fi fi-rr-pencil"></i></button> --></div>
                        `;
                    } else {
                        todoElement.innerHTML += `
                            <div class="todo-controls">
                            <button onclick="deleteTodo(${todo.id}); renderTodos();" class="delete-button"><i class="fi fi-rr-trash"></i></button>
                            <!-- <button class="edit-button"><i class="fi fi-rr-pencil"></i></button> -->
                            <button onclick="markTodoAsCompleted(${todo.id}); renderTodos();" class="mark-as-done-button"><i class="fi fi-rr-check"></i></button></div>
                        `;
                    }

                    listElement.appendChild(todoElement);
                }
            });
        })
        .catch(error => {
            console.error('Failed to render todos:', error);
        });
}

document.getElementById('sort-by').addEventListener('change', function () {
    renderTodos();
});

const modal = document.getElementById('create-modal');
const openButton = document.getElementById('new-todo');
const closeButton = document.getElementsByClassName('close')[0];
const titleError = document.getElementById('title-error');
const titleInput = document.getElementById('new-title');
const dateInput = document.getElementById('new-date');

openButton.onclick = function () {
    titleInput.value = '';
    dateInput.value = '';

    titleError.style.display = 'none';
    modal.style.display = 'block';
}

closeButton.onclick = function () {
    modal.style.display = 'none';
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

function createTodo() {
    const title = titleInput.value;

    if (title) {
        addTodo(title, dateInput.value);
        renderTodos();
        modal.style.display = 'none';  // Close modal
    } else {
        titleError.style.display = 'inline';
    }
}