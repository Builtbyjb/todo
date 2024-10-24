// Create task
document.querySelector("#task-submit-form").onsubmit = async (event) => {
    event.preventDefault();

    const task = document.querySelector("#task-text-input").value;
    const value = { "task": task };
    const btn = document.querySelector("#form-submit-btn");

    if (btn.textContent === "Add") {
        const response = await sendPostRequest("create", value)

        if (response) {
            generateTask(response)
            document.querySelector("#task-text-input").value = "";
        }
    } else {
        const id = document.querySelector("#store-edit-task-id").value;
        const response = await sendPutRequest("edit", id, value)
        if (response === "success") {
            updateTask(id, task);
        }
    }
}

function updateTask(id, task) {
    document.querySelector(`#task-text-${id}`).textContent = task;
    document.querySelector("#task-text-input").value = "";
    document.querySelector("#store-edit-task-id").value = "";
    document.querySelector("#form-submit-btn").textContent = "Add";
}

document.addEventListener("click", async (event) => {
    const element = event.target;
    const id = element.dataset.taskid;

    // Edit task
    if (element.id === "edit-task") {
        document.querySelector("#task-text-input").value = getTask(id);
        document.querySelector("#store-edit-task-id").value = id;
        document.querySelector("#form-submit-btn").textContent = "Save";
    }

    // Delete task
    if (element.id === "delete-task") {
        const id = element.dataset.taskid
        const response = await sendDeleteRequest("delete", id);
        if (response === "success") {
            deleteTask(id);
        }
    }

    // Toggle task stage
    if (element.id === `task-checkbox-${id}`) {
        const is_completed = document.querySelector(`#task-checkbox-${id}`).toggleAttribute("checked");
        const value = { "is_completed": Number(is_completed) }
        const response = await sendPutRequest("stage", id, value)
        if (response === "success") {
            taskStageUpdate(id, is_completed)
        }
    }
})

function deleteTask(id) {
    const element = document.querySelector(`#task-item-${id}`)
    element.style.animationPlayState = "running";
    element.addEventListener("animationend", () => {
        element.remove();
    })
}

/*
Allows getting of newly generated tasks text content
*/
function getTask(id) {
    const task = document.querySelector(`#task-text-${id}`).textContent;
    return task
}

function taskStageUpdate(id, is_completed) {
    const element = document.querySelector(`#task-text-${id}`)

    if (is_completed) {
        element.classList.remove("flex-1", "text-gray-300")
        element.classList.add("flex-1", "text-gray-500", "line-through")
    } else {
        element.classList.remove("flex-1", "text-gray-500", "line-through")
        element.classList.add("flex-1", "text-gray-300")
    }
}

async function sendPostRequest(url, value) {
    try {
        const data = await fetch(`/${url}`, {
            method: "POST",
            headers: {
                "accept": "application/json",
                "content-type": "application/json",
            },
            body: JSON.stringify(value)

        })

        const response = await data.json()
        return response

    } catch (error) {
        console.error(error)
    }
}

async function sendPutRequest(url, id, value) {
    try {
        const data = await fetch(`/${url}/${id}`, {
            method: "PUT",
            headers: {
                "accept": "application/json",
                "content-type": "application/json",
            },
            body: JSON.stringify(value)
        })

        const response = await data.json()
        return response

    } catch (error) {
        console.error(error)
    }
}

async function sendDeleteRequest(url, id) {
    try {
        const data = await fetch(`/${url}/${id}`, {
            method: "DELETE"
        })

        const response = await data.json()
        return response

    } catch (error) {
        console.error(error)
    }
}

function generateTask(task) {
    const ul = document.querySelector("#task-list");

    const li = document.createElement("li")
    li.setAttribute("id", `task-item-${task.id}`)
    li.setAttribute("data-taskid", task.id)
    li.classList.add("py-4", "animate-delete")

    let labelClass;

    if (task.is_completed) {
        labelClass = "flex-1 text-gray-500 line-through"
    } else {
        labelClass = "flex-1 text-gray-300"
    }

    const div = document.createElement("div")
    div.classList.add("flex", "items-center", "space-x-4")
    div.innerHTML = `
        <input id="task-checkbox-${task.id}" data-taskid="${task.id}" type="checkbox"
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 bg-gray-700 border-gray-600 rounded"
        />
        <label id="task-text-${task.id}" data-taskid="${task.id}" class="${labelClass}"
        >${task.task}</label>
        <button id="edit-task" data-taskid="${task.id}"
            class="text-gray-500 hover:text-blue-400 transition duration-150 ease-in-out"
            aria-label="Edit task"
        >
          <svg id="edit-task" data-taskid="${task.id}"
            class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path id="edit-task" data-taskid="${task.id}"
                stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            ></path>
          </svg>
        </button>
        <button id="delete-task" data-taskid="${task.id}"
            class="text-gray-500 hover:text-red-400 transition duration-150 ease-in-out"
            aria-label="Delete task"
        >
          <svg id="delete-task" data-taskid="${task.id}"
            class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path id="delete-task" data-taskid="${task.id}"
                stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
    `;

    li.append(div)

    // Adds the newly generate task to the top of the list
    ul.prepend(li)
}