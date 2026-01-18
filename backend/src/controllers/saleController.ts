import { Request, Response } from 'express';
import { prisma } from '../app';
import { z } from 'zod';

const saleItemSchema = z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
});

const saleSchema = z.object({
    items: z.array(saleItemSchema).min(1),
    saleType: z.enum(['RETAIL', 'WHOLESALE']),
    customerId: z.string().optional(), // Required if Wholesale usually, but flexible
});

import { Prisma } from '@prisma/client';

export const createSale = async (req: Request, res: Response): Promise<void> => {
    try {
        const { items, saleType, customerId } = saleSchema.parse(req.body);

        if (saleType === 'WHOLESALE' && !customerId) {
            // Option to create wholesale sale without registered customer? Maybe cash wholesale. 
            // But requirements say "Wholesale buyers: Name, Shop name...".
            // Let's enforce customerId for now or allow null for "Walk-in Wholesale"?
            // Prompt says "Customers (Wholesale)...". I will enforce it for better data or warn.
            // Let's allow optional for flexibility but recommend it.
        }

        // Transaction to ensure stock and sales consistency
        const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            let totalAmount = 0;
            const saleItemsData = [];

            for (const item of items) {
                const product = await tx.product.findUnique({ where: { id: item.productId } });
                if (!product) {
                    throw new Error(`Product ${item.productId} not found`);
                }
                if (product.quantity < item.quantity) {
                    throw new Error(`Insufficient stock for ${product.name}`);
                }

                // Determine price
                const sellingPrice = saleType === 'WHOLESALE' ? product.wholesalePrice : product.retailPrice;
                const lineTotal = sellingPrice * item.quantity;
                const profit = (sellingPrice - product.purchasePrice) * item.quantity;

                totalAmount += lineTotal;

                // Deduct stock
                await tx.product.update({
                    where: { id: item.productId },
                    data: { quantity: product.quantity - item.quantity },
                });

                saleItemsData.push({
                    productId: item.productId,
                    quantity: item.quantity,
                    sellingPrice,
                    profit,
                    total: lineTotal,
                });
            }

            // Create Sale Record
            const sale = await tx.sale.create({
                data: {
                    saleType,
                    totalAmount,
                    customerId,
                    items: {
                        create: saleItemsData,
                    },
                },
                include: { items: true },
            });

            // Update Customer Balance if Wholesale (Credit)?? 
            // Requirement says "Invoice generation", "Balance".
            // If payment is not tracked here, we assume it adds to balance (Debit).
            // Or we can add "amountPaid". For simplicity, let's assume credit sale adds to balance.
            if (customerId && saleType === 'WHOLESALE') {
                // Assuming full credit for simplicity, or we should add 'paidAmount' to schema.
                // Let's add to balance.
                await tx.customer.update({
                    where: { id: customerId },
                    data: { balance: { increment: totalAmount } }
                });
            }

            return sale;
        });

        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ error: error instanceof Error ? error.message : 'Transaction failed' });
    }
};

export const getSales = async (req: Request, res: Response) => {
    try {
        const sales = await prisma.sale.findMany({
            include: { items: { include: { product: true } }, customer: true },
            orderBy: { date: 'desc' },
        });
        res.json(sales);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch sales' });
    }
};
