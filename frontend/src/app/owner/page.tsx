"use client";

import { useState, useRef } from 'react';
import { Camera, Mail, Award, BookOpen, Heart, Upload } from 'lucide-react';

export default function OwnerPage() {
    const [imagePreview, setImagePreview] = useState<string>('/placeholder-owner.jpg'); // Default or placeholder
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
                // Ideally, upload this to backend here
            };
            reader.readAsDataURL(file);
        }
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
                </div>

                {/* Bio / Details */}
                <div className="md:col-span-2 space-y-6">
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
