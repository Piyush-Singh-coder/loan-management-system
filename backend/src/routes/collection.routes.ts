import { Router } from 'express';
import { CollectionController } from '../controllers/collection.controller';
import { verifyToken } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();

// All collection routes require COLLECTION or ADMIN role
router.use(verifyToken, authorize(['COLLECTION', 'ADMIN']));

// GET  /api/collection/active              — All DISBURSED (active) loans
router.get('/active', CollectionController.getActiveLoans);

// GET  /api/collection/payments/:loanId   — Payment history for a loan
router.get('/payments/:loanId', CollectionController.getPaymentHistory);

// POST /api/collection/payment            — Record a payment
// Body: { loanId, utrNumber, amount, paymentDate }
router.post('/payment', CollectionController.recordPayment);

export default router;
