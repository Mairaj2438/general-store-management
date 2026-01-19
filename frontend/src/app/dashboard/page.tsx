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
        <div className="space-y-12">
            <div className="animate-pulse space-y-5">
                <div className="h-14 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-3xl w-full max-w-lg"></div>
                <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-2xl w-full max-w-2xl"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-7">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="bg-white/90 backdrop-blur-2xl p-10 rounded-3xl shadow-2xl border-2 border-gray-100">
                        <div className="skeleton h-7 w-36 mb-8 rounded-2xl"></div>
                        <div className="skeleton h-14 w-44 rounded-2xl"></div>
                    </div>
                ))}
            </div>
        </div>
    );

    if (!stats) return (
        <div className="text-center py-24 animate-fade-in">
            <div className="bg-white/90 backdrop-blur-2xl rounded-3xl p-14 shadow-2xl border-2 border-gray-100 max-w-lg mx-auto">
                <div className="text-red-500 text-3xl font-black mb-5">Failed to load data</div>
                <p className="text-gray-600 text-xl font-medium">Please refresh the page to try again</p>
            </div>
        </div>
    );

    const cards = [
        {
            label: "Today's Sales",
            value: stats.todaySales,
            prefix: 'Rs. ',
            icon: DollarSign,
            gradient: 'from-blue-500 via-blue-600 to-indigo-600',
            iconBg: 'from-blue-400 to-blue-500',
            shadowColor: 'shadow-blue-500/30'
        },
        {
            label: "Today's Profit",
            value: stats.todayProfit,
            prefix: 'Rs. ',
            icon: DollarSign,
            gradient: 'from-emerald-500 via-emerald-600 to-teal-600',
            iconBg: 'from-emerald-400 to-emerald-500',
            shadowColor: 'shadow-emerald-500/30'
        },
        {
            label: 'Total Sales',
            value: stats.totalSalesRetail + stats.totalSalesWholesale,
            prefix: 'Rs. ',
            icon: DollarSign,
            gradient: 'from-purple-500 via-purple-600 to-pink-600',
            iconBg: 'from-purple-400 to-purple-500',
            shadowColor: 'shadow-purple-500/30'
        },
        {
            label: 'Low Stock Alerts',
            value: stats.lowStockProducts,
            icon: AlertTriangle,
            gradient: 'from-orange-500 via-orange-600 to-amber-600',
            iconBg: 'from-orange-400 to-orange-500',
            shadowColor: 'shadow-orange-500/30'
        },
        {
            label: 'Expiring Soon',
            value: stats.expiringSoon,
            icon: Clock,
            gradient: 'from-red-500 via-red-600 to-rose-600',
            iconBg: 'from-red-400 to-red-500',
            shadowColor: 'shadow-red-500/30'
        },
    ];

    const salesData = [
        { name: 'Retail', value: stats.totalSalesRetail },
        { name: 'Wholesale', value: stats.totalSalesWholesale },
    ];

    const COLORS = ['#10b981', '#3b82f6'];

    return (
        <div className="space-y-12 pb-12">
            {/* Header Section - Ultra Modern */}
            <div className="animate-slide-in-left space-y-4">
                <h1 className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 leading-tight">
                    Dashboard Overview
                </h1>
                <p className="text-xl sm:text-2xl text-gray-600 font-semibold">
                    Welcome back! Here's your store performance today
                </p>
            </div>

            {/* Stats Grid - Modern Glassmorphism Cards with Perfect Spacing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-7">
                {cards.map((card, idx) => (
                    <div
                        key={idx}
                        className={`group relative bg-gradient-to-br ${card.gradient} p-10 rounded-3xl shadow-2xl ${card.shadowColor} hover:shadow-3xl transition-all duration-500 card-hover animate-slide-up stagger-${Math.min(idx + 1, 5)} border-2 border-white/30 backdrop-blur-sm overflow-hidden`}
                    >
                        {/* Glassmorphism overlay */}
                        <div className="absolute inset-0 bg-white/10 backdrop-blur-3xl"></div>

                        {/* Content */}
                        <div className="relative z-10 space-y-6">
                            {/* Icon with modern shadow */}
                            <div className={`bg-gradient-to-br ${card.iconBg} p-5 rounded-2xl w-fit shadow-2xl group-hover:scale-110 transition-transform duration-300`}>
                                <card.icon className="w-8 h-8 text-white drop-shadow-2xl" />
                            </div>

                            {/* Text with better spacing */}
                            <div className="space-y-3">
                                <p className="text-sm font-black text-white/95 uppercase tracking-[0.15em] drop-shadow-lg">
                                    {card.label}
                                </p>
                                <h3 className="text-5xl sm:text-6xl font-black text-white drop-shadow-2xl leading-none">
                                    {card.prefix}{card.value.toLocaleString()}
                                </h3>
                            </div>
                        </div>

                        {/* Decorative gradient orb */}
                        <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                    </div>
                ))}
            </div>

            {/* Charts Section - Modern Floating Cards with Glassmorphism */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Sales Distribution */}
                <div className="bg-white/90 backdrop-blur-2xl p-10 sm:p-12 rounded-3xl shadow-2xl border-2 border-gray-100 card-hover animate-scale-in hover:shadow-3xl transition-all duration-500">
                    <div className="flex items-center gap-5 mb-10">
                        <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-xl">
                            <Package className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="text-3xl sm:text-4xl font-black text-gray-900">Sales Distribution</h3>
                    </div>

                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={salesData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={110}
                                    fill="#8884d8"
                                    paddingAngle={10}
                                    dataKey="value"
                                >
                                    {salesData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>

                        <div className="flex justify-center gap-10 mt-8">
                            {salesData.map((entry, index) => (
                                <div key={index} className="flex items-center gap-4 animate-fade-in bg-gray-50 px-6 py-4 rounded-2xl shadow-md hover:shadow-lg transition-shadow" style={{ animationDelay: `${index * 0.1}s` }}>
                                    <div className="w-6 h-6 rounded-full shadow-lg" style={{ backgroundColor: COLORS[index] }} />
                                    <span className="text-lg font-black text-gray-800">{entry.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Profit Trend Placeholder */}
                <div className="bg-white/90 backdrop-blur-2xl p-10 sm:p-12 rounded-3xl shadow-2xl border-2 border-gray-100 card-hover animate-scale-in hover:shadow-3xl transition-all duration-500" style={{ animationDelay: '0.1s' }}>
                    <div className="flex items-center gap-5 mb-10">
                        <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-xl">
                            <DollarSign className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="text-3xl sm:text-4xl font-black text-gray-900">Profit Trend</h3>
                    </div>

                    <div className="h-80 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl border-2 border-dashed border-gray-300">
                        <div className="text-center space-y-6">
                            <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-8 rounded-3xl w-fit mx-auto shadow-2xl">
                                <Package className="w-20 h-20 text-white" />
                            </div>
                            <p className="text-xl font-black text-gray-600">Chart Coming Soon</p>
                            <p className="text-base text-gray-500 font-medium">Historical data will appear here</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
