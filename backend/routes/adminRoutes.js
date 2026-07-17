import express from 'express';
import {
  getAnalytics,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getSystemLogs,
  deleteLogItem
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/analytics', protect, adminOnly, getAnalytics);
router.get('/users', protect, adminOnly, getAllUsers);
router.post('/update-role', protect, adminOnly, updateUserRole);
router.delete('/user/:userId', protect, adminOnly, deleteUser);
router.get('/logs', protect, adminOnly, getSystemLogs);
router.delete('/log/:logId', protect, adminOnly, deleteLogItem);

export default router;
