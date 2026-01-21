"use client";

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Brand {
    id: string;
    name: string;
    price: number;
    change: number | null;
}

interface ProductCardProps {
    name: string;
    teluguName?: string;
    brands: Brand[];
    onClick: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ name, teluguName, brands, onClick }) => {
    const minPrice = brands.length > 0
        ? Math.min(...brands.map(b => b.price))
        : 0;

    const totalChange = brands.length > 0
        ? brands.reduce((acc, b) => acc + (b.change || 0), 0) / brands.length
        : 0;

    return (
        <div
            onClick={onClick}
            className="glass-card p-5 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all group"
        >
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-green-400 transition-colors">
                        {name}
                    </h3>
                    {teluguName && (
                        <p className="text-sm text-zinc-500 font-medium">{teluguName}</p>
                    )}
                </div>
                <div className={`p-2 rounded-lg ${totalChange >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                    {totalChange > 0 ? (
                        <TrendingUp className="w-5 h-5 text-green-500" />
                    ) : totalChange < 0 ? (
                        <TrendingDown className="w-5 h-5 text-red-500" />
                    ) : (
                        <Minus className="w-5 h-5 text-zinc-500" />
                    )}
                </div>
            </div>

            <div className="space-y-1">
                <div className="text-zinc-500 text-sm">Price starts at</div>
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-white">₹{minPrice.toFixed(2)}</span>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-zinc-800">
                <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Available Brands</div>
                <div className="flex flex-wrap gap-2">
                    {brands.slice(0, 3).map(brand => (
                        <span key={brand.id} className="px-2 py-1 rounded bg-zinc-800 text-zinc-300 text-[10px] font-bold">
                            {brand.name}
                        </span>
                    ))}
                    {brands.length > 3 && (
                        <span className="text-[10px] text-zinc-500 font-bold">+{brands.length - 3} more</span>
                    )}
                </div>
            </div>
        </div>
    );
};
