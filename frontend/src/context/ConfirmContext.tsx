"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogOptions {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
    onConfirm: () => void | Promise<void>;
}

interface ConfirmContextType {
    confirm: (options: ConfirmDialogOptions) => void;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function ConfirmProvider({ children }: { children: ReactNode }) {
    const [dialog, setDialog] = useState<ConfirmDialogOptions | null>(null);
    const [loading, setLoading] = useState(false);

    const confirm = useCallback((options: ConfirmDialogOptions) => {
        setDialog(options);
    }, []);

    const handleConfirm = async () => {
        if (!dialog) return;

        setLoading(true);
        try {
            await dialog.onConfirm();
            setDialog(null);
        } catch (error) {
            console.error('Confirmation action failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setDialog(null);
    };

    const getTypeStyles = (type: string = 'info') => {
        switch (type) {
            case 'danger':
                return {
                    bg: 'from-red-500 to-red-600',
                    text: 'text-red-600',
                    button: 'from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
                };
            case 'warning':
                return {
                    bg: 'from-orange-500 to-orange-600',
                    text: 'text-orange-600',
                    button: 'from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800'
                };
            default:
                return {
                    bg: 'from-blue-500 to-blue-600',
                    text: 'text-blue-600',
                    button: 'from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                };
        }
    };

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}

            {/* Confirmation Dialog */}
            {dialog && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10000] p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
                        {/* Header with gradient */}
                        <div className={`bg-gradient-to-r ${getTypeStyles(dialog.type).bg} p-6`}>
                            <div className="flex items-center gap-4 text-white">
                                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-xl">
                                    <AlertTriangle className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-black">{dialog.title}</h3>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-8 space-y-6">
                            <p className="text-lg text-gray-700 leading-relaxed">
                                {dialog.message}
                            </p>

                            {/* Actions */}
                            <div className="flex gap-4">
                                <button
                                    onClick={handleCancel}
                                    disabled={loading}
                                    className="flex-1 px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-base"
                                >
                                    {dialog.cancelText || 'Cancel'}
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    disabled={loading}
                                    className={`flex-1 px-6 py-4 bg-gradient-to-r ${getTypeStyles(dialog.type).button} text-white font-bold rounded-2xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-base`}
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Processing...
                                        </span>
                                    ) : (
                                        dialog.confirmText || 'Confirm'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </ConfirmContext.Provider>
    );
}

export function useConfirm() {
    const context = useContext(ConfirmContext);
    if (!context) {
        throw new Error('useConfirm must be used within ConfirmProvider');
    }
    return context;
}
