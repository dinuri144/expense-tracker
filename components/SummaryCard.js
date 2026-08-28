"use client";
import React from "react";

function currency(n) {
    return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 });
}

export default function SummaryCard({ expenses = [] }) {
    const totalIncome = expenses.filter(e => e.type === 'income').reduce((s, e) => s + Number(e.amount), 0);
    const totalExpense = expenses.filter(e => e.type === 'expense').reduce((s, e) => s + Number(e.amount), 0);
    const balance = totalIncome - totalExpense;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
                <div className="text-sm text-gray-500">Total Income</div>
                <div className="mt-2 text-2xl font-semibold text-green-600">{currency(totalIncome)}</div>
            </div>

            <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
                <div className="text-sm text-gray-500">Total Expense</div>
                <div className="mt-2 text-2xl font-semibold text-red-600">{currency(totalExpense)}</div>
            </div>

            <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
                <div className="text-sm text-gray-500">Balance</div>
                <div className={`mt-2 text-2xl font-semibold ${balance < 0 ? 'text-red-600' : 'text-indigo-600'}`}>{currency(balance)}</div>
            </div>
        </div>
    );
}
