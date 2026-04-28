import { Router } from 'express';
import { DisbursementController } from '../controllers/disbursement.controller';
import { verifyToken } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();

// All disbursement routes require DISBURSEMENT or ADMIN role
router.use(verifyToken, authorize(['DISBURSEMENT', 'ADMIN']));

// GET  /api/disbursement/approved   — All APPROVED loans awaiting disbursement
router.get('/approved', DisbursementController.getApprovedLoans);

// POST /api/disbursement/disburse   — Mark a loan as DISBURSED
// Body: { loanId }
router.post('/disburse', DisbursementController.disburseLoan);

export default router;
