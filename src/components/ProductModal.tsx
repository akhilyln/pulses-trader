"use client";

import React from 'react';
import { X, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Brand {
    id: string;
    name: string;
    price: number;
    prevPrice: number | null;
    change: number | null;
    updatedAt: string;
}

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    productName: string;
    teluguName?: string;
    brands: Brand[];
}

export const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, productName, teluguName, brands }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl"
                    >
                        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                            <div>
                                <h2 className="text-2xl font-black text-white">{productName}</h2>
                                {teluguName && <p className="text-zinc-500 font-medium">{teluguName}</p>}
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            {brands.map((brand) => (
                                <div key={brand.id} className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50 flex justify-between items-center group hover:border-green-500/30 transition-all">
                                    <div>
                                        <div className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-1">Brand</div>
                                        <div className="text-lg font-bold text-white">{brand.name}</div>
                                    </div>

                                    <div className="text-right">
                                        <div className="text-2xl font-black text-white">₹{brand.price.toFixed(2)}</div>
                                        <div className="flex items-center justify-end gap-2 mt-1">
                                            {brand.change !== null && (
                                                <span className={`text-sm font-bold flex items-center gap-1 ${brand.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                    {brand.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                                    {Math.abs(brand.change).toFixed(1)}%
                                                </span>
                                            )}
                                            <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                                                <Clock size={10} />
                                                {new Date(brand.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 bg-zinc-900/80 border-t border-zinc-800 text-center">
                            <p className="text-xs text-zinc-500">Prices are updated every hour. Last sync: {new Date().toLocaleTimeString()}</p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
