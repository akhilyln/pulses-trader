"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminGrid } from '@/components/AdminGrid';
import { Loader2, ShieldCheck, LogOut } from 'lucide-react';

export default function AdminDashboard() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [authorized, setAuthorized] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const auth = localStorage.getItem('admin_auth');
        if (auth !== 'true') {
            router.push('/admin');
        } else {
            setAuthorized(true);
            fetchData();
        }
    }, [router]);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/products');
            const products = await res.json();

            if (Array.isArray(products)) {
                setData(products);
            } else {
                console.error('API returned non-array data:', products);
                setData([]);
            }
        } catch (error) {
            console.error('Failed to fetch data');
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (updatedProducts: any[]) => {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    password: 'admin123', // In real app, use a session token
                    products: updatedProducts
                })
            });

            if (res.ok) {
                alert('Changes saved successfully!');
                fetchData();
            } else {
                alert('Failed to save changes');
            }
        } catch (error) {
            console.error('Save error:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('admin_auth');
        router.push('/admin');
    };

    if (!authorized) return null;

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-white p-6">
            <div className="max-w-[1400px] mx-auto">
                <div className="flex justify-between items-center mb-8 bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/10 rounded-lg">
                            <ShieldCheck className="text-green-500 w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black">Admin Panel</h1>
                            <p className="text-zinc-500 text-xs uppercase tracking-widest">Rate Control Center</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors font-bold text-sm"
                    >
                        <LogOut size={18} /> Logout
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="animate-spin text-green-500 w-12 h-12" />
                    </div>
                ) : (
                    <AdminGrid initialData={data} onSave={handleSave} />
                )}

                {saving && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center">
                        <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 flex flex-col items-center gap-4">
                            <Loader2 className="animate-spin text-green-500 w-12 h-12" />
                            <p className="text-white font-bold text-lg">Syncing with live UI...</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
