import express from 'express';
import { userSingup, userSignin, getProfile, verifyEmail } from '../controllers/userController.js';
import auth from '../middleware/auth.js';

const userRouter = express.Router();

userRouter.post('/signup', userSingup);
userRouter.post('/signin', userSignin);
userRouter.get('/profile', auth, getProfile); // Add authMiddleware to protect the route
userRouter.get('/verify/:token', verifyEmail); // Endpoint for email verification

export default userRouter;
