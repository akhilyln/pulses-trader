"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function AdminLogin() {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // For this project, we use a simple predefined password check
        // In a real app, this would be a server-side session/cookie check
        if (password === 'admin123') {
            localStorage.setItem('admin_auth', 'true');
            router.push('/admin/dashboard');
        } else {
            setError('Invalid admin password');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-4">
            <div className="w-full max-w-md p-8 glass-card border-zinc-800">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center p-4 bg-green-500/10 rounded-2xl mb-4">
                        <Lock className="w-8 h-8 text-green-500" />
                    </div>
                    <h1 className="text-3xl font-black text-white">Admin Access</h1>
                    <p className="text-zinc-500 mt-2">Enter password to manage rates</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Admin Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-4 px-4 pr-12 focus:outline-none focus:border-green-500 transition-colors text-white"
                            autoFocus
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm font-bold text-center bg-red-500/10 py-2 rounded-lg">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-500 hover:bg-green-600 disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-black py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-lg"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'Sign In to Dashboard'}
                    </button>
                </form>

                <p className="mt-8 text-center text-zinc-600 text-xs uppercase tracking-widest">
                    Secure Access Only
                </p>
            </div>
        </div>
    );
}
