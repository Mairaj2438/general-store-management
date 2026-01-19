"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import {
    DollarSign,
    Package,
    AlertTriangle,
    Clock
} from 'lucide-react';

interface DashboardStats {
    totalProducts: number;
    lowStockProducts: number;
    expiringSoon: number;
    totalSalesRetail: number;
    totalSalesWholesale: number;
    todaySales: number;
    todayProfit: number;
    totalProfit: number;
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/stats/dashboard');
                setStats(data);
            } catch (error) {
                console.error("Failed to load stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return (
        <div className="space-y-6">
            <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-96"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                        <div className="skeleton h-4 w-24 mb-3"></div>
                        <div className="skeleton h-8 w-32"></div>
                    </div>
                ))}
            </div>
        </div>
    );
    if (!stats) return (
        <div className="text-center py-12 animate-fade-in">
            <div className="text-red-500 text-lg font-semibold">Failed to load data.</div>
            <p className="text-gray-500 mt-2">Please try refreshing the page.</p>
        </div>
    );

    const cards = [
        { label: "Today's Sales", value: stats.todaySales, prefix: 'Rs. ', icon: DollarSign, color: 'bg-indigo-500' },
        { label: "Today's Profit", value: stats.todayProfit, prefix: 'Rs. ', icon: DollarSign, color: 'bg-emerald-500' },
        { label: 'Total Sales', value: stats.totalSalesRetail + stats.totalSalesWholesale, prefix: 'Rs. ', icon: DollarSign, color: 'bg-blue-500' },
        { label: 'Low Stock Alerts', value: stats.lowStockProducts, icon: AlertTriangle, color: 'bg-orange-500' },
        { label: 'Expiring Soon', value: stats.expiringSoon, icon: Clock, color: 'bg-red-500' },
    ];

    const salesData = [
        { name: 'Retail', value: stats.totalSalesRetail },
        { name: 'Wholesale', value: stats.totalSalesWholesale },
    ];

    const COLORS = ['#10b981', '#3b82f6'];

    return (
        <div className="space-y-6">
            <div className="animate-slide-in-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard Overview</h1>
                <p className="text-sm text-gray-500 mt-1">Welcome back! Here's what's happening with your store today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {cards.map((card, idx) => (
                    <div
                        key={idx}
                        className={`bg-white p-5 rounded-xl shadow-sm border border-gray-100 card-hover animate-slide-up stagger-${Math.min(idx + 1, 5)}`}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{card.label}</p>
                                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
                                    {card.prefix}{card.value.toLocaleString()}
                                </h3>
                            </div>
                            <div className={`p-3 rounded-lg ${card.color} bg-opacity-10 flex-shrink-0`}>
                                <card.icon className={`${card.color.replace('bg-', 'text-')} w-5 h-5 sm:w-6 sm:h-6`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 card-hover animate-scale-in">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Sales Distribution</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={salesData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {salesData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex justify-center gap-4 mt-2">
                            {salesData.map((entry, index) => (
                                <div key={index} className="flex items-center gap-2 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                                    <span className="text-sm text-gray-600">{entry.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Placeholder for Profit Trend or Recent Sales */}
                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 card-hover animate-scale-in" style={{ animationDelay: '0.1s' }}>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Profit Trend (Monthly)</h3>
                    <div className="h-64 flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg border-dashed border-2 border-gray-200">
                        <div className="text-center">
                            <p className="text-sm">Chart data not yet cached over time</p>
                            <p className="text-xs mt-1">Coming soon...</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
