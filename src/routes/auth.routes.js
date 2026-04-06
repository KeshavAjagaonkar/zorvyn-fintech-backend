import express from 'express';

import { loginUser, changePassword } from "../controllers/auth.controllers.js";
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/login', loginUser);
router.patch('/change-password', authenticateToken, changePassword)

export default router;