"use client";
import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import SummaryCard from "../../components/SummaryCard";
import ExpenseForm from "../../components/ExpenseForm";
import ExpensesTable from "../../components/ExpensesTable";

export default function DashboardPage() {
    const [expenses, setExpenses] = useState([]);
    const [filter, setFilter] = useState("all");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch('/api/expenses');
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

    useEffect(() => {
        try {
            localStorage.setItem("expenses:v1", JSON.stringify(expenses));
        } catch (err) {
            console.error(err);
        }
    }, [expenses]);

    async function handleAdd(item) {
        try {
            const res = await fetch('/api/expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item),
            });
            if (res.ok) {
                const created = await res.json();
                setExpenses(prev => [created, ...prev]);
            } else {
                console.error('Add failed', await res.text());
            }
        } catch (err) {
            console.error(err);
        }
    }

    async function handleDelete(id) {
        try {
            const res = await fetch(`/api/expenses?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
            if (res.ok) {
                setExpenses(prev => prev.filter(x => x.id !== id));
            } else {
                console.error('Delete failed', await res.text());
            }
        } catch (err) {
            console.error(err);
        }
    }

    const filtered = expenses.filter(e => (filter === 'all' ? true : e.type === filter));

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />

            <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Dashboard</h1>
                    <p className="text-sm text-gray-500 mt-1">Overview of your expenses and quick actions.</p>
                </div>

                <div className="space-y-6">
                    <SummaryCard expenses={expenses} />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Transactions</h2>

                                <div className="flex items-center gap-2">
                                    <select value={filter} onChange={e => setFilter(e.target.value)} className="px-3 py-2 border rounded bg-white dark:bg-gray-800">
                                        <option value="all">All</option>
                                        <option value="income">Income</option>
                                        <option value="expense">Expense</option>
                                    </select>
                                </div>
                            </div>

                            {loading ? (
                                <div className="p-4 bg-white dark:bg-gray-800 rounded shadow text-center">Loading...</div>
                            ) : (
                                <ExpensesTable items={filtered} onDelete={handleDelete} />
                            )}
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Add Transaction</h3>
                            <ExpenseForm onAdd={handleAdd} />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
