// models/todoModel.js
import mongoose from 'mongoose';

const todoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: String,

    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending',
    },

    pinned: {
      type: Boolean,
      default: false,
    },

    dueDate: Date,

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    completed: {
      type: Boolean,
      default: false,
    },
    
    progressUpdated: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const Todo = mongoose.model('Todo', todoSchema);
export default Todo;
