import { Request, Response } from 'express';
import { prisma } from '../app';
import { z } from 'zod';

const customerSchema = z.object({
    name: z.string().min(1),
    shopName: z.string().optional(),
    phone: z.string().min(10), // Basic validation
    balance: z.number().default(0),
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
        const { name, shopName, phone } = req.body;
        const customer = await prisma.customer.update({
            where: { id },
            data: { name, shopName, phone },
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
    } catch (error) {
        res.status(400).json({ error: 'Failed to record payment' });
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
                description: `Sale (Items: ${s.items.length})`,
                amount: s.totalAmount, // Debit (Increases Balance)
                items: s.items.map((i: any) => `${i.product.name} x${i.quantity}`).join(', ')
            })),
            ...customer.payments.map((p: any) => ({
                id: p.id,
                date: p.date,
                type: 'PAYMENT',
                description: 'Payment Received',
                amount: p.amount, // Credit (Decreases Balance)
                items: '-'
            }))
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        res.json({ customer, ledger });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch ledger' });
    }
};
