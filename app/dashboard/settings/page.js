"use client";
import React, { useState, useEffect } from "react";
import { Loader2, User, Mail, DollarSign, Moon, Sun, Save, Check, Lock } from "lucide-react";

export default function SettingsPage() {
    const [loading, setLoading] = useState(false);
    const [savedSuccess, setSavedSuccess] = useState(false);

    // Profile & Settings State
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [currency, setCurrency] = useState("USD");
    const [theme, setTheme] = useState("dark");

    useEffect(() => {
        const fetchUserDataFromDB = async () => {
            try {
                // 1. Local storage එකෙන් ලොග් වී ඇති යුසර්ගේ ඊමේල් එක ලබා ගැනීම
                const localUser = localStorage.getItem("customer") || localStorage.getItem("user");
                console.log("Local User from storage:", localUser); // මේක බ්‍රවුසරයේ Console එකේ පෙන්වයි

                let userEmail = "";

                if (localUser) {
                    const parsedUser = JSON.parse(localUser);
                    if (parsedUser.email) {
                        userEmail = parsedUser.email;
                    }
                }

                if (!userEmail) {
                    console.error("No logged-in user email found in storage!");
                    return;
                }

                console.log("Fetching DB for email:", userEmail);

                // 2. ඩේටාබේස් API එකෙන් ඩේටා Fetch කරගැනීම
                const res = await fetch(`/api/profile?email=${encodeURIComponent(userEmail)}`);
                const data = await res.json();
                console.log("API Response:", data); // API එකෙන් එන ඩේටා මෙතැන බලාගත හැක

                if (data.success && data.user) {
                    setName(data.user.name || "");
                    setEmail(data.user.email || "");
                    if (data.user.currency) setCurrency(data.user.currency);
                    if (data.user.theme) setTheme(data.user.theme);
                } else {
                    console.warn("User not found in DB or success is false, using storage data");
                    if (localUser) {
                        const parsedUser = JSON.parse(localUser);
                        if (parsedUser.name) setName(parsedUser.name);
                        if (parsedUser.email) setEmail(parsedUser.email);
                    }
                }
            } catch (error) {
                console.error("Error fetching profile from database:", error);
            }

            // 3. අනෙකුත් සැකසුම් ලබා ගැනීම
            const savedSettings = localStorage.getItem("user_settings");
            if (savedSettings) {
                try {
                    const parsed = JSON.parse(savedSettings);
                    if (parsed.currency) setCurrency(parsed.currency);
                    if (parsed.theme) setTheme(parsed.theme);
                } catch (e) {
                    // ignore
                }
            }
        };

        fetchUserDataFromDB();
    }, []);

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSavedSuccess(false);

        try {
            // 1. ඩේටාබේස් API එකට (PUT request) ඩේටා යැවීම
            const res = await fetch("/api/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, currency, theme }),
            });

            const result = await res.json();

            if (!res.ok || !result.success) {
                throw new Error(result.error || "Failed to update database");
            }

            // 2. Local Storage එකත් අප්ඩේට් කරගැනීම
            const updatedUser = { name, email };
            localStorage.setItem("customer", JSON.stringify(updatedUser));

            const settingsData = {
                currency,
                theme,
            };
            localStorage.setItem("user_settings", JSON.stringify(settingsData));

            setLoading(false);
            setSavedSuccess(true);

            // ✅ මෙන්න මේ Custom Event එක හරහා එකම ටැබ් එක ඇතුළේ Sidebar එක සහ Header එක ක්ෂණිකව අප්ඩේට් කරයි
            window.dispatchEvent(new Event("userDataChanged"));

            setTimeout(() => setSavedSuccess(false), 3000);
        } catch (error) {
            console.error("Save error:", error);
            alert("Failed to save changes to database!");
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h1 className="text-2xl font-bold">Settings</h1>
                <p className="text-sm text-gray-400">Manage your account profile, preferences, and security settings.</p>
            </div>

            {savedSuccess && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-sm flex items-center gap-2 animate-fadeIn">
                    <Check className="w-5 h-5" /> Settings saved to database successfully!
                </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-6">
                {/* Profile Information Section */}
                <div className="bg-[#121624] p-6 rounded-2xl border border-gray-800 space-y-4">
                    <h2 className="text-base font-semibold text-gray-200">Profile Information</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs text-gray-400 flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-indigo-400" /> Full Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full px-3.5 py-2.5 bg-[#1a1f35] border border-gray-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-white"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs text-gray-400 flex items-center gap-1.5">
                                <Mail className="w-3.5 h-3.5 text-indigo-400" /> Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-3.5 py-2.5 bg-[#1a1f35] border border-gray-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-white"
                            />
                        </div>
                    </div>
                </div>

                {/* Preferences Section */}
                <div className="bg-[#121624] p-6 rounded-2xl border border-gray-800 space-y-4">
                    <h2 className="text-base font-semibold text-gray-200">Preferences</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs text-gray-400 flex items-center gap-1.5">
                                <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Currency
                            </label>
                            <select
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-[#1a1f35] border border-gray-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-white"
                            >
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="GBP">GBP (£)</option>
                                <option value="LKR">LKR (Rs)</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs text-gray-400 flex items-center gap-1.5">
                                {theme === "dark" ? <Moon className="w-3.5 h-3.5 text-indigo-400" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />} Theme
                            </label>
                            <select
                                value={theme}
                                onChange={(e) => setTheme(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-[#1a1f35] border border-gray-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-white"
                            >
                                <option value="dark">Dark Mode</option>
                                <option value="light">Light Mode</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Security & Session Section */}
                <div className="bg-[#121624] p-6 rounded-2xl border border-gray-800 flex items-center justify-between">
                    <div className="space-y-1">
                        <h2 className="text-base font-semibold text-gray-200 flex items-center gap-2">
                            <Lock className="w-4 h-4 text-indigo-400" /> Security & Session
                        </h2>
                        <p className="text-xs text-gray-400">Update your account password securely</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => alert("Password update feature coming soon!")}
                        className="px-4 py-2 bg-[#1a1f35] hover:bg-gray-800 text-white rounded-xl text-sm font-medium border border-gray-800 transition"
                    >
                        Update
                    </button>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition flex items-center gap-2 shadow-lg shadow-indigo-600/20"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
}