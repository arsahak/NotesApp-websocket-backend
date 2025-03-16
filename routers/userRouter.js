const express = require("express");
const userRouter = express.Router();


const { isLoggedIn, isAdmin } = require("../middleware/auth");
const { register, login, refreshToken, logout, getUserById } = require("../controllers/usersController");

userRouter.post('/register', register);
userRouter.post('/login', login);
userRouter.post('/refresh', refreshToken);
userRouter.post('/logout', logout);
userRouter.get('/profile', getUserById);

module.exports = { userRouter };
