const express = require('express');
const router = express.Router();
const todoController = require('../controllers/todoController');
const authMiddleware = require('../middleware/auth');

// All todo routes require authentication
router.use(authMiddleware);

// GET /todos - Get all todos for the authenticated user
router.get('/', todoController.getAllTodos);

// GET /todos/:id - Get a specific todo
router.get('/:id', todoController.getTodoById);

// POST /todos - Create a new todo
router.post('/', todoController.createTodo);

// PUT /todos/:id - Update a todo
router.put('/:id', todoController.updateTodo);

// DELETE /todos/:id - Delete a todo
router.delete('/:id', todoController.deleteTodo);

// DELETE /todos/completed/all - Delete all completed todos
router.delete('/completed/all', todoController.deleteCompletedTodos);

module.exports = router;