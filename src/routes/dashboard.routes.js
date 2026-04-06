import express from 'express'
import { getSummary, getCategoryTotals, getTrends } from '../controllers/dashboard.controllers.js'
import { authenticateToken } from '../middleware/auth.middleware.js'
import { authorizeRoles } from '../middleware/role.middleware.js'

const router = express.Router()

router.get('/summary', authenticateToken, authorizeRoles('ADMIN', 'ANALYST'), getSummary)
router.get('/category-totals', authenticateToken, authorizeRoles('ADMIN', 'ANALYST'), getCategoryTotals)
router.get('/trends', authenticateToken, authorizeRoles('ADMIN', 'ANALYST'), getTrends)

export default router;