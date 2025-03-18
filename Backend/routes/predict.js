import express from 'express';
import { predict } from '../controllers/predictController.js';

const router = express.Router();
router.post('/', predict);

export default router;
