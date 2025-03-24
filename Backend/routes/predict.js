import express from 'express';
import multer from 'multer';
import { predict, fetchFromDatabase } from '../controllers/predictController.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Apply file upload middleware only for CSV upload
router.post('/', predict);
router.get('/database', fetchFromDatabase); // Fix the route path

export default router;
