import Todo from '../models/todoModel.js';
import User from '../models/userModel.js';
import mongoose from 'mongoose';

const validStatuses = ['pending', 'in-progress', 'completed'];

export const createTodo = async (req, res) => {
  const { title, description, dueDate, pinned } = req.body; // Add pinned field
  const userId = req.user.id;

  try {
    const newTodo = new Todo({
      title,
      description,
      dueDate,
      pinned: pinned || false, // Default to false if not provided
      user: userId,
    });

    await newTodo.save();

    await User.findByIdAndUpdate(userId, { $push: { todos: newTodo._id } });

    res.status(201).json(newTodo);
  } catch (error) {
    res.status(500).json({ message: 'Error creating todo: ' + error.message });
  }
};

export const getUserTodos = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId).populate({
      path: 'todos',
      options: { sort: { pinned: -1, createdAt: -1 } },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      todos: user.todos,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error fetching todos: ' + error.message,
    });
  }
};

export const deleteTodo = async (req, res) => {
  const todoId = req.params.id; // Get the todo ID from the request parameters
  const userId = req.user.id; // Get the user ID from the authenticated user

  try {
    // Find the todo item
    const todo = await Todo.findById(todoId);
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    // Check if the todo belongs to the user
    if (todo.user.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this todo' });
    }

    // Delete the todo
    await Todo.findByIdAndDelete(todoId);

    // await User.findByIdAndUpdate(userId, { $pull: { todos: todoId } });

    return res.status(200).json({ message: 'Todo deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting todo: ' + error.message });
  }
};

export const togglePin = async (req, res) => {
  const todoId = req.params.id;
  const userId = req.user.id;

  try {
    // Find the todo item
    const todo = await Todo.findById(todoId);
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    if (todo.user.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this todo' });
    }

    // Toggle the pinned status
    todo.pinned = !todo.pinned;
    await todo.save();

    return res.status(200).json(todo);
  } catch (error) {
    return res.status(500).json({ message: 'Error toggling pin status: ' + error.message });
  }
};

export const updateTodo = async (req, res) => {
  const todoId = req.params.id;
  const { title, description, dueDate, pinned, status } = req.body;
  const userId = req.user.id;

  try {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(todoId)) {
      return res.status(400).json({ message: 'Invalid todo ID' });
    }

    // Find the todo item
    const todo = await Todo.findById(todoId);
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    // Check if the todo belongs to the user
    if (todo.user.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this todo' });
    }

    // Validate status
    if (status !== undefined && !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    // Update the todo item
    if (title !== undefined) todo.title = title;
    if (description !== undefined) todo.description = description;
    if (dueDate !== undefined) todo.dueDate = dueDate;
    if (pinned !== undefined) todo.pinned = pinned;
    if (status !== undefined) todo.status = status;

    if (status === 'completed') {
      todo.deletedAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // Mark for deletion in 24 hours
      await todo.save();
      // Optionally remove the todo from the user's list of todos
      await User.findByIdAndUpdate(userId, { $pull: { todos: todoId } });
      return res
        .status(200)
        .json({ message: 'Todo marked as completed and will be deleted in 24 hours' });
    } else {
      await todo.save();
      return res.status(200).json(todo);
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error updating todo: ' + error.message });
  }
};

export const updateTodoStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // Expecting { status: 'pending' } or { status: 'in-progress' } or { status: 'completed' }

  try {
    // Validate the provided status
    if (!['pending', 'in-progress', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const todo = await Todo.findByIdAndUpdate(id, { status }, { new: true });
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    res.status(200).json(todo);
  } catch (error) {
    res.status(500).json({ message: 'Error updating todo status' });
  }
};
