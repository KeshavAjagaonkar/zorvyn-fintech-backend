import express from 'express'
import { getRecords, getRecordById, createRecord, updateRecord, deleteRecord } from '../controllers/record.controllers.js'
import { authenticateToken } from '../middleware/auth.middleware.js'
import { authorizeRoles } from '../middleware/role.middleware.js'

const router = express.Router()

// All roles can view records
router.get('/', authenticateToken, authorizeRoles('ADMIN', 'ANALYST', 'VIEWER'), getRecords)
router.get('/:id', authenticateToken, authorizeRoles('ADMIN', 'ANALYST', 'VIEWER'), getRecordById)

// Only admin can create, update, delete
router.post('/', authenticateToken, authorizeRoles('ADMIN'), createRecord)
router.patch('/:id', authenticateToken, authorizeRoles('ADMIN'), updateRecord)
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN'), deleteRecord)

export default router