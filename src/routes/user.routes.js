import express from 'express'
import { getAllUsers, getUserById, createUser, updateUser, deleteUser } from '../controllers/user.controllers.js'
import { authenticateToken } from '../middleware/auth.middleware.js'
import { authorizeRoles } from '../middleware/role.middleware.js'

const router = express.Router()


router.get('/', authenticateToken, authorizeRoles('ADMIN'), getAllUsers)
router.get('/:id', authenticateToken, authorizeRoles('ADMIN'), getUserById)
router.post('/', authenticateToken, authorizeRoles('ADMIN'), createUser)
router.patch('/:id', authenticateToken, authorizeRoles('ADMIN'), updateUser)
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN'), deleteUser)

export default router