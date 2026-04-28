import { Router } from 'express';
import { SalesController } from '../controllers/sales.controller';
import { verifyToken } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();

// All sales routes require SALES or ADMIN role
router.use(verifyToken, authorize(['SALES', 'ADMIN']));

// GET /api/sales/leads                     — All borrowers who haven't applied yet
router.get('/leads', SalesController.getLeads);

// GET /api/sales/borrower/:borrowerId      — Full profile + loan history of a borrower
router.get('/borrower/:borrowerId', SalesController.getBorrowerProfile);

export default router;
