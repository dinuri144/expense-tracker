"use client";
import React, { useState } from "react";

export default function ExpenseForm({ onAdd }) {
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("General");
    const [type, setType] = useState("expense");
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

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
            id: Date.now().toString(),
            description,
            amount: parseFloat(amount),
            category,
            type,
            date,
        };
        onAdd(item);
        reset();
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-4 rounded shadow space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" className="col-span-2 px-3 py-2 border rounded bg-gray-50 dark:bg-gray-900" />
                <input value={amount} onChange={e => setAmount(e.target.value)} type="number" step="0.01" placeholder="Amount" className="px-3 py-2 border rounded bg-gray-50 dark:bg-gray-900" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <select value={category} onChange={e => setCategory(e.target.value)} className="px-3 py-2 border rounded bg-gray-50 dark:bg-gray-900">
                    <option>General</option>
                    <option>Food</option>
                    <option>Transport</option>
                    <option>Rent</option>
                    <option>Salary</option>
                    <option>Other</option>
                </select>

                <select value={type} onChange={e => setType(e.target.value)} className="px-3 py-2 border rounded bg-gray-50 dark:bg-gray-900">
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                </select>

                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="px-3 py-2 border rounded bg-gray-50 dark:bg-gray-900" />
            </div>

            <div className="flex justify-end">
                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">Add</button>
            </div>
        </form>
    );
}
