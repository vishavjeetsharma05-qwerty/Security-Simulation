import express from 'express';
import multer from 'multer';
import fs from 'fs';
import {
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  getProfile,
  updateProfile,
  deleteAccount
} from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads', { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.get('/profile', protect, getProfile);
router.put('/profile', protect, upload.single('profilePicture'), updateProfile);
router.post('/change-password', protect, changePassword);
router.delete('/delete-account', protect, deleteAccount);

export default router;
