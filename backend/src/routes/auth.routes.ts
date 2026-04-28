import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { verifyToken } from '../middleware/auth';

const router = Router();

// POST /api/auth/register  — Borrower self-registration
router.post('/register', AuthController.register);

// POST /api/auth/login     — Login for all roles
router.post('/login', AuthController.login);

// GET /api/auth/me        — Get current user profile
router.get('/me', verifyToken, AuthController.getMe);

export default router;
