import {
  createTodo,
  deleteTodo,
  getUserTodos,
  togglePin,
  updateTodo,
  updateTodoStatus,
} from '../controllers/todoController.js';
import express from 'express';
import auth from '../middleware/auth.js';

const todoRouter = express.Router();

// Route for creating a todo
todoRouter.post('/create', auth, createTodo);
todoRouter.get('/', auth, getUserTodos);
todoRouter.delete('/:id', auth, deleteTodo);
todoRouter.patch('/pin/:id', auth, togglePin);
todoRouter.put('/:id', auth, updateTodo);
todoRouter.patch('/status/:id', auth, updateTodoStatus); // New route for updating status

export default todoRouter;
