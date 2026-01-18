import { Router } from 'express';
import { getProducts, getProduct, createProduct, updateProduct, deleteProduct } from '../controllers/productController';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

// Public read access? Maybe staff only.
// Requirements say "Staff (limited access)". Usually staff can sell, so they need to see products.
// Product Management (Add/Edit/Delete) is typically Admin or specific role.
// Let's allow Staff to VIEW, but only Admin to MANAGE.

router.get('/', authenticate, getProducts);
router.get('/:id', authenticate, getProduct);

router.post('/', authenticate, requireAdmin, createProduct);
router.put('/:id', authenticate, requireAdmin, updateProduct);
router.delete('/:id', authenticate, requireAdmin, deleteProduct);

export default router;
