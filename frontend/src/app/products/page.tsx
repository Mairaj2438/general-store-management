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
            } catch (error) {
                alert('Failed to delete product');
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

            {/* Product Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-4 text-sm font-semibold text-gray-500">Name</th>
                                <th className="p-4 text-sm font-semibold text-gray-500">Category</th>
                                <th className="p-4 text-sm font-semibold text-gray-500">Price (R/W)</th>
                                <th className="p-4 text-sm font-semibold text-gray-500">Stock</th>
                                <th className="p-4 text-sm font-semibold text-gray-500">Status</th>
                                <th className="p-4 text-sm font-semibold text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={6} className="p-8 text-center text-gray-500">Loading products...</td></tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr><td colSpan={6} className="p-8 text-center text-gray-500">No products found.</td></tr>
                            ) : (
                                filteredProducts.map((product) => {
                                    const status = getExpiryStatus(product.expiryDate);
                                    return (
                                        <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4">
                                                <div className="font-medium text-gray-900">{product.name}</div>
                                                <div className="text-xs text-gray-400">{product.barcode}</div>
                                            </td>
                                            <td className="p-4 text-sm text-gray-600">
                                                <span className="px-2 py-1 bg-gray-100 rounded-md text-xs font-medium">
                                                    {product.category}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm text-gray-600">
                                                <div>Retail: <span className="font-semibold">Rs. {product.retailPrice}</span></div>
                                                <div className="text-xs text-gray-400">Wholesale: Rs. {product.wholesalePrice}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className={cn("font-medium", product.quantity <= 10 ? "text-orange-600" : "text-gray-700")}>
                                                    {product.quantity} units
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                {status ? (
                                                    <span className={cn("px-2 py-1 rounded-full text-xs font-medium flex items-center w-fit gap-1", status.color)}>
                                                        {status.label === 'Expired' && <AlertCircle size={12} />}
                                                        {status.label}
                                                    </span>
                                                ) : <span className="text-gray-400 text-xs">-</span>}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => { setEditingProduct(product); setIsFormOpen(true); }}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(product.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
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
