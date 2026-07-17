import express from 'express';
import {
  getDefenses,
  toggleDefense,
  runScan,
  runExploit,
  fixVulnerability,
  getSimulationStats
} from '../controllers/simulationController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/defenses', protect, getDefenses);
router.post('/toggle-defense', protect, toggleDefense);
router.post('/scan', protect, runScan);
router.post('/exploit', protect, runExploit);
router.post('/fix', protect, fixVulnerability);
router.get('/stats', protect, getSimulationStats);

export default router;
