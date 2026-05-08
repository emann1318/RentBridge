import express from 'express';
import { getWallet, deposit, withdraw, transfer } from '../controllers/walletController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getWallet);
router.post('/deposit', deposit);
router.post('/withdraw', withdraw);
router.post('/transfer', transfer);

export default router;
