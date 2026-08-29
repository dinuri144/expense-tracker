"use client";
import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Charts from "../../components/Charts";

export default function AnalyticsPage() {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {

                const res = await fetch('/api/expenses', { headers: { Authorization: token ? `Bearer ${token}` : '' } });
                if (res.ok) {
                    const data = await res.json();
                    setExpenses(data || []);
                } else {
                    console.error('Failed to load expenses', res.status);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />

            <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Analytics</h1>
                    <p className="text-sm text-gray-500 mt-1">Charts and visual breakdowns of your expenses.</p>
                </div>

                <div className="space-y-6">
                    {loading ? (
                        <div className="p-4 bg-white dark:bg-gray-800 rounded shadow text-center">Loading charts...</div>
                    ) : (
                        <Charts expenses={expenses} />
                    )}
                </div>
            </main>
        </div>
    );
}
