const createError = require("http-errors");
const data = require("../data");
const User = require("../models/userModel");
const { successResponse } = require("./responseController");
const { findWithId } = require("../services/findWithId");
const createJsonWebToken = require("../helper/jsonWebToken");
const { jwtSecretKey, clientUrl, nodeEnv, accessToken, accessJwtSecretKey, refreshJwtSecretKey } = require("../secret");

const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");



// Helper function to generate JWT tokens
const generateAccessToken = (user) => {
    return jwt.sign({ _id: user._id }, jwtSecretKey, { expiresIn: '15m' });
};

const generateRefreshToken = (user) => {
    return jwt.sign({ _id: user._id }, jwtSecretKey, { expiresIn: '7d' });
};

// User Registration
// const register = async (req, res, next) => {
//     try {
//         const { name, email, password } = req.body;
//         const existingUser = await User.findOne({ email });
//         if (existingUser) throw createError(400, "Email already exists");

//         const newUser = new User({ name, email, password });
//         await newUser.save();

//         return res.status(201).json({ message: "User registered successfully" });
//     } catch (error) {
//         next(error);
//     }
// };

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return next(
        createError(409, "User with this email already exists, please sign in")
      );
    }

    // Create a new user
    const newUser = await User.create({
      name,
      email,
      password
    });

    // Respond with success message
    return successResponse(res, {
      statusCode: 201,
      message: "User registered successfully",
      payload: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

// User Login
// const login = async (req, res, next) => {
//     try {
//         const { email, password } = req.body;

//         const user = await User.findOne({ email });

//         if (!user || !(await user.comparePassword(password))) {
//             throw createError(401, "Invalid email or password");
//         }

//         const accessToken = generateAccessToken(user);
//         const refreshToken = generateRefreshToken(user);

//         user.refreshToken = refreshToken;
//         await user.save();

//         res.cookie('refreshToken', refreshToken, {
//             httpOnly: false,
//             // secure: process.env.NODE_ENV === 'production',
//             sameSite: 'Strict',
//         });

//         return res.status(200).json({
//             message: "Login successful",
//             accessToken,
//         });
//     } catch (error) {
//         next(error);
//     }
// };

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      throw createError(
        404,
        "User does not exist with this email, Please register first"
      );
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      throw createError(404, "Email/Password did not match");
    }

    const accessToken = await createJsonWebToken({ user }, accessJwtSecretKey, {
      expiresIn: "7d", 
    });
    
    res.cookie("accessToken", accessToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000, 
      httpOnly: true,
      sameSite: "none", 
    });
    

    const refreshToken = await createJsonWebToken({ user }, refreshJwtSecretKey, {
      expiresIn: "30d", 
    });
    
    res.cookie("refreshToken", refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000, 
      httpOnly: true,
      sameSite: "none", 
    });

    return successResponse(res, {
      statusCode: 201,
      message: "User login successfully ",
      payload: { user, accessToken, refreshToken  },
    });
  } catch (error) {
    next(error);
  }
};

// Refresh Token
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body; // Extract refreshToken from request body

    if (!refreshToken) {
      throw createError(401, "Refresh Token Missing. Please login again.");
    }


    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, refreshJwtSecretKey);

    if (!decoded || !decoded.user || !decoded.user._id) {
      throw createError(401, "Invalid Refresh Token.");
    }

    // Check if user exists
    const user = await User.findById(decoded.user._id);
    if (!user) {
      throw createError(401, "User not found.");
    }

    // Generate a new access token
    const newAccessToken = await createJsonWebToken(
      { user: { _id: user._id, email: user.email } },
      accessJwtSecretKey,
      { expiresIn: "7d" }
    );

    res.cookie("accessToken", newAccessToken, {
      maxAge: 7 *24 * 60 *  60 *1000, // 1 minute
      httpOnly: true,
      secure: nodeEnv === "production", // Set secure in production
      sameSite: "none",
    });

    return successResponse(res, {
      statusCode: 200,
      message: "Access token refreshed",
      payload: { accessToken: newAccessToken },
    });
  } catch (error) {
    console.error("Refresh token error:", error.message);
    next(error);
  }
};


// Logout User
const logout = async (req, res, next) => {
    try {
        const { refreshToken } = req.cookies;
        if (!refreshToken) return res.status(204).json();

        const user = await User.findOne({ refreshToken });
        if (user) {
            user.refreshToken = null;
            await user.save();
        }

        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
        });

        return res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        next(error);
    }
};

// Get User by ID
const getUserById = async (req, res, next) => {
    try {
        const id = req.user._id;
        const options = { password: 0, refreshToken: 0 };

        const user = await User.findById(id).select(options);
        if (!user) throw createError(404, "User not found");

        return res.status(200).json({
            message: "User successfully returned",
            payload: { user },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { register, login, refreshToken, logout, getUserById };
