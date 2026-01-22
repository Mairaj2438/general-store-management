"use client";

import { useState, useEffect, useMemo } from 'react';
import api from '@/lib/api';
import {
    Search,
    ShoppingCart,
    Trash2,
    User,
    Printer,
    CreditCard
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Product {
    id: string;
    name: string;
    barcode: string;
    retailPrice: number;
    wholesalePrice: number;
    quantity: number;
}

interface CartItem extends Product {
    cartQuantity: number;
    sellByAmount?: boolean;
    targetAmount?: number;
}

interface Customer {
    id: string;
    name: string;
    phone: string;
    balance: number;
}

export default function SalesPage() {
    const [mode, setMode] = useState<'RETAIL' | 'WHOLESALE'>('RETAIL');
    const [products, setProducts] = useState<Product[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [search, setSearch] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<string>('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchProducts();
        fetchCustomers();
    }, [mode]);

    const fetchProducts = async () => {
        try {
            const { data } = await api.get('/products');
            setProducts(data);
        } catch (error) {
            toast.error('Failed to load products');
        }
    };

    const fetchCustomers = async () => {
        try {
            const { data } = await api.get('/customers');
            setCustomers(data);
        } catch (error) {
            toast.error('Failed to load customers');
        }
    };

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                if (existing.cartQuantity >= product.quantity) {
                    toast.warning('Not enough stock!');
                    return prev;
                }
                return prev.map(item => item.id === product.id ? { ...item, cartQuantity: item.cartQuantity + 1 } : item);
            }
            if (product.quantity <= 0) {
                toast.error('Product out of stock!');
                return prev;
            }
            return [...prev, { ...product, cartQuantity: 1 }];
        });
    };

    const removeFromCart = (id: string) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const updateQuantity = (id: string, qty: number) => {
        if (qty < 1) return;
        setCart(prev => {
            const item = prev.find(i => i.id === id);
            const original = products.find(p => p.id === id);
            if (item && original && qty > original.quantity) {
                toast.warning(`Only ${original.quantity} in stock`);
                return prev;
            }
            return prev.map(item => item.id === id ? { ...item, cartQuantity: qty } : item);
        });
    };

    const filteredProducts = useMemo(() => {
        if (!search) return [];
        return products.filter(p =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            (p.barcode && p.barcode.includes(search))
        ).slice(0, 5); // Limit suggestions
    }, [search, products]);

    // Handle barcode scannner (Enter key usually)
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && filteredProducts.length > 0) {
            addToCart(filteredProducts[0]);
            setSearch('');
        }
    };

    const grandTotal = cart.reduce((acc, item) => {
        if (item.sellByAmount) return acc + (item.targetAmount || 0);
        const price = mode === 'WHOLESALE' ? item.wholesalePrice : item.retailPrice;
        return acc + (price * item.cartQuantity);
    }, 0);

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        if (mode === 'WHOLESALE' && !selectedCustomer) {
            toast.error('Please select a customer for Wholesale');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                saleType: mode,
                customerId: selectedCustomer || undefined,
                items: cart.map(item => ({
                    productId: item.id,
                    quantity: item.sellByAmount ? ((item.targetAmount || 0) / (mode === 'WHOLESALE' ? item.wholesalePrice : item.retailPrice)) : item.cartQuantity
                }))
            };

            await api.post('/sales', payload);
            toast.success('Sale completed successfully!');

            // Print Invoice Logic could go here (window.print() or PDF gen)
            // reset
            setCart([]);
            setSelectedCustomer('');
            fetchProducts(); // refresh stock
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Checkout failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Mobile Spacer to prevent header overlap */}
            <div className="h-24 lg:hidden w-full col-span-1"></div>

            {/* Left Panel: Product Selection */}
            <div className="lg:col-span-2 flex flex-col gap-6">
                <div className="glass-card p-6 rounded-[2rem] shadow-sm border border-emerald-100/50">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Point of Sale (Live Updated)</h2>
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            <button
                                onClick={() => setMode('RETAIL')}
                                className={cn("px-4 py-2 rounded-md text-sm font-medium transition-all", mode === 'RETAIL' ? "bg-white text-emerald-600 shadow-sm" : "text-gray-500")}
                            >
                                Retail
                            </button>
                            <button
                                onClick={() => setMode('WHOLESALE')}
                                className={cn("px-4 py-2 rounded-md text-sm font-medium transition-all", mode === 'WHOLESALE' ? "bg-white text-blue-600 shadow-sm" : "text-gray-500")}
                            >
                                Wholesale
                            </button>
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Customer {mode === 'RETAIL' && '(Optional)'}</label>
                        <select
                            value={selectedCustomer}
                            onChange={(e) => setSelectedCustomer(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="">-- Choose Customer --</option>
                            {customers.map(c => (
                                <option key={c.id} value={c.id}>{c.name} (Balance: Rs. {c.balance})</option>
                            ))}
                        </select>
                    </div>

                    {/* Spacer Block */}
                    <div className="h-32"></div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            autoFocus
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-lg"
                            placeholder="Scan barcode or type product name..."
                        />

                        {/* Search Dropdown */}
                        {search && filteredProducts.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-10 overflow-hidden">
                                {filteredProducts.map(product => (
                                    <button
                                        key={product.id}
                                        onClick={() => { addToCart(product); setSearch(''); }}
                                        className="w-full text-left p-3 hover:bg-emerald-50 flex justify-between items-center border-b border-gray-50 last:border-0"
                                    >
                                        <div>
                                            <div className="font-medium text-gray-900">{product.name}</div>
                                            <div className="text-xs text-gray-500">Stock: {product.quantity}</div>
                                        </div>
                                        <div className="font-mono font-medium text-emerald-600">
                                            Rs. {mode === 'WHOLESALE' ? product.wholesalePrice : product.retailPrice}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Product Grid (Quick Access - Top Selling maybe? For now just empty or static list) */}
                {/* We can show all products if search is empty? No, too many. Leave blank or "Type to search" */}

            </div>

            {/* Right Panel: Cart */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 flex flex-col h-full overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-900 font-semibold">
                        <ShoppingCart size={20} />
                        <span>Current Sale</span>
                    </div>
                    <span className="text-sm text-gray-500">{cart.length} Items</span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
                            <ShoppingCart className="w-12 h-12 opacity-20" />
                            <p>Cart is empty</p>
                        </div>
                    ) : (
                        cart.map((item: any) => {
                            const price = mode === 'WHOLESALE' ? item.wholesalePrice : item.retailPrice;
                            return (
                                <div key={item.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 group">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-900 line-clamp-1">{item.name}</h4>
                                            <p className="text-xs text-gray-500">Rate: Rs. {price}</p>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                        <div className="flex flex-col gap-3">
                                            {/* Control Bar */}
                                            <div className="flex items-center justify-between gap-2">
                                                <button
                                                    onClick={() => setCart((prev: any) => prev.map((p: any) => p.id === item.id ? { ...p, sellByAmount: !p.sellByAmount, targetAmount: p.sellByAmount ? 0 : price } : p))}
                                                    className={cn(
                                                        "flex-1 py-1.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border",
                                                        item.sellByAmount
                                                            ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                                                            : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                                                    )}
                                                >
                                                    {item.sellByAmount ? 'Mode: Amount (Rs)' : 'Mode: Quantity (Qty)'}
                                                </button>

                                                <div className="text-right min-w-[80px]">
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase">Total</p>
                                                    <p className="font-bold text-gray-900 text-lg leading-tight">
                                                        Rs. {item.sellByAmount ? (item.targetAmount || 0).toFixed(0) : (price * item.cartQuantity).toFixed(0)}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Input Area */}
                                            <div className="relative">
                                                {item.sellByAmount ? (
                                                    <div className="flex items-center">
                                                        <span className="absolute left-3 text-sm font-bold text-blue-400">Rs.</span>
                                                        <input
                                                            type="number"
                                                            value={item.targetAmount}
                                                            onChange={(e) => setCart((prev: any) => prev.map((p: any) => p.id === item.id ? { ...p, targetAmount: parseFloat(e.target.value) || 0 } : p))}
                                                            className="w-full pl-10 pr-4 py-2 bg-blue-50/50 border border-blue-200 rounded-xl font-bold text-blue-900 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                                            placeholder="Amount"
                                                            autoFocus
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => updateQuantity(item.id, item.cartQuantity - 0.5)} className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center font-bold text-gray-600 transition-colors">-</button>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={item.cartQuantity}
                                                            onChange={(e) => updateQuantity(item.id, parseFloat(e.target.value) || 0)}
                                                            className="flex-1 h-9 text-center bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold outline-none focus:border-emerald-500 focus:bg-white transition-all"
                                                        />
                                                        <button onClick={() => updateQuantity(item.id, item.cartQuantity + 0.5)} className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center font-bold text-gray-600 transition-colors">+</button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="p-6 bg-gray-50 border-t border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium text-gray-900">Rs. {grandTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-lg font-bold text-gray-900">Total</span>
                        <span className="text-2xl font-bold text-emerald-600">Rs. {grandTotal.toFixed(2)}</span>
                    </div>

                    <button
                        onClick={handleCheckout}
                        disabled={loading || cart.length === 0}
                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-900/10 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Processing...' : (
                            <>
                                <CreditCard size={20} />
                                Complete Sale
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
