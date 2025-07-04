import express from 'express';
import { createPackage, getPackageById,updatePackage,deletePackage,getAllPackages } from '../controllers/package.controller.js';
import { checkRole } from '../middleware/auth.middleware.js';
const router = express.Router();


router.get('/', getAllPackages);
router.get('/:id', getPackageById);
router.post('/', checkRole('admin'), createPackage);
router.put('/:id', checkRole('admin'), updatePackage);
router.delete('/:id', checkRole('admin'), deletePackage);

export default router;

