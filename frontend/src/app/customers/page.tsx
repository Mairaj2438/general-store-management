"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Plus, Search, User, Phone, Store } from 'lucide-react';
import { toast } from 'sonner';

export default function CustomersPage() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [isLedgerOpen, setIsLedgerOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [customerLedger, setCustomerLedger] = useState<any[]>([]);
    const [formData, setFormData] = useState({ name: '', shopName: '', phone: '' });

    const fetchCustomerLedger = async (customerId: string) => {
        try {
            const { data } = await api.get(`/customers/${customerId}/ledger`);
            setCustomerLedger(data.ledger);
            setIsLedgerOpen(true);
        } catch (error) {
            toast.error('Failed to load ledger');
        }
    };

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

    useEffect(() => {
        fetchCustomers();
    }, []);

    const [paymentAmount, setPaymentAmount] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post(`/customers/${selectedCustomer.id}/payment`, { amount: Number(paymentAmount) });
            toast.success('Payment recorded');
            setIsPaymentOpen(false);
            setPaymentAmount('');
            setSelectedCustomer(null);
            fetchCustomers();
        } catch (error) {
            toast.error('Failed to record payment');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/customers', formData);
            toast.success('Customer added');
            setIsFormOpen(false);
            setFormData({ name: '', shopName: '', phone: '' });
            fetchCustomers();
        } catch (error) {
            toast.error('Failed to add customer');
        }
    };

    const filtered = customers.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.shopName && c.shopName.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                >
                    <Plus size={20} />
                    Add Customer
                </button>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search customers..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? <p>Loading...</p> : filtered.map(customer => (
                    <div key={customer.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                                <User size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">{customer.name}</h3>
                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                    <Store size={12} /> {customer.shopName || 'Individual'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => { setSelectedCustomer(customer); fetchCustomerLedger(customer.id); }}
                            className="w-full mb-3 py-1.5 text-sm bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors border border-gray-100"
                        >
                            View History / Ledger
                        </button>
                        <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <Phone size={14} /> {customer.phone}
                            </div>
                            <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
                                <div>
                                    <span className="text-xs text-gray-500 block">Balance Due</span>
                                    <span className={`font-bold ${customer.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        ${customer.balance.toFixed(2)}
                                    </span>
                                </div>
                                <button
                                    onClick={() => {
                                        setSelectedCustomer(customer);
                                        setIsPaymentOpen(true);
                                    }}
                                    className="text-sm px-3 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                                >
                                    Record Payment
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isFormOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
                        <h2 className="text-xl font-bold mb-4">Add New Customer</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <input
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Shop Name (Optional)</label>
                                <input
                                    value={formData.shopName}
                                    onChange={(e) => setFormData(prev => ({ ...prev, shopName: e.target.value }))}
                                    className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Phone</label>
                                <input
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                    className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Save Customer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isPaymentOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl">
                        <h2 className="text-xl font-bold mb-4">Record Payment</h2>
                        <p className="text-sm text-gray-500 mb-4">
                            Receiving payment from <span className="font-bold">{selectedCustomer?.name}</span>
                        </p>
                        <form onSubmit={handlePayment} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Amount Received ($)</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.01"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                    autoFocus
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setIsPaymentOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Confirm Payment</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {isLedgerOpen && selectedCustomer && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-0 w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{selectedCustomer.name}</h2>
                                <p className="text-sm text-gray-500">Transaction History</p>
                            </div>
                            <button onClick={() => setIsLedgerOpen(false)} className="text-gray-400 hover:text-gray-600">
                                Close
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1">
                            {customerLedger.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">No transaction history found.</p>
                            ) : (
                                <div className="space-y-0 relative border-l-2 border-gray-200 ml-3">
                                    {customerLedger.map((entry, idx) => (
                                        <div key={idx} className="mb-6 ml-6 relative">
                                            <div className={`absolute -left-[31px] w-4 h-4 rounded-full border-2 border-white ${entry.type === 'SALE' ? 'bg-orange-500' : 'bg-emerald-500'}`} />
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-bold text-gray-900">
                                                        {new Date(entry.date).toLocaleDateString()}
                                                    </p>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${entry.type === 'SALE' ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                        {entry.type === 'SALE' ? 'ITEM BOUGHT' : 'PAYMENT'}
                                                    </span>
                                                </div>
                                                <p className={`font-bold ${entry.type === 'SALE' ? 'text-red-500' : 'text-green-600'}`}>
                                                    {entry.type === 'SALE' ? '+' : '-'} ${entry.amount.toFixed(2)}
                                                </p>
                                            </div>
                                            {entry.type === 'SALE' && (
                                                <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                    <p className="font-medium text-xs text-gray-400 uppercase mb-1">Items Borrowed:</p>
                                                    {entry.items}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={() => setIsLedgerOpen(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                            >
                                Close Ledger
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
