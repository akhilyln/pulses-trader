"use client";

import React from 'react';

interface TickerItem {
    name: string;
    price: number;
    change: number | null;
}

export const Ticker: React.FC<{ items: TickerItem[] }> = ({ items }) => {
    return (
        <div className="ticker-container py-2 border-y border-zinc-800 bg-zinc-950/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="ticker-track">
                {[...items, ...items].map((item, i) => (
                    <div key={i} className="inline-flex items-center px-6 border-r border-zinc-800">
                        <span className="text-zinc-400 font-medium mr-2">{item.name}</span>
                        <span className="text-white font-bold">₹{item.price}</span>
                        {item.change !== null && (
                            <span className={`ml-2 text-xs font-bold ${item.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {item.change >= 0 ? '▲' : '▼'} {Math.abs(item.change).toFixed(1)}%
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
