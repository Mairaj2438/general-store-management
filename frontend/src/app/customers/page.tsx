"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import {
    Plus, Search, User, Phone, Store, Receipt,
    Download, ShoppingBag, History, CreditCard,
    Filter, X, Check, Trash2, Printer
} from 'lucide-react';
import { toast } from 'sonner';

export default function CustomersPage() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('ALL');

    // Modals
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [isLedgerOpen, setIsLedgerOpen] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);

    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [customerLedger, setCustomerLedger] = useState<any[]>([]);
    const [formData, setFormData] = useState({ name: '', shopName: '', phone: '', category: 'REGULAR' });
    const [paymentAmount, setPaymentAmount] = useState('');

    // Purchase Logic
    const [cart, setCart] = useState<any[]>([]);
    const [savedProducts, setSavedProducts] = useState<any[]>([]);
    const [prodSearch, setProdSearch] = useState('');

    const fetchCustomers = async () => {
        try {
            const { data } = await api.get('/customers');
            setCustomers(data);
        } catch (error) {
            toast.error('Failed to load customers');
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const { data } = await api.get('/products');
            setProducts(data);
        } catch (error) {
            console.error('Failed to load products');
        }
    };

    const fetchCustomerLedger = async (customerId: string) => {
        try {
            const { data } = await api.get(`/customers/${customerId}/ledger`);
            setCustomerLedger(data.ledger);
        } catch (error) {
            toast.error('Failed to load ledger');
        }
    };

    const fetchSavedProducts = async (customerId: string) => {
        try {
            const { data } = await api.get(`/customers/${customerId}/saved-products`);
            setSavedProducts(data);
        } catch (error) {
            console.error('Failed to load saved products');
        }
    };

    const toggleSavedProduct = async (product: any) => {
        if (!selectedCustomer) return;
        const existing = savedProducts.find(s => s.productId === product.id);
        try {
            if (existing) {
                await api.delete(`/customers/saved-products/${existing.id}`);
                setSavedProducts(prev => prev.filter(s => s.id !== existing.id));
                toast.success('Removed from saved list');
            } else {
                const { data } = await api.post(`/customers/${selectedCustomer.id}/saved-products`, { productId: product.id });
                setSavedProducts(prev => [...prev, { ...data, product }]);
                toast.success('Added to saved list');
            }
        } catch (error) {
            toast.error('Failed to update saved list');
        }
    };

    useEffect(() => {
        fetchCustomers();
        fetchProducts();
    }, []);

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post(`/customers/${selectedCustomer.id}/payment`, { amount: Number(paymentAmount) });
            toast.success('Payment recorded');
            setIsPaymentOpen(false);
            setPaymentAmount('');
            fetchCustomers();
        } catch (error) {
            toast.error('Failed to record payment');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (selectedCustomer) {
                await api.put(`/customers/${selectedCustomer.id}`, formData);
                toast.success('Customer updated');
            } else {
                await api.post('/customers', formData);
                toast.success('Customer added');
            }
            setIsFormOpen(false);
            setFormData({ name: '', shopName: '', phone: '', category: 'REGULAR' });
            setSelectedCustomer(null);
            fetchCustomers();
        } catch (error) {
            toast.error('Failed to save customer');
        }
    };

    const handleDeleteCustomer = async (id: string) => {
        if (confirm('Are you sure you want to delete this customer? This will remove all their saved products and history.')) {
            try {
                await api.delete(`/customers/${id}`);
                fetchCustomers();
                toast.success('Customer deleted successfully');
            } catch (error) {
                toast.error('Failed to delete customer');
            }
        }
    };

    const handleQuickPurchase = async () => {
        if (cart.length === 0) return;
        try {
            const saleData = {
                customerId: selectedCustomer.id,
                saleType: 'WHOLESALE', // Default for customer account sales
                items: cart.map(item => ({
                    productId: item.id,
                    quantity: item.sellByAmount ? (item.targetAmount / item.wholesalePrice) : item.cartQty
                }))
            };
            await api.post('/sales', saleData);
            toast.success('Purchase added to customer account');
            setIsPurchaseOpen(false);
            setCart([]);
            fetchCustomers();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to process purchase');
        }
    };

    const addToCart = (product: any) => {
        setCart(prev => {
            const existing = prev.find(p => p.id === product.id);
            if (existing) {
                return prev.map(p => p.id === product.id ? { ...p, cartQty: p.cartQty + 1 } : p);
            }
            return [...prev, { ...product, cartQty: 1 }];
        });
    };

    const removeFromCart = (id: string) => {
        setCart(prev => prev.filter(p => p.id !== id));
    };

    const updateCartQty = (id: string, qty: number) => {
        if (qty < 1) return;
        setCart(prev => prev.map(p => p.id === id ? { ...p, cartQty: qty } : p));
    };

    const totalCartAmount = cart.reduce((sum, item) => {
        if (item.sellByAmount) return sum + item.targetAmount;
        return sum + (item.wholesalePrice * item.cartQty);
    }, 0);

    const filtered = customers.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
            (c.shopName && c.shopName.toLowerCase().includes(search.toLowerCase())) ||
            c.phone.includes(search);
        const matchesCat = categoryFilter === 'ALL' || c.category === categoryFilter;
        return matchesSearch && matchesCat;
    });

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(prodSearch.toLowerCase()) ||
        p.category.toLowerCase().includes(prodSearch.toLowerCase())
    ).slice(0, 5);

    const getCategoryStyles = (cat: string) => {
        switch (cat) {
            case 'VIP': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'WHOLESALE': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const generateReceipt = (entry: any) => {
        const win = window.open('', '_blank');
        if (!win) return;

        const dateStr = new Date(entry.date).toLocaleString();
        const itemsHtml = entry.items.map((i: any) => `
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${i.name}</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${Number(i.quantity).toFixed(3)}</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">Rs. ${i.price.toFixed(2)}</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">Rs. ${i.total.toFixed(2)}</td>
            </tr>
        `).join('');

        win.document.write(`
            <html>
                <head>
                    <title>Invoice - ${entry.description}</title>
                    <style>
                        body { font-family: sans-serif; padding: 40px; color: #333; }
                        .header { text-align: center; margin-bottom: 40px; }
                        .store-name { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
                        .details { display: flex; justify-content: space-between; margin-bottom: 30px; }
                        table { width: 100%; border-collapse: collapse; }
                        th { background: #f9f9f9; padding: 10px; text-align: left; }
                        .total { text-align: right; margin-top: 30px; font-size: 20px; font-weight: bold; }
                        @media print { .no-print { display: none; } }
                    </style>
                </head>
                <body>
                    <div class="no-print" style="margin-bottom: 20px;">
                        <button onclick="window.print()" style="padding: 10px 20px; background: #059669; color: white; border: none; border-radius: 5px; cursor: pointer;">Print Receipt</button>
                    </div>
                    <div class="header">
                        <div class="store-name">AL-Abbas General Store</div>
                        <div>Customer Receipt</div>
                    </div>
                    <div class="details">
                        <div>
                            <strong>To:</strong><br/>
                            ${selectedCustomer.name}<br/>
                            ${selectedCustomer.shopName || ''}<br/>
                            ${selectedCustomer.phone}
                        </div>
                        <div>
                            <strong>Date:</strong> ${dateStr}<br/>
                            <strong>Invoice:</strong> ${entry.description}
                        </div>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th style="text-align: center;">Qty</th>
                                <th style="text-align: right;">Price</th>
                                <th style="text-align: right;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                    </table>
                    <div class="total">
                        Total Amount: Rs. ${entry.amount.toFixed(2)}
                    </div>
                    <div style="margin-top: 50px; text-align: center; color: #888; font-size: 12px;">
                        Thank you for your business!
                    </div>
                </body>
            </html>
        `);
        win.document.close();
    };

    return (
        <div className="space-y-6 pb-20">
            {/* Mobile Spacer to prevent header overlap */}
            <div className="h-24 lg:hidden w-full"></div>

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
                    <p className="text-gray-500">Manage your wholesale and regular clients</p>
                </div>
                <button
                    onClick={() => { setSelectedCustomer(null); setFormData({ name: '', shopName: '', phone: '', category: 'REGULAR' }); setIsFormOpen(true); }}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-lg hover:shadow-emerald-200"
                >
                    <Plus size={20} />
                    New Customer
                </button>
            </div>

            {/* Filters / Search - Added spacing */}
            <div className="flex flex-col sm:flex-row gap-4 mt-40">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name, shop, or phone..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm"
                    />
                </div>
                <div className="flex gap-2 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
                    {['ALL', 'REGULAR', 'WHOLESALE', 'VIP'].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategoryFilter(cat)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${categoryFilter === cat
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Customer Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <div key={i} className="h-48 bg-gray-100 animate-pulse rounded-2xl" />)}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map(customer => (
                        <div key={customer.id} className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-emerald-100 transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-50 to-blue-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner group-hover:from-emerald-100 group-hover:to-blue-100 transition-colors">
                                        <User size={28} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900">{customer.name}</h3>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${getCategoryStyles(customer.category)}`}>
                                            {customer.category}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setSelectedCustomer(customer);
                                        setFormData({ name: customer.name, shopName: customer.shopName || '', phone: customer.phone, category: customer.category });
                                        setIsFormOpen(true);
                                    }}
                                    className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                >
                                    <Filter size={18} />
                                </button>
                                <button
                                    onClick={() => handleDeleteCustomer(customer.id)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete Customer"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <Store size={16} className="text-gray-400" />
                                    <span>{customer.shopName || 'Individual Customer'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <Phone size={16} className="text-gray-400" />
                                    <span>{customer.phone}</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100">
                                <div className="flex justify-between items-end mb-4">
                                    <div>
                                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Due Balance</p>
                                        <p className={`text-2xl font-black ${customer.balance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                            Rs. {customer.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => { setSelectedCustomer(customer); setIsPaymentOpen(true); }}
                                            className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                            title="Record Payment"
                                        >
                                            <CreditCard size={20} />
                                        </button>
                                        <button
                                            onClick={() => { setSelectedCustomer(customer); setIsPurchaseOpen(true); fetchSavedProducts(customer.id); }}
                                            className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                            title="Add Purchase"
                                        >
                                            <ShoppingBag size={20} />
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={() => { setSelectedCustomer(customer); fetchCustomerLedger(customer.id); setIsLedgerOpen(true); }}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-gray-50 text-gray-600 font-semibold rounded-xl hover:bg-gray-900 hover:text-white transition-all"
                                >
                                    <History size={18} />
                                    Transaction History
                                </button>
                            </div>
                        </div>
                    ))}
                    {filtered.length === 0 && (
                        <div className="col-span-full py-20 text-center">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search size={40} className="text-gray-200" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">No customers found</h3>
                            <p className="text-gray-500">Try adjusting your search or filters</p>
                        </div>
                    )}
                </div>
            )}

            {/* NEW PURCHASE MODAL */}
            {isPurchaseOpen && selectedCustomer && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col md:flex-row max-h-[90vh] overflow-hidden">
                        {/* Left Side: Product Selection */}
                        <div className="flex-1 p-6 border-r border-gray-100 overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold">Add Items for {selectedCustomer.name}</h2>
                                <button onClick={() => setIsPurchaseOpen(false)} className="md:hidden p-2 text-gray-400 hover:bg-gray-100 rounded-full">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="relative mb-6">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={prodSearch}
                                    onChange={(e) => setProdSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>

                            {/* Saved Products Quick List */}
                            {savedProducts.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Saved Products</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {savedProducts.map(s => (
                                            <button
                                                key={s.id}
                                                onClick={() => addToCart(s.product)}
                                                className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-100 hover:bg-blue-600 hover:text-white transition-all"
                                            >
                                                + {s.product.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {filteredProducts.map(product => {
                                    const isSaved = savedProducts.some(s => s.productId === product.id);
                                    return (
                                        <div key={product.id} className="relative group">
                                            <button
                                                onClick={() => addToCart(product)}
                                                className="w-full p-4 bg-white border border-gray-100 rounded-xl text-left hover:border-emerald-500 hover:shadow-md transition-all"
                                            >
                                                <p className="font-bold text-gray-900 group-hover:text-emerald-600">{product.name}</p>
                                                <div className="flex justify-between items-center mt-2">
                                                    <p className="text-sm text-emerald-600 font-bold">Rs. {product.wholesalePrice.toFixed(2)}</p>
                                                    <p className="text-xs text-gray-400">Stock: {product.quantity}</p>
                                                </div>
                                            </button>
                                            <button
                                                onClick={() => toggleSavedProduct(product)}
                                                className={`absolute top-2 right-2 p-1.5 rounded-lg transition-all ${isSaved ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400 hover:bg-blue-50 hover:text-blue-600 opacity-0 group-hover:opacity-100'}`}
                                                title={isSaved ? "Remove from saved" : "Save for later"}
                                            >
                                                <Check size={14} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Right Side: Cart Summary */}
                        <div className="w-full md:w-80 bg-gray-50 p-6 flex flex-col">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-gray-900">Current Order</h3>
                                <button onClick={() => setIsPurchaseOpen(false)} className="hidden md:block p-2 text-gray-400 hover:bg-gray-100 rounded-full">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-4">
                                {cart.length === 0 ? (
                                    <div className="text-center py-10 opacity-50">
                                        <ShoppingBag size={40} className="mx-auto mb-2" />
                                        <p className="text-sm">Cart is empty</p>
                                    </div>
                                ) : cart.map(item => (
                                    <div key={item.id} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm relative group">
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="absolute -top-2 -right-2 bg-rose-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                        >
                                            <X size={12} />
                                        </button>
                                        <p className="text-sm font-bold truncate pr-4">{item.name}</p>
                                        <div className="flex flex-col gap-2 mt-2">
                                            <div className="flex items-center justify-between">
                                                <button
                                                    onClick={() => setCart(prev => prev.map(p => p.id === item.id ? { ...p, sellByAmount: !p.sellByAmount, targetAmount: p.wholesalePrice } : p))}
                                                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-colors ${item.sellByAmount ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'}`}
                                                >
                                                    {item.sellByAmount ? 'BY AMOUNT' : 'BY QTY'}
                                                </button>
                                                <p className="text-xs font-bold text-gray-700">
                                                    Rs. {item.sellByAmount ? Number(item.targetAmount).toFixed(2) : (item.wholesalePrice * item.cartQty).toFixed(2)}
                                                </p>
                                            </div>

                                            {item.sellByAmount ? (
                                                <div className="relative">
                                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">Rs.</span>
                                                    <input
                                                        type="number"
                                                        value={item.targetAmount}
                                                        onChange={(e) => setCart(prev => prev.map(p => p.id === item.id ? { ...p, targetAmount: Number(e.target.value) } : p))}
                                                        className="w-full pl-7 pr-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded focus:ring-1 focus:ring-emerald-500 outline-none"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => updateCartQty(item.id, item.cartQty - 0.5)} className="w-6 h-6 bg-gray-100 rounded hover:bg-gray-200 text-xs">-</button>
                                                    <span className="text-xs font-bold w-8 text-center">{item.cartQty}</span>
                                                    <button onClick={() => updateCartQty(item.id, item.cartQty + 0.5)} className="w-6 h-6 bg-gray-100 rounded hover:bg-gray-200 text-xs">+</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-6 border-t border-gray-200 mt-6">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-gray-500 font-medium">Subtotal</span>
                                    <span className="text-xl font-black text-gray-900">Rs. {totalCartAmount.toFixed(2)}</span>
                                </div>
                                <button
                                    onClick={handleQuickPurchase}
                                    disabled={cart.length === 0}
                                    className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-100"
                                >
                                    <Check size={20} />
                                    Complete Purchase
                                </button>
                                <p className="text-[10px] text-center text-gray-400 mt-2 uppercase font-bold tracking-widest">Adds to customer balance</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* LEDGER MODAL */}
            {isLedgerOpen && selectedCustomer && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900">{selectedCustomer.name}</h2>
                                <p className="text-sm text-gray-500 font-medium">{selectedCustomer.shopName || 'Ledger Statement'}</p>
                            </div>
                            <button onClick={() => setIsLedgerOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto flex-1 space-y-6">
                            {customerLedger.length === 0 ? (
                                <div className="text-center py-20">
                                    <Receipt size={48} className="mx-auto text-gray-200 mb-4" />
                                    <p className="text-gray-400 font-medium">No transaction history found</p>
                                </div>
                            ) : (
                                customerLedger.map((entry, idx) => (
                                    <div key={idx} className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex gap-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${entry.type === 'SALE' ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                    {entry.type === 'SALE' ? <ShoppingBag size={20} /> : <CreditCard size={20} />}
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-400 font-medium">{new Date(entry.date).toLocaleDateString()}</p>
                                                    <p className="font-bold text-gray-900">{entry.description}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-lg font-black ${entry.type === 'SALE' ? 'text-rose-600' : 'text-emerald-600'}`}>
                                                    {entry.type === 'SALE' ? '+' : '-'} Rs. {entry.amount.toFixed(2)}
                                                </p>
                                                {entry.type === 'SALE' && (
                                                    <button
                                                        onClick={() => generateReceipt(entry)}
                                                        className="text-xs flex items-center gap-1 text-emerald-600 font-bold hover:underline mt-1"
                                                    >
                                                        <Printer size={12} />
                                                        Print Receipt
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {entry.type === 'SALE' && entry.items.length > 0 && (
                                            <div className="bg-gray-50 rounded-xl overflow-hidden">
                                                <table className="w-full text-xs">
                                                    <thead>
                                                        <tr className="bg-gray-100/50 text-gray-500">
                                                            <th className="px-4 py-2 text-left">Item</th>
                                                            <th className="px-4 py-2 text-center">Qty</th>
                                                            <th className="px-4 py-2 text-right">Total</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100">
                                                        {entry.items.map((item: any, i: number) => (
                                                            <tr key={i}>
                                                                <td className="px-4 py-2 text-gray-700 font-medium">{item.name}</td>
                                                                <td className="px-4 py-2 text-center text-gray-500">{item.quantity}</td>
                                                                <td className="px-4 py-2 text-right text-gray-900 font-bold">Rs. {item.total.toFixed(2)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">Current Balance</p>
                                <p className={`text-xl font-black ${selectedCustomer.balance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                    Rs. {selectedCustomer.balance.toFixed(2)}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsLedgerOpen(false)}
                                className="px-8 py-3 bg-white text-gray-600 font-bold rounded-xl border border-gray-200 hover:bg-gray-900 hover:text-white transition-all shadow-sm"
                            >
                                Close Statement
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* FORM MODAL (Add/Edit) */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
                        <h2 className="text-2xl font-black mb-6">{selectedCustomer ? 'Edit Customer' : 'Add New Customer'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Full Name</label>
                                <input
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="e.g. John Doe"
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-medium transition-all"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Phone Number</label>
                                    <input
                                        required
                                        value={formData.phone}
                                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                        placeholder="03001234567"
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-medium transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-medium transition-all"
                                    >
                                        <option value="REGULAR">Regular</option>
                                        <option value="WHOLESALE">Wholesale</option>
                                        <option value="VIP">VIP Gold</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Shop Name (Optional)</label>
                                <input
                                    value={formData.shopName}
                                    onChange={(e) => setFormData(prev => ({ ...prev, shopName: e.target.value }))}
                                    placeholder="e.g. Al-Madina Store"
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-medium transition-all"
                                />
                            </div>
                            <div className="flex gap-3 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsFormOpen(false)}
                                    className="flex-1 px-4 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all"
                                >
                                    {selectedCustomer ? 'Save Changes' : 'Create Profile'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* PAYMENT MODAL */}
            {isPaymentOpen && selectedCustomer && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl text-center">
                        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <CreditCard size={40} />
                        </div>
                        <h2 className="text-2xl font-black mb-2">Record Payment</h2>
                        <p className="text-gray-500 mb-8 font-medium">
                            Receiving from <span className="text-gray-900 font-bold">{selectedCustomer.name}</span>
                        </p>
                        <form onSubmit={handlePayment} className="space-y-6">
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-300">Rs.</span>
                                <input
                                    type="number"
                                    required
                                    min="0.01"
                                    step="0.01"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full pl-10 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-blue-500 text-3xl font-black transition-all"
                                    autoFocus
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsPaymentOpen(false)}
                                    className="flex-1 px-4 py-4 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all"
                                >
                                    Confirm
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
