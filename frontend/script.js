const API = "http://localhost:3000/tasks";
const listEl = document.getElementById("taskList");
const inputEl = document.getElementById("taskInput");

async function fetchTasks() {
  const res = await fetch(API);
  const tasks = await res.json();
  listEl.innerHTML = "";
  tasks.forEach(t => {
    const li = document.createElement("li");
    li.innerHTML = `${t.title} (last modified: ${t.lastModified}) 
      <button onclick="deleteTask(${t.id})">❌</button>`;
    listEl.appendChild(li);
  });
}

async function addTask() {
  const title = inputEl.value.trim();
  if (!title) return;
  await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title })
  });
  inputEl.value = "";
  fetchTasks();
}

async function deleteTask(id) {
  await fetch(`${API}/${id}`, { method: "DELETE" });
  fetchTasks();
}

// Initial load
fetchTasks();
