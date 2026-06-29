const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  refreshToken, 
  logoutUser, 
  getUserProfile,
  updateProfile,
  updatePassword,
  updateAddress,
  updateNewsletter
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh', refreshToken);
router.post('/logout', logoutUser);
router.get('/me', protect, getUserProfile);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, updatePassword);
router.put('/address', protect, updateAddress);
router.put('/newsletter', protect, updateNewsletter);

module.exports = router;
