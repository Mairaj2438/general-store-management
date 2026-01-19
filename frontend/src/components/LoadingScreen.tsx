"use client";

import { ShoppingBag } from 'lucide-react';

export default function LoadingScreen() {
    return (
        <div className="fixed inset-0 bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 flex items-center justify-center z-[10000]">
            {/* Animated background orbs */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

            <div className="relative text-center space-y-8">
                {/* Logo Animation */}
                <div className="relative inline-block">
                    {/* Pulsing ring */}
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full blur-2xl opacity-50 animate-ping"></div>

                    {/* Main logo */}
                    <div className="relative p-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full shadow-2xl">
                        <ShoppingBag className="w-20 h-20 text-white animate-bounce" />
                    </div>
                </div>

                {/* Store Name */}
                <div className="space-y-3">
                    <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
                        Al-Abbas General Store
                    </h1>
                    <p className="text-xl font-bold text-gray-700">Shahjamal</p>
                </div>

                {/* Loading Spinner */}
                <div className="flex items-center justify-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>

                <p className="text-base text-gray-500 font-medium">Loading your dashboard...</p>
            </div>
        </div>
    );
}
