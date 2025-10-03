const express = require('express');
const app = express();
app.use(express.json());

let tasks = [];
let id = 1;

// Create Task
app.post('/tasks', (req, res) => {
  const now = new Date().toISOString();
  const task = {
    id: id++,
    title: req.body.title || '',
    done: false,
    lastModified: now
  };
  tasks.push(task);
  res.status(201).json(task);
});

// List Tasks
app.get('/tasks', (req, res) => res.json(tasks));

// Update Task
app.put('/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id == req.params.id);
  if (!task) return res.sendStatus(404);
  task.title = req.body.title ?? task.title;
  task.done = req.body.done ?? task.done;
  task.lastModified = new Date().toISOString();
  res.json(task);
});

// Delete Task
app.delete('/tasks/:id', (req, res) => {
  tasks = tasks.filter(t => t.id != req.params.id);
  res.sendStatus(204);
});

app.listen(3000, () => console.log("Backend running on http://localhost:3000"));
