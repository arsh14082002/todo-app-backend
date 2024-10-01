import nodemailer from 'nodemailer';
import User from '../models/userModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Create Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  secure: true,
  port: 465,
  auth: {
    user: 'roughwebsevemail@gmail.com',
    pass: 'njrlrhjrelhvkwff',
  },
});

export const userSingup = async (req, res) => {
  const { fullname, email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const username = email.split('@')[0];
    const newUser = await User.create({
      fullname,
      email,
      password: hashedPassword,
      username,
      isVerified: false,
    });

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET_KEY, { expiresIn: '7d' });

    // Send verification email
    const verificationToken = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: '1d',
    });
    const verificationLink = `http://localhost:3000/api/v1/user/verify/${verificationToken}`;

    const mailOptions = {
      from: 'roughwebsevemail@gmail.com',
      to: email,
      subject: 'Verify Your Email Address',
      text: `Hi ${fullname},\n\nPlease verify your email address by clicking the following link:\n\n${verificationLink}\n\nBest regards,\nThe Team`,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ token, user: newUser });
  } catch (error) {
    return res.status(500).json({ message: 'Error signing up user' });
  }
};

export const userSignin = async (req, res) => {
  const { emailOrUsername, password } = req.body;

  try {
    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    });

    if (!user) {
      return res.status(400).json({ message: 'Email or username not found' });
    }

    if (!user.isVerified) {
      return res.status(400).json({ message: 'Email not verified' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '7d' });

    res.status(200).json({ token, user });
  } catch (error) {
    res.status(500).json({ message: 'Error signing in user' });
  }
};

export const getProfile = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId).populate('todos');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const profileImg = user.profile_img;
    const todos = user.todos;
    const totalTodos = todos.length;
    const pinnedTodos = todos.filter((todo) => todo.pinned).length;
    const completedTodos = todos.filter((todo) => todo.completed).length;
    const notCompletedTodos = todos.filter((todo) => !todo.completed).length;
    const progressUpdatedTodos = todos.filter((todo) => todo.progressUpdated).length;

    res.status(200).json({
      totalTodos,
      pinnedTodos,
      completedTodos,
      notCompletedTodos,
      progressUpdatedTodos,
      profileImg,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile data' });
  }
};

export const verifyEmail = async (req, res) => {
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    user.isVerified = true;
    await user.save();

    res.status(200).json({ message: 'Email successfully verified' });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying email' });
  }
};
