import { Router } from 'express';
import { BorrowerController } from '../controllers/borrower.controller';
import { verifyToken } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { upload } from '../middleware/upload';

const router = Router();

// All borrower routes are protected and require BORROWER role
router.use(verifyToken, authorize(['BORROWER']));

// Step 2: Submit personal details — triggers BRE
// POST /api/borrower/personal-details
router.post('/personal-details', BorrowerController.submitPersonalDetails);

// Step 3: Upload salary slip to Cloudinary
// POST /api/borrower/upload-slip
router.post('/upload-slip', upload.single('salarySlip'), BorrowerController.uploadSalarySlip);

// Step 4: Submit final loan application
// POST /api/borrower/apply
router.post('/apply', BorrowerController.applyForLoan);

// GET /api/borrower/loans — View own loan history
router.get('/loans', BorrowerController.getMyLoans);

export default router;
