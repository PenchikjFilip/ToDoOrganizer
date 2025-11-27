// All CRUD operations for the user’s to-do items, fully integrated with authentication


const Todo = require('../models/todo');

// Get all todos for the authenticated user
exports.getAllTodos = async (req, res, next) => {
  try {
    const todos = await Todo.find({ owner: req.user._id })
      .sort({ createdAt: -1 }); // newest first
    
    res.json(todos);
  } catch (err) {
    next(err); // pass to error handler
  }
};

// Get a single todo by ID
exports.getTodoById = async (req, res, next) => {
  try {
    const todo = await Todo.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    res.json(todo);
  } catch (err) {
    next(err);
  }
};

// Create a new todo
exports.createTodo = async (req, res, next) => {
  try {
    const { title } = req.body;

    if (!title || title.trim().length === 0) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const todo = new Todo({
      title: title.trim(),
      owner: req.user._id
    });

    await todo.save();
    res.status(201).json(todo);
  } catch (err) {
    // Mongoose validation errors
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    next(err);
  }
};

// Update a todo
exports.updateTodo = async (req, res, next) => {
  try {
    const { title, done } = req.body;

    const todo = await Todo.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    // Update only provided fields
    if (title !== undefined) todo.title = title.trim();
    if (done !== undefined) todo.done = done;

    await todo.save();
    res.json(todo);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    next(err);
  }
};

// Delete a todo
exports.deleteTodo = async (req, res, next) => {
  try {
    const todo = await Todo.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    res.status(204).send(); // No content
  } catch (err) {
    next(err);
  }
};

// Delete all completed todos
exports.deleteCompletedTodos = async (req, res, next) => {
  try {
    const result = await Todo.deleteMany({
      owner: req.user._id,
      done: true
    });

    res.json({ 
      message: `Deleted ${result.deletedCount} completed todos`,
      deletedCount: result.deletedCount 
    });
  } catch (err) {
    next(err);
  }
};