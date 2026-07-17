import express from 'express';
import { analyzeHeaders } from '../controllers/toolController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/analyze', protect, analyzeHeaders);

export default router;
