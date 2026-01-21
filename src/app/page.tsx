"use client";

import React, { useEffect, useState } from 'react';
import { Ticker } from '@/components/Ticker';
import { ProductCard } from '@/components/ProductCard';
import { ProductModal } from '@/components/ProductModal';
import { Search, Loader2 } from 'lucide-react';

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  useEffect(() => {
    fetchProducts();
    const interval = setInterval(fetchProducts, 60000); // Refresh every minute for "live" feel
    return () => clearInterval(interval);
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.teluguName && p.teluguName.includes(search))
  );

  const tickerItems = products.flatMap(p =>
    p.brands.map((b: any) => ({
      name: `${p.name} (${b.name})`,
      price: b.price,
      change: b.change
    }))
  );

  return (
    <main className="min-h-screen bg-[#0a0a0b] text-white">
      <Ticker items={tickerItems} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent uppercase tracking-tight">
            VIJAYA AMBICA ENTERPRISES
          </h1>
          <div className="flex flex-col gap-2">
            <p className="text-zinc-500 font-medium tracking-wide">
              Trading Since 1970 <span className="mx-2">•</span> 56 Years of Trust
            </p>
            <div className="inline-flex items-center justify-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-1.5 rounded-full text-sm font-bold w-fit mx-auto">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Minimum Order Quantity (MOQ): 1 Ton
            </div>
          </div>
        </header>

        <div className="relative mb-12 max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Search pulses or brands..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-green-500 transition-colors text-lg"
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 text-green-500 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                name={product.name}
                teluguName={product.teluguName}
                brands={product.brands}
                onClick={() => setSelectedProduct(product)}
              />
            ))}
          </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-20 bg-zinc-900/50 rounded-3xl border border-zinc-800">
            <p className="text-zinc-500 text-lg">No products found matching "{search}"</p>
          </div>
        )}
      </div>

      <ProductModal
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        productName={selectedProduct?.name || ''}
        teluguName={selectedProduct?.teluguName}
        brands={selectedProduct?.brands || []}
      />

      <footer className="mt-20 py-10 border-t border-zinc-900 text-center text-zinc-600 text-sm">
        <p>&copy; {new Date().getFullYear()} Vijaya Ambica Enterprises. All rights reserved.</p>
        <p className="mt-2 text-zinc-700">Market Interface v1.1 • Trading Since 1970</p>
      </footer>
    </main>
  );
}
