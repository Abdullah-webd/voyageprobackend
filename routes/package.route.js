import express from 'express';
import { createPackage, getPackageById,updatePackage,deletePackage,getAllPackages } from '../controllers/package.controller.js';
import { checkRole } from '../middleware/auth.middleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
const router = express.Router();

router.get('/', getAllPackages);
router.get('/:id', getPackageById);
router.post('/',authMiddleware, adminMiddleware, createPackage);
router.put('/:id', authMiddleware, adminMiddleware, updatePackage);
router.delete('/:id', authMiddleware, adminMiddleware, deletePackage);

export default router;

