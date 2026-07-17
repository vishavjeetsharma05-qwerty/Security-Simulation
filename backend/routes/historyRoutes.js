import express from 'express';
import {
  getUserHistory,
  deleteHistoryItem,
  restoreHistoryItem,
  permanentDeleteHistoryItem
} from '../controllers/historyController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getUserHistory);
router.delete('/:id', protect, deleteHistoryItem);
router.post('/:id/restore', protect, restoreHistoryItem);
router.delete('/:id/permanent', protect, permanentDeleteHistoryItem);

export default router;
