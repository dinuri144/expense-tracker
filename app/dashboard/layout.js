"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Receipt,
    PieChart,
    Wallet,
    Target,
    Tags,
    FileText,
    Settings,
    LogOut,
    Menu,
    X,
    Bell
} from "lucide-react";

export default function DashboardLayout({ children }) {
    const pathname = usePathname();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Real User State (Initially fallback to safe defaults if empty)
    const [user, setUser] = useState({ name: "Nimesh Silva", email: "nimesh@gmail.com" });

    const loadUserData = () => {
        try {
            const localUser = localStorage.getItem("customer");
            if (localUser) {
                const parsed = JSON.parse(localUser);
                if (parsed.name || parsed.email) {
                    setUser({
                        name: parsed.name || "Nimesh Silva",
                        email: parsed.email || "nimesh@gmail.com"
                    });
                }
            }
        } catch (e) {
            console.error("Error loading user data:", e);
        }
    };

    useEffect(() => {
        // 1. Load user on initial mount
        loadUserData();

        // 2. Listen to storage changes (so when Settings page saves, sidebar updates instantly)
        const handleStorageChange = () => {
            loadUserData();
        };

        window.addEventListener("storage", handleStorageChange);
        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("customer");
        localStorage.removeItem("user_settings");
        router.push("/");
    };

    const navItems = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Transactions", href: "/dashboard/transactions", icon: Receipt },
        { name: "Analytics", href: "/dashboard/analytics", icon: PieChart },
        { name: "Budgets", href: "/dashboard/budgets", icon: Wallet },
        { name: "Savings Goals", href: "/dashboard/savings", icon: Target },
        { name: "Categories", href: "/dashboard/categories", icon: Tags },
        { name: "Reports", href: "/dashboard/reports", icon: FileText },
        { name: "Settings", href: "/dashboard/settings", icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 bg-[#121624] border-r border-gray-800 transition-all duration-300 flex flex-col ${sidebarOpen ? "w-64" : "w-20"
                }`}>
                {/* Logo / Title Area */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-gray-800">
                    {sidebarOpen ? (
                        <span className="font-bold text-lg bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                            ExpenseTracker
                        </span>
                    ) : (
                        <span className="font-bold text-lg text-indigo-400 mx-auto">ET</span>
                    )}
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-medium transition ${isActive
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                                    : "text-gray-400 hover:bg-[#1a1f35] hover:text-gray-200"
                                    }`}
                                title={!sidebarOpen ? item.name : ""}
                            >
                                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-white" : "text-gray-400"}`} />
                                {sidebarOpen && <span className="truncate">{item.name}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Profile & Logout at Bottom */}
                <div className="p-3 border-t border-gray-800 space-y-2">
                    {sidebarOpen ? (
                        <div className="flex items-center justify-between px-3 py-2 bg-[#1a1f35] rounded-xl">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-xs flex-shrink-0 uppercase">
                                    {user.name ? user.name.charAt(0) : "U"}
                                </div>
                                <div className="truncate">
                                    <p className="text-xs font-semibold text-gray-200 truncate">{user.name}</p>
                                    <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-center py-2" title={`${user.name} (${user.email})`}>
                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-xs uppercase">
                                {user.name ? user.name.charAt(0) : "U"}
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleLogout}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition ${!sidebarOpen && "justify-center"
                            }`}
                        title="Logout"
                    >
                        <LogOut className="w-5 h-5 flex-shrink-0" />
                        {sidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"}`}>
                {/* Top Header */}
                <header className="h-16 bg-[#121624]/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-40 px-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* Sidebar Toggle Button */}
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 rounded-xl bg-[#1a1f35] border border-gray-800 text-gray-300 hover:text-white transition"
                            title="Toggle Sidebar"
                        >
                            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                        <span className="text-sm font-medium text-gray-300">
                            Welcome back, <span className="text-indigo-400 font-semibold">{user.name ? user.name.split(" ")[0] : "User"} 👋</span>
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="p-2 rounded-xl bg-[#1a1f35] border border-gray-800 text-gray-300 hover:text-white transition relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full"></span>
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}