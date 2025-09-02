import { Router } from 'express';
import { requireAuth, requireRole } from '../../middlewares/auth.js';
import { meController, listController,createController,previewUploadController, bulkImportController } from './user.controller.js';
import { upload } from './user.upload.js';

const router = Router();

router.get('/me', requireAuth, meController);
router.get('/', requireAuth, requireRole('ADMIN'), listController);
router.post('/', requireAuth, requireRole('ADMIN'), createController);
router.post('/upload/preview', requireAuth, requireRole('ADMIN'), upload.single('file'), previewUploadController);
router.post('/upload/bulk', requireAuth, requireRole('ADMIN'), bulkImportController);

export default router;
