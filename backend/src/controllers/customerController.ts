import { Request, Response } from 'express';
import { prisma } from '../app';
import { z } from 'zod';

const customerSchema = z.object({
    name: z.string().min(1),
    shopName: z.string().optional(),
    phone: z.string().min(10), // Basic validation
    balance: z.number().default(0),
    category: z.string().default('REGULAR'),
});

export const createCustomer = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = customerSchema.parse(req.body);
        const customer = await prisma.customer.create({ data });
        res.status(201).json(customer);
    } catch (error) {
        res.status(400).json({ error: 'Failed to create customer' });
    }
};

export const getCustomers = async (req: Request, res: Response) => {
    try {
        const customers = await prisma.customer.findMany({ orderBy: { name: 'asc' } });
        res.json(customers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch customers' });
    }
};

export const updateCustomer = async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };
        const { name, shopName, phone, category } = req.body;
        const customer = await prisma.customer.update({
            where: { id },
            data: { name, shopName, phone, category },
        });
        res.json(customer);
    } catch (error) {
        res.status(400).json({ error: 'Failed to update customer' });
    }
};

export const addPayment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params as { id: string };
        const { amount } = z.object({ amount: z.number().positive() }).parse(req.body);

        // Fetch current balance to validate
        const customer = await prisma.customer.findUnique({ where: { id } });
        if (!customer) {
            res.status(404).json({ error: 'Customer not found' });
            return;
        }

        // Prevent overpayment (No advance payments allowed)
        // Check if amount is greater than balance (using a small epsilon for float precision if needed, but direct comparison is usually fine for this rule)
        if (amount > customer.balance) {
            res.status(400).json({ error: `Cannot accept payment (Rs. ${amount}) greater than due amount (Rs. ${customer.balance})` });
            return;
        }

        // Transaction: Create Payment record AND update Balance
        await prisma.$transaction([
            prisma.payment.create({
                data: {
                    amount,
                    customerId: id,
                    notes: 'Payment received'
                }
            }),
            prisma.customer.update({
                where: { id },
                data: { balance: { decrement: amount } },
            })
        ]);

        res.json({ message: 'Payment recorded' });
    } catch (error: any) {
        res.status(400).json({ error: error.message || 'Failed to record payment' });
    }
};

export const getCustomerLedger = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params as { id: string };

        const customer = await prisma.customer.findUnique({
            where: { id },
            include: {
                sales: {
                    include: { items: { include: { product: true } } }
                },
                payments: true
            }
        });

        if (!customer) {
            res.status(404).json({ error: 'Customer not found' });
            return;
        }

        // Combine and Sort
        const ledger = [
            ...customer.sales.map((s: any) => ({
                id: s.id,
                date: s.date,
                type: 'SALE',
                description: `Sale - Invoice #${s.id.slice(-6).toUpperCase()}`,
                amount: s.totalAmount, // Debit (Increases Balance)
                items: s.items.map((i: any) => ({
                    name: i.product.name,
                    quantity: i.quantity,
                    price: i.sellingPrice,
                    total: i.total
                }))
            })),
            ...customer.payments.map((p: any) => ({
                id: p.id,
                date: p.date,
                type: 'PAYMENT',
                description: 'Payment Received',
                amount: p.amount, // Credit (Decreases Balance)
                items: []
            }))
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        res.json({ customer, ledger });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch ledger' });
    }
};

export const getSavedProducts = async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };
        const saved = await prisma.savedProduct.findMany({
            where: { customerId: id },
            include: { product: true }
        });
        res.json(saved);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch saved products' });
    }
};

export const addSavedProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };
        const { productId, quantity } = z.object({
            productId: z.string(),
            quantity: z.number().positive().default(1)
        }).parse(req.body);

        const saved = await prisma.savedProduct.create({
            data: { customerId: id, productId, quantity }
        });
        res.status(201).json(saved);
    } catch (error) {
        res.status(400).json({ error: 'Failed to save product' });
    }
};

export const removeSavedProduct = async (req: Request, res: Response) => {
    try {
        const { savedId } = req.params as { savedId: string };
        await prisma.savedProduct.delete({ where: { id: savedId } });
        res.json({ message: 'Removed from saved products' });
    } catch (error) {
        res.status(400).json({ error: 'Failed to remove product' });
    }
};

export const deleteCustomer = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params as { id: string };

        await prisma.$transaction(async (tx) => {
            // 1. Delete Saved Products
            await tx.savedProduct.deleteMany({ where: { customerId: id } });

            // 2. Delete Payments (Financial record removal)
            await tx.payment.deleteMany({ where: { customerId: id } });

            // 3. Unlink Sales (Keep sales history but remove customer reference)
            // Note: Schema says customerId String?, so it's nullable.
            await tx.sale.updateMany({
                where: { customerId: id },
                data: { customerId: null }
            });

            // 4. Delete Customer
            await tx.customer.delete({ where: { id } });
        });

        res.json({ message: 'Customer deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: 'Failed to delete customer' });
    }
};
