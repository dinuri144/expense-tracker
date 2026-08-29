"use client";
import React from "react";

export default function ExpensesTable({ items = [], onDelete, onEdit }) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-16 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="text-4xl">📭</div>
                                        <p className="text-gray-500 dark:text-gray-400 font-medium">No transactions yet</p>
                                        <p className="text-sm text-gray-400">Add your first income or expense to get started</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            items.map((item) => {
                                const uniqueId = item.id || item._id;
                                return (
                                    <tr key={uniqueId} className="hover:bg-gray-50 dark:hover:bg-gray-900/40 transition">
                                        <td className="px-4 py-3.5 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                            {item.date}
                                        </td>
                                        <td className="px-4 py-3.5 text-sm text-gray-800 dark:text-gray-200 font-medium">
                                            {item.description}
                                        </td>
                                        <td className="px-4 py-3.5 text-sm">
                                            <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                                {item.category}
                                            </span>
                                        </td>
                                        <td className={`px-4 py-3.5 text-sm font-semibold text-right ${item.type === "income" ? "text-green-600" : "text-red-500"}`}>
                                            {item.type === "income" ? "+" : "-"}${Number(item.amount).toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3.5 text-sm text-center">
                                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${item.type === "income" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
                                                {item.type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 text-sm text-center space-x-2">
                                            <button
                                                onClick={() => onEdit && onEdit(item)}
                                                className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 font-medium text-xs"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => onDelete(uniqueId)}
                                                className="text-red-500 hover:text-red-700 font-medium text-xs"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}