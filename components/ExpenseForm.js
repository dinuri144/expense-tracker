"use client";
import React, { useState, useEffect } from "react";

export default function ExpenseForm({ onAdd, onUpdate, editingItem, onCancelEdit }) {
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("General");
    const [type, setType] = useState("expense");
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

    useEffect(() => {
        if (editingItem) {
            setDescription(editingItem.description || "");
            setAmount(editingItem.amount?.toString() || "");
            setCategory(editingItem.category || "General");
            setType(editingItem.type || "expense");
            setDate(editingItem.date || new Date().toISOString().slice(0, 10));
        }
    }, [editingItem]);

    function reset() {
        setDescription("");
        setAmount("");
        setCategory("General");
        setType("expense");
        setDate(new Date().toISOString().slice(0, 10));
    }

    function handleSubmit(e) {
        e.preventDefault();
        if (!description || !amount) return;

        const item = {
            description,
            amount: parseFloat(amount),
            category,
            type,
            date,
        };

        if (editingItem) {
            onUpdate({ ...item, id: editingItem.id || editingItem._id });
        } else {
            onAdd(item);
        }
        reset();
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                {editingItem ? "Edit Transaction" : "Add Transaction"}
            </h3>

            <div className="space-y-3">
                <input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description"
                    className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    required
                />

                <input
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    type="number"
                    step="0.01"
                    placeholder="Amount"
                    className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    required
                />

                <div className="grid grid-cols-2 gap-3">
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm"
                    >
                        <option>General</option>
                        <option>Food</option>
                        <option>Transport</option>
                        <option>Rent</option>
                        <option>Salary</option>
                        <option>Shopping</option>
                        <option>Other</option>
                    </select>

                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm"
                    >
                        <option value="expense">Expense</option>
                        <option value="income">Income</option>
                    </select>
                </div>

                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm"
                />
            </div>

            <div className="flex gap-2 justify-end">
                {editingItem && (
                    <button
                        type="button"
                        onClick={() => {
                            reset();
                            onCancelEdit && onCancelEdit();
                        }}
                        className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 rounded-lg transition"
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition"
                >
                    {editingItem ? "Update" : "Add"}
                </button>
            </div>
        </form>
    );
}