import { Router } from 'express';
import { createSale, getSales } from '../controllers/saleController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.post('/', authenticate, createSale); // Staff can sell
router.get('/', authenticate, getSales); // Staff can view history? Yes.

export default router;
