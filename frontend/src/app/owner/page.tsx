"use client";

import { useState, useRef } from 'react';
import { Camera, Award, BookOpen, Heart, Lock, Eye, EyeOff, Key } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/context/ConfirmContext';
import api from '@/lib/api';

export default function OwnerPage() {
    const { success, error: showError } = useToast();
    const { confirm } = useConfirm();
    const [imagePreview, setImagePreview] = useState<string>('/placeholder-owner.jpg');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Password change state
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            showError('New passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            showError('Password must be at least 6 characters');
            return;
        }

        confirm({
            title: 'Change Password',
            message: 'Are you sure you want to change your password? You will need to use the new password to login next time.',
            confirmText: 'Change Password',
            cancelText: 'Cancel',
            type: 'warning',
            onConfirm: async () => {
                setLoading(true);
                try {
                    await api.post('/auth/change-password', {
                        currentPassword,
                        newPassword
                    });
                    success('Password changed successfully! Please use your new password next time you login.');
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setIsChangingPassword(false);
                } catch (err: any) {
                    showError(err.response?.data?.error || 'Failed to change password');
                } finally {
                    setLoading(false);
                }
            }
        });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header / Cover */}
            <div className="relative h-48 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-2xl shadow-lg overflow-hidden">
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute bottom-4 left-6 text-white">
                    <h1 className="text-3xl font-bold">Owner Profile</h1>
                    <p className="text-blue-100">Al-Abbas General Store</p>
                </div>
            </div>

            {/* Profile Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Visual Identity */}
                <div className="md:col-span-1 flex flex-col items-center">
                    <div className="relative group">
                        <div className="w-48 h-48 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gray-100">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={imagePreview}
                                alt="Ghulam Abbas Khan"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute bottom-2 right-4 p-2 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 transition"
                            title="Upload Photo"
                        >
                            <Camera size={20} />
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            className="hidden"
                            accept="image/*"
                        />
                    </div>

                    <div className="mt-6 text-center">
                        <h2 className="text-xl font-bold text-gray-900">Ghulam Abbas Khan</h2>
                        <span className="inline-block mt-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                            Proprietor & Philanthropist
                        </span>
                    </div>

                    {/* Change Password Button */}
                    <button
                        onClick={() => setIsChangingPassword(!isChangingPassword)}
                        className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-lg font-bold"
                    >
                        <Key size={20} />
                        {isChangingPassword ? 'Cancel' : 'Change Password'}
                    </button>
                </div>

                {/* Bio / Details */}
                <div className="md:col-span-2 space-y-6">
                    {/* Password Change Form */}
                    {isChangingPassword && (
                        <div className="bg-white p-6 rounded-xl shadow-sm border-2 border-emerald-100 animate-scale-in">
                            <div className="flex items-center gap-3 mb-6 text-emerald-700">
                                <Lock className="w-6 h-6" />
                                <h3 className="text-lg font-bold">Change Your Password</h3>
                            </div>
                            <form onSubmit={handlePasswordChange} className="space-y-6">
                                {/* Current Password */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700">Current Password</label>
                                    <div className="relative">
                                        <input
                                            type={showCurrentPassword ? "text" : "password"}
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            className="w-full pl-4 pr-12 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                            placeholder="Enter current password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>

                                {/* New Password */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700">New Password</label>
                                    <div className="relative">
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full pl-4 pr-12 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                            placeholder="Enter new password (min 6 characters)"
                                            required
                                            minLength={6}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700">Confirm New Password</label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full pl-4 pr-12 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                            placeholder="Confirm new password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl font-bold hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Changing Password...' : 'Update Password'}
                                </button>
                            </form>
                        </div>
                    )}

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-4 text-emerald-700">
                            <BookOpen className="w-6 h-6" />
                            <h3 className="text-lg font-bold">Educational Legacy</h3>
                        </div>
                        <p className="text-gray-600 leading-relaxed">
                            A retired educator with a distinguished career, Mr. Ghulam Abbas Khan has dedicated his life to the field of teaching.
                            Rather than merely creating professionals, his philosophy has always been centered on creating
                            <span className="font-semibold text-gray-800"> better human beings</span> and uplifting society through knowledge.
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-4 text-rose-600">
                            <Heart className="w-6 h-6" />
                            <h3 className="text-lg font-bold">Philanthropy & Social Impact</h3>
                        </div>
                        <p className="text-gray-600 leading-relaxed">
                            Beyond commerce, his mission extends to helping the underprivileged. He actively supports poor and deprived students,
                            enabling them to pursue higher education and become Doctors, Engineers, Army Officers, and Accountants.
                            <span className="italic block mt-2 text-gray-500">"Education is the most powerful weapon which you can use to change the world."</span>
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-4 text-purple-600">
                            <Award className="w-6 h-6" />
                            <h3 className="text-lg font-bold">Store Vision</h3>
                        </div>
                        <p className="text-gray-600">
                            <span className="font-bold">Al-Abbas General Store</span> represents integrity and community service.
                            We aim to provide quality goods at fair prices, continuing the legacy of trust and community support in Shahjamal.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
