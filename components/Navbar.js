"use client";
import React from "react";

export default function Navbar() {
    return (
        <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex items-center space-x-3">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">ExpenseTracker</div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">• Dashboard</span>
                    </div>

                    <div className="flex items-center space-x-4">
                        <a href="/dashboard" className="text-sm text-gray-700 dark:text-gray-200 hover:underline">Dashboard</a>
                        <a href="/signup" className="text-sm text-gray-700 dark:text-gray-200 hover:underline">Signup</a>
                        <a href="/login" className="text-sm text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded">Login</a>
                    </div>
                </div>
            </div>
        </nav>
    );
}
