import { Router } from 'express';
import { SanctionController } from '../controllers/sanction.controller';
import { verifyToken } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();

// All sanction routes require SANCTION or ADMIN role
router.use(verifyToken, authorize(['SANCTION', 'ADMIN']));

// GET  /api/sanction/pending      — All PENDING loan applications
router.get('/pending', SanctionController.getPendingLoans);

// POST /api/sanction/action       — Approve or Reject a loan
// Body: { loanId, action: 'APPROVE' | 'REJECT', reason? }
router.post('/action', SanctionController.approveOrReject);

export default router;
