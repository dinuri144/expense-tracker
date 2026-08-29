"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
    const [theme, setTheme] = useState("light");
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Theme
        try {
            const local = localStorage.getItem("theme");
            if (local) {
                setTheme(local);
                document.documentElement.classList.toggle("dark", local === "dark");
            }
        } catch (err) { }

        // Check if logged in
        async function checkAuth() {
            try {
                const res = await fetch("/api/expenses");
                if (res.ok) {
                    setUser({ loggedIn: true });
                } else {
                    setUser(null);
                }
            } catch {
                setUser(null);
            } finally {
                setLoading(false);
            }
        }
        checkAuth();
    }, [pathname]);

    async function toggleTheme() {
        const next = theme === "dark" ? "light" : "dark";
        setTheme(next);
        localStorage.setItem("theme", next);
        document.documentElement.classList.toggle("dark", next === "dark");
    }

    async function handleLogout() {
        try {
            await fetch("/api/logout", { method: "POST" });
            setUser(null);
            router.push("/login");
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex items-center gap-6">
                        <Link href={user ? "/dashboard" : "/"} className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                            ExpenseTracker
                        </Link>

                        {user && (
                            <div className="hidden sm:flex items-center gap-4">
                                <Link
                                    href="/dashboard"
                                    className={`text-sm font-medium ${pathname === "/dashboard" ? "text-indigo-600" : "text-gray-600 dark:text-gray-300 hover:text-indigo-600"}`}
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    href="/analytics"
                                    className={`text-sm font-medium ${pathname === "/analytics" ? "text-indigo-600" : "text-gray-600 dark:text-gray-300 hover:text-indigo-600"}`}
                                >
                                    Analytics
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                        >
                            {theme === "dark" ? "☀️" : "🌙"}
                        </button>

                        {!loading && (
                            <>
                                {user ? (
                                    <button
                                        onClick={handleLogout}
                                        className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition"
                                    >
                                        Logout
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Link
                                            href="/login"
                                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-indigo-600"
                                        >
                                            Login
                                        </Link>
                                        <Link
                                            href="/signup"
                                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition"
                                        >
                                            Sign Up
                                        </Link>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}