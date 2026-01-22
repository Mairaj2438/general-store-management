import { Request, Response } from 'express';
import { prisma } from '../app';
import { z } from 'zod';

const productSchema = z.object({
    name: z.string().min(1),
    category: z.string().min(1),
    barcode: z.string().optional(),
    purchasePrice: z.number().min(0),
    retailPrice: z.number().min(0),
    wholesalePrice: z.number().min(0),
    quantity: z.number().min(0),
    expiryDate: z.string().optional().transform((str) => str ? new Date(str) : null), // Accept ISO string
    batchNumber: z.string().optional(),
});

export const getProducts = async (req: Request, res: Response) => {
    try {
        const products = await prisma.product.findMany({
            where: { deletedAt: null },
            orderBy: { createdAt: 'desc' },
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
};

export const getProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params as { id: string };
        const product = await prisma.product.findUnique({ where: { id } });
        if (!product || product.deletedAt) {
            res.status(404).json({ error: 'Product not found' });
            return;
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch product' });
    }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = productSchema.parse(req.body);

        // Check barcode uniqueness if provided
        if (data.barcode) {
            const existing = await prisma.product.findUnique({ where: { barcode: data.barcode } });
            if (existing) {
                // Determine if the existing product is active or deleted
                // (Optional: You could check existing.deletedAt here to give a specific message)
                res.status(400).json({ error: 'Barcode already exists' });
                return;
            }
        }

        const product = await prisma.product.create({ data });
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid data' });
    }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params as { id: string };
        const data = productSchema.parse(req.body);

        const product = await prisma.product.update({
            where: { id },
            data,
        });
        res.json(product);
    } catch (error) {
        res.status(400).json({ error: 'Failed to update product' });
    }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params as { id: string };

        // Use transaction to clean up dependencies
        await prisma.$transaction(async (tx) => {
            // 1. Remove from any customer's "Saved For Later" list (Safe to remove)
            await tx.savedProduct.deleteMany({
                where: { productId: id }
            });

            // 2. Soft Delete the product (Set deletedAt)
            // This preserves Sales History relationship
            await tx.product.update({
                where: { id },
                data: { deletedAt: new Date() }
            });
        });

        res.json({ message: 'Product deleted successfully' });
    } catch (error: any) {
        console.error('Delete Product Error:', error);
        res.status(400).json({ error: error.message || 'Failed to delete product' });
    }
};
