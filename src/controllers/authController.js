const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '15m', // 15 minutes
  });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: '7d', // 7 days
  });
};

const setRefreshTokenCookie = (res, refreshToken) => {
  res.cookie('jwt', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'CUSTOMER',
    });

    if (user) {
      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);
      
      setRefreshTokenCookie(res, refreshToken);

      res.status(201).json({
        success: true,
        accessToken,
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);
      
      setRefreshTokenCookie(res, refreshToken);

      res.json({
        success: true,
        accessToken,
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Refresh Token
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized, no refresh token' });
    }

    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    
    // Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
    }

    // Issue new access token
    const accessToken = generateAccessToken(user._id);
    
    res.json({
      success: true,
      accessToken
    });
  } catch (error) {
    console.error(error);
    res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

// @desc    Logout User
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    if (user) {
      res.json({
        success: true,
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { registerUser, loginUser, refreshToken, logoutUser, getUserProfile };
