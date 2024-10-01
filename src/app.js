import express from 'express';
import userRouter from './routes/userRoute.js';
import todoRouter from './routes/todoRoute.js';
import cors from 'cors';

const app = express();

app.use(express.json());
app.use(cors({ origin: '*' }));

// Home route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// User routes
app.use('/api/v1/user', userRouter);
app.use('/api/v1/todo', todoRouter);

export default app;
