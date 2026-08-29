"use client";
import React from "react";

function currency(n) {
    return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 });
}

export default function SummaryCard({ expenses = [] }) {
    const totalIncome = expenses.filter((e) => e.type === "income").reduce((s, e) => s + Number(e.amount), 0);
    const totalExpense = expenses.filter((e) => e.type === "expense").reduce((s, e) => s + Number(e.amount), 0);
    const balance = totalIncome - totalExpense;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Income</div>
                <div className="mt-2 text-2xl font-bold text-green-600">{currency(totalIncome)}</div>
            </div>

            <div className="p-5 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Expense</div>
                <div className="mt-2 text-2xl font-bold text-red-500">{currency(totalExpense)}</div>
            </div>

            <div className="p-5 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Balance</div>
                <div className={`mt-2 text-2xl font-bold ${balance < 0 ? "text-red-500" : "text-indigo-600"}`}>
                    {currency(balance)}
                </div>
            </div>
        </div>
    );
}