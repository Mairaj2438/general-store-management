import { Router } from 'express';
import { getDashboardStats } from '../controllers/statsController';
import { createCustomer, getCustomers, updateCustomer, deleteCustomer, addPayment, getCustomerLedger, getSavedProducts, addSavedProduct, removeSavedProduct } from '../controllers/customerController';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';

const statsRouter = Router();
statsRouter.get('/dashboard', authenticate, getDashboardStats);

const customerRouter = Router();
customerRouter.post('/', authenticate, createCustomer);
customerRouter.get('/', authenticate, getCustomers);
customerRouter.put('/:id', authenticate, updateCustomer);
customerRouter.delete('/:id', authenticate, deleteCustomer);
customerRouter.post('/:id/payment', authenticate, addPayment);
customerRouter.get('/:id/ledger', authenticate, getCustomerLedger);
customerRouter.get('/:id/saved-products', authenticate, getSavedProducts);
customerRouter.post('/:id/saved-products', authenticate, addSavedProduct);
customerRouter.delete('/saved-products/:savedId', authenticate, removeSavedProduct);

export { statsRouter, customerRouter };
