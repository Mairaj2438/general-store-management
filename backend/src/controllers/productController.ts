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
    quantity: z.number().int().min(0),
    expiryDate: z.string().optional().transform((str) => str ? new Date(str) : null), // Accept ISO string
    batchNumber: z.string().optional(),
});

export const getProducts = async (req: Request, res: Response) => {
    try {
        const products = await prisma.product.findMany({
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
        if (!product) {
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

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };
        await prisma.product.delete({ where: { id } });
        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(400).json({ error: 'Failed to delete product' });
    }
};
