import cron from 'node-cron';
import Todo from '../models/todoModel.js'; // Adjust the path as necessary

// Schedule the task to run every hour
cron.schedule('0 * * * *', async () => {
  try {
    const now = new Date();
    // Find todos marked for deletion that are past their deletion time
    const todosToDelete = await Todo.find({ deletedAt: { $lte: now } });

    if (todosToDelete.length > 0) {
      // Delete the todos
      await Todo.deleteMany({ _id: { $in: todosToDelete.map((todo) => todo._id) } });
      console.log('Deleted todos:', todosToDelete);
    }
  } catch (error) {
    console.error('Error deleting expired todos:', error.message);
  }
});
