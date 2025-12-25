const Todo = require('../models/todo');
const asyncHandler = require('../utils/asyncHandler'); // Import utility

// Helper function for consistent error throwing
const throwClientError = (message, statusCode = 400) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  throw err;
};

// Get all todos for the authenticated user
exports.getAllTodos = asyncHandler(async (req, res) => {
  const todos = await Todo.find({ owner: req.user._id })
    .sort({ createdAt: -1 });
  
  res.json(todos);
});

// Get a single todo by ID
exports.getTodoById = asyncHandler(async (req, res) => {
  const todo = await Todo.findOne({
    _id: req.params.id,
    owner: req.user._id
  });

  if (!todo) {
    throwClientError('Todo not found', 404);
  }

  res.json(todo);
});

// Create a new todo
exports.createTodo = asyncHandler(async (req, res) => {
  const { title } = req.body;

  if (!title || title.trim().length === 0) {
    throwClientError('Title is required');
  }

  const todo = new Todo({
    title: title.trim(),
    owner: req.user._id
  });

  // Mongoose validation errors will be caught by asyncHandler and forwarded
  await todo.save(); 
  res.status(201).json(todo);
});

// Update a todo
exports.updateTodo = asyncHandler(async (req, res) => {
  const { title, done } = req.body;

  const todo = await Todo.findOne({
    _id: req.params.id,
    owner: req.user._id
  });

  if (!todo) {
    throwClientError('Todo not found', 404);
  }

  if (title !== undefined) todo.title = title.trim();
  if (done !== undefined) todo.done = done;

  // Mongoose validation errors will be caught by asyncHandler
  await todo.save(); 
  res.json(todo);
});

// Delete a todo
exports.deleteTodo = asyncHandler(async (req, res) => {
  const todo = await Todo.findOneAndDelete({
    _id: req.params.id,
    owner: req.user._id
  });

  if (!todo) {
    throwClientError('Todo not found', 404);
  }

  res.status(204).send();
});

// Delete all completed todos
exports.deleteCompletedTodos = asyncHandler(async (req, res) => {
  const result = await Todo.deleteMany({
    owner: req.user._id,
    done: true
  });

  res.json({ 
    message: `Deleted ${result.deletedCount} completed todos`,
    deletedCount: result.deletedCount 
  });
});