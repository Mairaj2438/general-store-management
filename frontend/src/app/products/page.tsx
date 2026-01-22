"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { ProductForm } from '@/components/ProductForm';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ProductsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any | null>(null);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/products');
            setProducts(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this product?')) {
            try {
                await api.delete(`/products/${id}`);
                fetchProducts();
            } catch (error: any) {
                alert(error.response?.data?.error || 'Failed to delete product');
            }
        }
    };

    const getExpiryStatus = (dateStr?: string) => {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        const now = new Date();
        const diffTime = date.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { color: 'bg-red-100 text-red-700', label: 'Expired' };
        if (diffDays < 30) return { color: 'bg-yellow-100 text-yellow-700', label: 'Near Expiry' };
        return { color: 'bg-green-100 text-green-700', label: 'Good' };
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase()) ||
        (p.barcode && p.barcode.includes(search))
    );

    return (
        <div className="space-y-6">
            {/* Mobile Spacer to prevent header overlap */}
            <div className="h-24 lg:hidden w-full"></div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
                <button
                    onClick={() => { setEditingProduct(null); setIsFormOpen(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                >
                    <Plus size={20} />
                    Add Product
                </button>
            </div>

            {/* Spacer Block */}
            <div className="h-16"></div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search by name, category, or barcode..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm"
                />
            </div>

            {/* Product Grid - Replacing Table for Eye-Catching Responsiveness */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {loading ? (
                    // Skeleton Loading Cards
                    [1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                            <div className="flex justify-between">
                                <div className="skeleton h-6 w-24 rounded-lg"></div>
                                <div className="skeleton h-6 w-8 rounded-full"></div>
                            </div>
                            <div className="skeleton h-4 w-16 rounded-md"></div>
                            <div className="pt-4 space-y-2">
                                <div className="skeleton h-8 w-full rounded-xl"></div>
                            </div>
                        </div>
                    ))
                ) : filteredProducts.length === 0 ? (
                    <div className="col-span-full py-20 text-center">
                        <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
                            <Search className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
                        <p className="text-gray-500">Try adjusting your search or add a new product.</p>
                    </div>
                ) : (
                    filteredProducts.map((product) => {
                        const status = getExpiryStatus(product.expiryDate);
                        return (
                            <div
                                key={product.id}
                                className="group relative glass-card px-5 pt-5 pb-7 rounded-2xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                            >
                                {/* Decorative Gradient Blob */}
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-emerald-100 to-cyan-100 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>

                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="pr-2">
                                            <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded-full mb-1 border border-emerald-100">
                                                {product.category}
                                            </span>
                                            <h3 className="text-lg font-black text-gray-800 leading-tight mb-0.5 group-hover:text-emerald-700 transition-colors line-clamp-2">
                                                {product.name}
                                            </h3>
                                            <p className="text-[10px] text-gray-400 font-mono tracking-wide">{product.barcode || 'No Barcode'}</p>
                                        </div>

                                        {/* Actions Menu (Always visible or hover) */}
                                        <div className="flex gap-2 shrink-0 mr-1">
                                            <button
                                                onClick={() => { setEditingProduct(product); setIsFormOpen(true); }}
                                                className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                title="Edit Product"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                                title="Delete Product"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Price & Stock Section */}
                                    <div className="grid grid-cols-2 gap-3 my-4">
                                        <div className="bg-gray-50/80 p-3 rounded-2xl border border-gray-100">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">Retail Price</p>
                                            <p className="text-lg font-black text-gray-900">Rs. {product.retailPrice}</p>
                                        </div>
                                        <div className="bg-gray-50/80 p-3 rounded-2xl border border-gray-100">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">Wholesale</p>
                                            <p className="text-lg font-black text-gray-900">Rs. {product.wholesalePrice}</p>
                                        </div>
                                    </div>

                                    {/* Footer / Status */}
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100/50 mt-2">
                                        <div className="flex items-center gap-2">
                                            <div className={cn("w-2 h-2 rounded-full", product.quantity <= 10 ? "bg-red-500 animate-pulse" : "bg-emerald-500")}></div>
                                            <span className={cn("font-bold text-sm", product.quantity <= 10 ? "text-red-600" : "text-gray-600")}>
                                                {product.quantity} in Stock
                                            </span>
                                        </div>

                                        {status && (
                                            <div className={cn("px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm mr-1", status.color)}>
                                                {status.label === 'Expired' && <AlertCircle size={12} />}
                                                {status.label}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {isFormOpen && (
                <ProductForm
                    initialData={editingProduct}
                    onClose={() => setIsFormOpen(false)}
                    onSuccess={() => { setIsFormOpen(false); fetchProducts(); }}
                />
            )}
        </div>
    );
}
