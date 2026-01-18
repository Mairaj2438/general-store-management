import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import saleRoutes from './routes/saleRoutes';
import { statsRouter, customerRouter } from './routes/miscRoutes';

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/stats', statsRouter);
app.use('/api/customers', customerRouter);

// Routes Information
app.get('/', (req, res) => {
    res.json({ message: 'General Store Management API is running' });
});

export default app;
