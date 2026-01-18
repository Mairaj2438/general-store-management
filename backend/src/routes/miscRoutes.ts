import { Router } from 'express';
import { getDashboardStats } from '../controllers/statsController';
import { createCustomer, getCustomers, updateCustomer, addPayment, getCustomerLedger } from '../controllers/customerController';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';

const statsRouter = Router();
statsRouter.get('/dashboard', authenticate, getDashboardStats);

const customerRouter = Router();
customerRouter.post('/', authenticate, createCustomer);
customerRouter.get('/', authenticate, getCustomers);
customerRouter.put('/:id', authenticate, updateCustomer);
customerRouter.post('/:id/payment', authenticate, addPayment);
customerRouter.get('/:id/ledger', authenticate, getCustomerLedger);

export { statsRouter, customerRouter };
