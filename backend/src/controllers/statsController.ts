import { Request, Response } from 'express';
import { prisma } from '../app';

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const totalProducts = await prisma.product.count();
        const lowStockProducts = await prisma.product.count({
            where: { quantity: { lte: 10 } }, // Low stock threshold 10
        });

        // Expiring soon (next 30 days)
        const next30Days = new Date();
        next30Days.setDate(next30Days.getDate() + 30);

        const expiringSoon = await prisma.product.count({
            where: {
                expiryDate: {
                    lte: next30Days
                    // Removed gte: new Date() to include already expired items
                },
            },
        });

        // Sales Stats (This is heavy, ideally cache or aggregate)
        const sales = await prisma.sale.findMany({
            include: { items: true },
        });

        let totalSalesRetail = 0;
        let totalSalesWholesale = 0;
        let totalProfit = 0;

        // This loop is O(N) on sales, might need optimizing for production with thousands of sales
        // But for "Initial MVP", this is fine.
        // Better way: aggregate with groupBy if using SQL, but with profit stored per item, simple sum works.

        // Date ranges
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // Calculate Today's Stats
        let todaySales = 0;
        let todayProfit = 0;

        // Loop for aggregations
        for (const sale of sales) {
            const saleTotal = sale.totalAmount;

            // All time totals
            if (sale.saleType === 'RETAIL') totalSalesRetail += saleTotal;
            else totalSalesWholesale += saleTotal;

            // Profit loop
            let saleProfit = 0;
            for (const item of sale.items) {
                saleProfit += item.profit;
            }
            totalProfit += saleProfit;

            // Today's checks
            if (new Date(sale.date) >= startOfDay) {
                todaySales += saleTotal;
                todayProfit += saleProfit;
            }
        }

        res.json({
            totalProducts,
            lowStockProducts,
            expiringSoon,
            totalSalesRetail,
            totalSalesWholesale,
            totalProfit,
            todaySales,
            todayProfit
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
};
