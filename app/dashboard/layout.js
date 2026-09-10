"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    Bell,
    Search,
    Sun,
    Moon,
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
} from "lucide-react";

export default function DashboardLayout({ children }) {
    const pathname = usePathname();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Search query සහ Theme states
    const [searchQuery, setSearchQuery] = useState("");
    const [isDarkMode, setIsDarkMode] = useState(true);

    // Real User State
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
        loadUserData();

        // Theme එක load කරගැනීම
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "light") {
            setIsDarkMode(false);
            document.documentElement.classList.remove("dark");
        } else {
            setIsDarkMode(true);
            document.documentElement.classList.add("dark");
        }

        const handleStorageChange = () => {
            loadUserData();
        };

        window.addEventListener("storage", handleStorageChange);
        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };
    }, []);

    // Theme Toggle කිරීමේ ක්‍රියාවලිය
    const toggleTheme = () => {
        if (isDarkMode) {
            setIsDarkMode(false);
            localStorage.setItem("theme", "light");
            document.documentElement.classList.remove("dark");
        } else {
            setIsDarkMode(true);
            localStorage.setItem("theme", "dark");
            document.documentElement.classList.add("dark");
        }
    };

    // Search කළ පසු Transactions පිටුවට redirect කිරීම
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/dashboard/transactions?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

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
        <div className={`min-h-screen flex transition-colors duration-300 ${isDarkMode ? "bg-[#0b0f19] text-gray-100" : "bg-gray-100 text-gray-900"
            }`}>
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 border-r transition-all duration-300 flex flex-col ${isDarkMode ? "bg-[#121624] border-gray-800" : "bg-white border-gray-200"
                } ${sidebarOpen ? "w-64" : "w-20"}`}>

                {/* Logo / Title Area */}
                <div className={`h-16 flex items-center justify-between px-6 border-b ${isDarkMode ? "border-gray-800" : "border-gray-200"
                    }`}>
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
                                    : isDarkMode
                                        ? "text-gray-400 hover:bg-[#1a1f35] hover:text-gray-200"
                                        : "text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                                    }`}
                                title={!sidebarOpen ? item.name : ""}
                            >
                                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-white" : isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
                                {sidebarOpen && <span className="truncate">{item.name}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Profile & Logout at Bottom */}
                <div className={`p-3 border-t space-y-2 ${isDarkMode ? "border-gray-800" : "border-gray-200"}`}>
                    {sidebarOpen ? (
                        <div className={`flex items-center justify-between px-3 py-2 rounded-xl ${isDarkMode ? "bg-[#1a1f35]" : "bg-gray-100"
                            }`}>
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-xs flex-shrink-0 uppercase">
                                    {user.name ? user.name.charAt(0) : "U"}
                                </div>
                                <div className="truncate">
                                    <p className={`text-xs font-semibold truncate ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>{user.name}</p>
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
                <header className={`h-16 backdrop-blur-md border-b sticky top-0 z-40 px-6 flex items-center justify-between ${isDarkMode ? "bg-[#121624]/80 border-gray-800" : "bg-white/80 border-gray-200"
                    }`}>
                    <div className="flex items-center gap-4">
                        {/* Sidebar Toggle Button */}
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className={`p-2 rounded-xl border transition ${isDarkMode ? "bg-[#1a1f35] border-gray-800 text-gray-300 hover:text-white" : "bg-gray-100 border-gray-200 text-gray-700 hover:text-black"
                                }`}
                            title="Toggle Sidebar"
                        >
                            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>

                        {/* Welcome Text */}
                        <span className={`text-sm font-medium hidden sm:inline-block ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                            Welcome back, <span className="text-indigo-400 font-semibold">{user.name ? user.name.split(" ")[0] : "User"} 👋</span>
                        </span>
                    </div>

                    {/* Quick Search Bar Form */}
                    <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md mx-4 hidden md:block">
                        <div className="relative flex items-center">
                            <Search className="absolute left-3 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search transactions (Press Enter)..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={`w-full pl-9 pr-4 py-1.5 border rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition ${isDarkMode
                                    ? "bg-[#1a1f35] border-gray-800 text-gray-200 placeholder-gray-500"
                                    : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400"
                                    }`}
                            />
                        </div>
                    </form>

                    {/* දකුණු පැත්ත: Theme Toggle සහ Notification */}
                    <div className="flex items-center gap-3">
                        {/* Theme Toggle Button */}
                        <button
                            onClick={toggleTheme}
                            className={`p-2 rounded-xl border transition ${isDarkMode ? "bg-[#1a1f35] border-gray-800 text-gray-300 hover:text-white" : "bg-gray-100 border-gray-200 text-gray-700 hover:text-black"
                                }`}
                            title="Toggle Theme"
                        >
                            {isDarkMode ? (
                                <Sun className="w-5 h-5 text-amber-400" />
                            ) : (
                                <Moon className="w-5 h-5 text-indigo-400" />
                            )}
                        </button>

                        {/* Notification Button */}
                        <button className={`p-2 rounded-xl border transition relative ${isDarkMode ? "bg-[#1a1f35] border-gray-800 text-gray-300 hover:text-white" : "bg-gray-100 border-gray-200 text-gray-700 hover:text-black"
                            }`}>
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