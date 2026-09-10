"use client";
import React, { useState, useEffect } from "react";
import { Loader2, Tag, Plus, X, Trash2 } from "lucide-react";

export default function CategoriesPage() {
    const [loading, setLoading] = useState(true);
    const [expenses, setExpenses] = useState([]);
    const [budgets, setBudgets] = useState([]);
    const [customCategories, setCustomCategories] = useState([]);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [newCategoryType, setNewCategoryType] = useState("expense");
    const [submitting, setSubmitting] = useState(false);

    const fetchData = async () => {
        try {
            const [expRes, budRes] = await Promise.all([
                fetch("/api/expenses"),
                fetch("/api/budgets"),
            ]);

            if (expRes.ok) {
                const expData = await expRes.json();
                setExpenses(expData);
            }
            if (budRes.ok) {
                const budData = await budRes.json();
                setBudgets(budData);
            }
        } catch (error) {
            console.error("Error fetching categories data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const saved = localStorage.getItem("custom_categories");
        if (saved) {
            try {
                setCustomCategories(JSON.parse(saved));
            } catch (e) {
                // ignore
            }
        }
    }, []);

    const handleAddCategory = (e) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;
        setSubmitting(true);

        const newCat = {
            name: newCategoryName.trim(),
            type: newCategoryType,
        };

        const updated = [...customCategories, newCat];
        setCustomCategories(updated);
        localStorage.setItem("custom_categories", JSON.stringify(updated));

        setNewCategoryName("");
        setNewCategoryType("expense");
        setIsModalOpen(false);
        setSubmitting(false);
    };

    // Delete custom category handler
    const handleDeleteCategory = (categoryNameToDelete) => {
        if (!confirm(`Are you sure you want to delete "${categoryNameToDelete}"?`)) return;

        const updated = customCategories.filter(c => c.name !== categoryNameToDelete);
        setCustomCategories(updated);
        localStorage.setItem("custom_categories", JSON.stringify(updated));
    };

    // Collect only real database categories and custom added ones
    const incomeCategoriesSet = new Set();
    const expenseCategoriesSet = new Set();

    expenses.forEach(t => {
        if (t.category) {
            if ((t.type || "").toLowerCase() === "income") {
                incomeCategoriesSet.add(t.category);
            } else {
                expenseCategoriesSet.add(t.category);
            }
        }
    });

    budgets.forEach(b => {
        if (b.category) {
            expenseCategoriesSet.add(b.category);
        }
    });

    customCategories.forEach(c => {
        if (c.type === "income") {
            incomeCategoriesSet.add(c.name);
        } else {
            expenseCategoriesSet.add(c.name);
        }
    });

    const incomeCategories = Array.from(incomeCategoriesSet);
    const expenseCategories = Array.from(expenseCategoriesSet);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-40 text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin mr-3" /> Loading categories...
            </div>
        );
    }

    return (
        <div className="space-y-6 relative">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Categories</h1>
                    <p className="text-sm text-gray-400 mt-1">Organize your incomes and expenses into custom categories.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition flex items-center gap-2 shadow-lg shadow-indigo-600/20"
                >
                    <Plus className="w-4 h-4" /> Add Category
                </button>
            </div>

            {/* Income Categories Section */}
            <div className="bg-[#121624] p-6 rounded-2xl border border-gray-800 space-y-4">
                <h2 className="text-emerald-400 font-semibold text-base">Income Categories</h2>
                {incomeCategories.length === 0 ? (
                    <p className="text-xs text-gray-500">No income categories found. Add transactions or custom categories.</p>
                ) : (
                    <div className="flex flex-wrap gap-3">
                        {incomeCategories.map((cat, index) => {
                            const isCustom = customCategories.some(c => c.name === cat && c.type === "income");
                            return (
                                <div
                                    key={index}
                                    className="group flex items-center gap-2 px-4 py-2.5 bg-[#1a1f35] border border-gray-800 rounded-xl text-sm font-medium text-gray-200 hover:border-emerald-500/50 transition"
                                >
                                    <Tag className="w-4 h-4 text-emerald-400" />
                                    <span>{cat}</span>
                                    {isCustom && (
                                        <button
                                            onClick={() => handleDeleteCategory(cat)}
                                            className="ml-1 text-gray-500 hover:text-rose-400 transition"
                                            title="Delete Custom Category"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Expense Categories Section */}
            <div className="bg-[#121624] p-6 rounded-2xl border border-gray-800 space-y-4">
                <h2 className="text-rose-500 font-semibold text-base">Expense Categories</h2>
                {expenseCategories.length === 0 ? (
                    <p className="text-xs text-gray-500">No expense categories found. Add transactions or custom categories.</p>
                ) : (
                    <div className="flex flex-wrap gap-3">
                        {expenseCategories.map((cat, index) => {
                            const isCustom = customCategories.some(c => c.name === cat && c.type === "expense");
                            return (
                                <div
                                    key={index}
                                    className="group flex items-center gap-2 px-4 py-2.5 bg-[#1a1f35] border border-gray-800 rounded-xl text-sm font-medium text-gray-200 hover:border-rose-500/50 transition"
                                >
                                    <Tag className="w-4 h-4 text-rose-500" />
                                    <span>{cat}</span>
                                    {isCustom && (
                                        <button
                                            onClick={() => handleDeleteCategory(cat)}
                                            className="ml-1 text-gray-500 hover:text-rose-400 transition"
                                            title="Delete Custom Category"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Add Category Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-[#121624] border border-gray-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-lg">Add New Category</h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAddCategory} className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">Category Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Groceries, Bonus"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    required
                                    className="w-full px-3 py-2.5 bg-[#1a1f35] border border-gray-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-white"
                                />
                            </div>

                            <div>
                                <label className="text-xs text-gray-400 block mb-1">Category Type</label>
                                <select
                                    value={newCategoryType}
                                    onChange={(e) => setNewCategoryType(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-[#1a1f35] border border-gray-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-white"
                                >
                                    <option value="expense">Expense Category</option>
                                    <option value="income">Income Category</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition flex items-center gap-2"
                                >
                                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Save Category
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}