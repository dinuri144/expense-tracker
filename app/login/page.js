'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Wallet } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Something went wrong');
                setLoading(false);
                return;
            }

            if (data.user) {
                localStorage.setItem("customer", JSON.stringify(data.user));
            }

            // redirect to dashboard after successful login
            router.push('/dashboard');
        } catch (err) {
            setError('An error occurred. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#0b0f19] text-white p-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-[#121624] rounded-2xl border border-gray-800 shadow-2xl">

                {/* Logo and Title */}
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600/10 text-indigo-400 mb-1">
                        <Wallet className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-white">Login to Your Account</h2>
                    <p className="text-xs text-gray-400">Please enter your details to sign in</p>
                </div>

                {error && (
                    <div className="p-3 text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="block text-xs font-medium text-gray-400">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-[#1a1f35] border border-gray-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-gray-200 placeholder-gray-500"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="block text-xs font-medium text-gray-400">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-[#1a1f35] border border-gray-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-gray-200 placeholder-gray-500"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 mt-2 disabled:opacity-50"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {loading ? "Signing in..." : "Login"}
                    </button>
                </form>

                <p className="text-xs text-center text-gray-400">
                    Don't have an account?{' '}
                    <Link href="/signup" className="text-indigo-400 hover:underline font-medium">
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
}