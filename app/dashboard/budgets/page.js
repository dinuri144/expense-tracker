"use client";
import React, { useState, useEffect } from "react";
import { Plus, Wallet, X, Loader2, Trash2, AlertCircle } from "lucide-react";

export default function BudgetsPage() {
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);

    // Add Budget Modal State
    const [showModal, setShowModal] = useState(false);
    const [category, setCategory] = useState("Food");
    const [limit, setLimit] = useState("");
    const [spent, setSpent] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // 1. Fetch Budgets from API
    const fetchBudgets = async () => {
        try {
            const res = await fetch("/api/budgets");
            if (res.ok) {
                const data = await res.json();
                setBudgets(data);
            }
        } catch (error) {
            console.error("Error fetching budgets:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBudgets();
    }, []);

    // 2. Handle Create Budget
    const handleCreateBudget = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await fetch("/api/budgets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    category,
                    limit: Number(limit),
                    spent: spent ? Number(spent) : 0,
                }),
            });

            if (res.ok) {
                setCategory("Food");
                setLimit("");
                setSpent("");
                setShowModal(false);
                fetchBudgets();
            } else {
                const err = await res.json();
                alert(err.error || "Failed to create budget");
            }
        } catch (error) {
            console.error("Error saving budget:", error);
        } finally {
            setSubmitting(false);
        }
    };

    // 3. Handle Delete Budget
    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this budget?")) return;

        try {
            const res = await fetch(`/api/budgets?id=${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                setBudgets(budgets.filter(b => b.id !== id && b._id !== id));
            } else {
                alert("Failed to delete budget");
            }
        } catch (error) {
            console.error("Error deleting budget:", error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Budgets</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Monitor your category-wise spending limits.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium shadow-lg shadow-indigo-600/20 transition"
                >
                    <Plus className="w-4 h-4" /> Set Budget
                </button>
            </div>

            {/* Budgets Grid */}
            {loading ? (
                <div className="flex justify-center items-center py-20 text-gray-400">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading budgets...
                </div>
            ) : budgets.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
                    <Wallet className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                    <h3 className="font-semibold text-lg">No budgets set</h3>
                    <p className="text-sm text-gray-500 mt-1">Create a budget to keep your expenses under control.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {budgets.map((b) => {
                        const currentSpent = b.spent || b.currentSpent || 0;
                        const budgetLimit = b.limit || b.targetLimit || 1;
                        const percent = Math.min(Math.round((currentSpent / budgetLimit) * 100), 100);
                        const isOver = currentSpent > budgetLimit;
                        const id = b.id || b._id;

                        return (
                            <div key={id} className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
                                            {b.category ? b.category.charAt(0).toUpperCase() : "B"}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-base">{b.category}</h3>
                                            <p className="text-xs text-gray-400">Monthly Limit</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(id)}
                                        className="p-1.5 hover:bg-rose-500/10 hover:text-rose-500 rounded-lg text-gray-400 transition"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="flex justify-between items-baseline">
                                    <span className="text-xl font-bold">${currentSpent} <span className="text-xs font-normal text-gray-400">/ ${budgetLimit}</span></span>
                                    <span className={`text-sm font-bold ${isOver ? "text-rose-500" : "text-indigo-600 dark:text-indigo-400"}`}>
                                        {percent}%
                                    </span>
                                </div>

                                <div className="w-full bg-gray-100 dark:bg-gray-800 h-2.5 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${isOver ? "bg-rose-500" : "bg-indigo-600"}`}
                                        style={{ width: `${percent}%` }}
                                    ></div>
                                </div>

                                {isOver && (
                                    <div className="flex items-center gap-1.5 text-xs text-rose-500 font-medium">
                                        <AlertCircle className="w-4 h-4" /> Budget exceeded by ${currentSpent - budgetLimit}!
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add Budget Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-md p-6 space-y-6 shadow-2xl">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold">Set New Budget</h2>
                            <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateBudget} className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-gray-500">Category Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Groceries, Entertainment"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    required
                                    className="w-full mt-1 px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-500">Monthly Limit ($)</label>
                                    <input
                                        type="number"
                                        placeholder="500"
                                        value={limit}
                                        onChange={(e) => setLimit(e.target.value)}
                                        required
                                        className="w-full mt-1 px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500">Already Spent ($)</label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={spent}
                                        onChange={(e) => setSpent(e.target.value)}
                                        className="w-full mt-1 px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium shadow-lg shadow-indigo-600/20 transition flex items-center gap-2 disabled:opacity-50"
                                >
                                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Save Budget
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}