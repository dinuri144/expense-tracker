"use client";
import React, { useState, useEffect } from "react";
import { Plus, Search, Trash2, Edit3, Loader2, X, Receipt } from "lucide-react";

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("ALL");

    // Add Transaction Modal State
    const [showModal, setShowModal] = useState(false);
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [type, setType] = useState("expense"); // expense or income
    const [category, setCategory] = useState("Food");
    const [date, setDate] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Edit Modal States (මෙම කොටස අලුතින් එකතු විය යුතුය)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentEditingId, setCurrentEditingId] = useState(null);
    const [editFormData, setEditFormData] = useState({
        description: '',
        amount: '',
        category: 'General',
        type: 'expense',
        date: '',
    });

    const [categories, setCategories] = useState(["Food", "Transport", "Salary", "General"]);
    const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");

    // 1. Fetch Transactions from API
    const fetchTransactions = async () => {
        try {
            const res = await fetch("/api/expenses");
            if (res.ok) {
                const data = await res.json();
                setTransactions(data);
            }
        } catch (error) {
            console.error("Error fetching transactions:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    // Handle Create New Category
    const handleCreateCategory = (e) => {
        e.preventDefault();
        if (newCategoryName.trim() && !category.includes(newCategoryName.trim())) {
            const updatedCategories = [...category, newCategoryName.trim()];
            setCategory(updatedCategories);
            setCategory(newCategoryName.trim());
            setNewCategoryName("");
            setIsAddingNewCategory(false);
        }
    };

    // 2. Handle Add Transaction
    const handleCreateTransaction = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await fetch("/api/expenses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    description,
                    amount: Number(amount),
                    type,
                    category,
                    date: date || new Date().toISOString().split("T")[0],
                }),
            });

            if (res.ok) {
                setDescription("");
                setAmount("");
                setShowModal(false);
                fetchTransactions();
            } else {
                const err = await res.json();
                alert(err.error || "Failed to add transaction");
            }
        } catch (error) {
            console.error("Error saving transaction:", error);
        } finally {
            setSubmitting(false);
        }
    };

    // Edit Modal Open Handler (මෙම ෆන්ක්ෂන් එක එකතු කරන්න)
    const handleOpenEdit = (transaction) => {
        setCurrentEditingId(transaction.id || transaction._id);
        setEditFormData({
            description: transaction.title || transaction.description,
            amount: transaction.amount,
            category: transaction.category || 'General',
            type: transaction.type || 'expense',
            date: transaction.date ? transaction.date.split("T")[0] : '',
        });
        setIsEditModalOpen(true);
    };

    // Update Submit Handler (මෙම ෆන්ක්ෂන් එක එකතු කරන්න)
    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/expenses', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: currentEditingId,
                    ...editFormData,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setIsEditModalOpen(false);
                fetchTransactions();
            } else {
                alert(data.error || 'Failed to update transaction');
            }
        } catch (err) {
            console.error('Error updating transaction:', err);
        }
    };

    // 3. Handle Delete Transaction
    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this transaction?")) return;

        try {
            const res = await fetch(`/api/expenses?id=${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                setTransactions(transactions.filter(t => t.id !== id && t._id !== id));
            } else {
                alert("Failed to delete transaction");
            }
        } catch (error) {
            console.error("Error deleting transaction:", error);
        }
    };

    // Filter Transactions based on search and type
    const filteredTransactions = transactions.filter(t => {
        const matchesSearch = (t.title || t.description || "").toLowerCase().includes(search.toLowerCase()) ||
            (t.category || "").toLowerCase().includes(search.toLowerCase());
        const matchesType = typeFilter === "ALL" || (t.type || "").toUpperCase() === typeFilter.toUpperCase();
        return matchesSearch && matchesType;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Transactions</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Manage, search, and filter all your incomes and expenses.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium shadow-lg shadow-indigo-600/20 transition"
                >
                    <Plus className="w-4 h-4" /> Add Transaction
                </button>
            </div>

            {/* Filters and Search Bar */}
            <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search transactions..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="w-full sm:w-auto px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none"
                    >
                        <option value="ALL">All Types</option>
                        <option value="INCOME">Income</option>
                        <option value="EXPENSE">Expense</option>
                    </select>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex justify-center items-center py-20 text-gray-400">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading transactions...
                    </div>
                ) : filteredTransactions.length === 0 ? (
                    <div className="text-center py-16">
                        <Receipt className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                        <h3 className="font-semibold text-lg">No transactions found</h3>
                        <p className="text-sm text-gray-500 mt-1">Try changing your search filters or add a new transaction.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-400 uppercase bg-gray-50/50 dark:bg-gray-800/30">
                                    <th className="py-3.5 px-6">Date</th>
                                    <th className="py-3.5 px-6">Description</th>
                                    <th className="py-3.5 px-6">Category</th>
                                    <th className="py-3.5 px-6">Type</th>
                                    <th className="py-3.5 px-6">Amount</th>
                                    <th className="py-3.5 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800 text-sm">
                                {filteredTransactions.map((t) => {
                                    const isIncome = (t.type || "").toLowerCase() === "income";
                                    const formattedDate = t.date ? new Date(t.date).toLocaleDateString() : "Recent";
                                    const id = t.id || t._id;

                                    return (
                                        <tr key={id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition">
                                            <td className="py-4 px-6 text-gray-500 text-xs">{formattedDate}</td>
                                            <td className="py-4 px-6 font-medium">{t.title || t.description}</td>
                                            <td className="py-4 px-6">
                                                <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300">
                                                    {t.category || "General"}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${isIncome ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-500"}`}>
                                                    {isIncome ? "Income" : "Expense"}
                                                </span>
                                            </td>
                                            <td className={`py-4 px-6 font-bold ${isIncome ? "text-emerald-600" : "text-gray-900 dark:text-white"}`}>
                                                {isIncome ? `+$${t.amount}` : `-$${t.amount}`}
                                            </td>
                                            <td className="py-4 px-6 text-right space-x-1">
                                                {/* Edit Button */}
                                                <button
                                                    onClick={() => handleOpenEdit(t)}
                                                    className="p-1.5 hover:bg-indigo-500/10 hover:text-indigo-500 rounded-lg text-gray-400 transition"
                                                    title="Edit"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>

                                                {/* Delete Button */}
                                                <button
                                                    onClick={() => handleDelete(id)}
                                                    className="p-1.5 hover:bg-rose-500/10 hover:text-rose-500 rounded-lg text-gray-400 transition"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add Transaction Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-md p-6 space-y-6 shadow-2xl">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold">Add Transaction</h2>
                            <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateTransaction} className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-gray-500">Description / Title</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Grocery Shopping"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                    className="w-full mt-1 px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-500">Amount ($)</label>
                                    <input
                                        type="number"
                                        placeholder="150"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        required
                                        className="w-full mt-1 px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500">Type</label>
                                    <select
                                        value={type}
                                        onChange={(e) => setType(e.target.value)}
                                        className="w-full mt-1 px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none"
                                    >
                                        <option value="expense">Expense</option>
                                        <option value="income">Income</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    {!isAddingNewCategory ? (
                                        <select
                                            value={category}
                                            onChange={(e) => {
                                                if (e.target.value === "__add_new__") {
                                                    setIsAddingNewCategory(true);
                                                } else {
                                                    setCategory(e.target.value);
                                                }
                                            }}
                                            className="px-3 py-2 bg-[#1a1f35] border border-gray-800 rounded-xl text-sm focus:outline-none text-gray-200"
                                        >
                                            {categories.map((cat, idx) => (
                                                <option key={idx} value={cat}>{cat}</option>
                                            ))}
                                            <option value="__add_new__" className="text-indigo-400 font-semibold">+ Add New Category</option>
                                        </select>
                                    ) : (
                                        <div className="flex gap-1">
                                            <input
                                                type="text"
                                                placeholder="New category..."
                                                value={newCategoryName}
                                                onChange={(e) => setNewCategoryName(e.target.value)}
                                                className="w-full px-2 py-1 bg-[#1a1f35] border border-indigo-500 rounded-xl text-xs focus:outline-none text-white"
                                                autoFocus
                                            />
                                            <button
                                                type="button"
                                                onClick={handleCreateCategory}
                                                className="px-2 py-1 bg-indigo-600 text-white rounded-lg text-xs"
                                            >
                                                Add
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setIsAddingNewCategory(false)}
                                                className="px-2 py-1 bg-gray-700 text-gray-300 rounded-lg text-xs"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500">Date</label>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full mt-1 px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none"
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
                                    Add Transaction
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Transaction Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-md p-6 space-y-6 shadow-2xl">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold">Edit Transaction</h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateSubmit} className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-gray-500">Description / Title</label>
                                <input
                                    type="text"
                                    value={editFormData.description}
                                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                                    required
                                    className="w-full mt-1 px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-500">Amount ($)</label>
                                    <input
                                        type="number"
                                        value={editFormData.amount}
                                        onChange={(e) => setEditFormData({ ...editFormData, amount: e.target.value })}
                                        required
                                        className="w-full mt-1 px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500">Type</label>
                                    <select
                                        value={editFormData.type}
                                        onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value })}
                                        className="w-full mt-1 px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none"
                                    >
                                        <option value="expense">Expense</option>
                                        <option value="income">Income</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-500">Category</label>
                                    <input
                                        type="text"
                                        value={editFormData.category}
                                        onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                                        className="w-full mt-1 px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500">Date</label>
                                    <input
                                        type="date"
                                        value={editFormData.date}
                                        onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                                        className="w-full mt-1 px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium shadow-lg shadow-indigo-600/20 transition flex items-center gap-2"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}