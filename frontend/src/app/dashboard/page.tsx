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
        <div className="space-y-8">
            <div className="animate-pulse">
                <div className="h-10 bg-gray-200 rounded w-80 mb-3"></div>
                <div className="h-5 bg-gray-200 rounded w-96"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border-2 border-gray-100">
                        <div className="skeleton h-5 w-28 mb-4"></div>
                        <div className="skeleton h-10 w-36"></div>
                    </div>
                ))}
            </div>
        </div>
    );
    if (!stats) return (
        <div className="text-center py-16 animate-fade-in">
            <div className="text-red-500 text-xl font-semibold">Failed to load data.</div>
            <p className="text-gray-500 mt-3 text-base">Please try refreshing the page.</p>
        </div>
    );

    const cards = [
        {
            label: "Today's Sales",
            value: stats.todaySales,
            prefix: 'Rs. ',
            icon: DollarSign,
            gradient: 'from-blue-500 to-blue-600',
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600'
        },
        {
            label: "Today's Profit",
            value: stats.todayProfit,
            prefix: 'Rs. ',
            icon: DollarSign,
            gradient: 'from-emerald-500 to-emerald-600',
            iconBg: 'bg-emerald-100',
            iconColor: 'text-emerald-600'
        },
        {
            label: 'Total Sales',
            value: stats.totalSalesRetail + stats.totalSalesWholesale,
            prefix: 'Rs. ',
            icon: DollarSign,
            gradient: 'from-purple-500 to-purple-600',
            iconBg: 'bg-purple-100',
            iconColor: 'text-purple-600'
        },
        {
            label: 'Low Stock Alerts',
            value: stats.lowStockProducts,
            icon: AlertTriangle,
            gradient: 'from-orange-500 to-orange-600',
            iconBg: 'bg-orange-100',
            iconColor: 'text-orange-600'
        },
        {
            label: 'Expiring Soon',
            value: stats.expiringSoon,
            icon: Clock,
            gradient: 'from-red-500 to-red-600',
            iconBg: 'bg-red-100',
            iconColor: 'text-red-600'
        },
    ];

    const salesData = [
        { name: 'Retail', value: stats.totalSalesRetail },
        { name: 'Wholesale', value: stats.totalSalesWholesale },
    ];

    const COLORS = ['#10b981', '#3b82f6'];

    return (
        <div className="space-y-8 pb-8">
            <div className="animate-slide-in-left">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
                <p className="text-base sm:text-lg text-gray-600">Welcome back! Here's what's happening with your store today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
                {cards.map((card, idx) => (
                    <div
                        key={idx}
                        className={`bg-gradient-to-br ${card.gradient} p-6 rounded-2xl shadow-lg border-2 border-white/20 card-hover animate-slide-up stagger-${Math.min(idx + 1, 5)} backdrop-blur-sm`}
                    >
                        <div className="flex flex-col gap-3">
                            <div className={`${card.iconBg} p-3 rounded-xl w-fit`}>
                                <card.icon className={`${card.iconColor} w-6 h-6`} />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white/90 uppercase tracking-wide mb-1">{card.label}</p>
                                <h3 className="text-3xl sm:text-4xl font-bold text-white">
                                    {card.prefix}{card.value.toLocaleString()}
                                </h3>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border-2 border-gray-100 card-hover animate-scale-in">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Sales Distribution</h3>
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
                        <div className="flex justify-center gap-6 mt-4">
                            {salesData.map((entry, index) => (
                                <div key={index} className="flex items-center gap-2 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                                    <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: COLORS[index] }} />
                                    <span className="text-base font-medium text-gray-700">{entry.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Placeholder for Profit Trend */}
                <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border-2 border-gray-100 card-hover animate-scale-in" style={{ animationDelay: '0.1s' }}>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Profit Trend (Monthly)</h3>
                    <div className="h-64 flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
                        <div className="text-center">
                            <Package className="w-16 h-16 mx-auto mb-3 text-gray-300" />
                            <p className="text-base font-medium text-gray-500">Chart data not yet available</p>
                            <p className="text-sm mt-2 text-gray-400">Coming soon...</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
