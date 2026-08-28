"use client";
import React from "react";

export default function ExpensesTable({ items = [], onDelete }) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Date</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Description</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Category</th>
                        <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">Amount</th>
                        <th className="px-4 py-2 text-center text-sm font-medium text-gray-500">Type</th>
                        <th className="px-4 py-2 text-center text-sm font-medium text-gray-500">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {items.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="px-4 py-6 text-center text-gray-500">No transactions yet</td>
                        </tr>
                    ) : (
                        items.map(item => (
                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{item.date}</td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{item.description}</td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{item.category}</td>
                                <td className={`px-4 py-3 text-sm font-medium text-right ${item.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>${Number(item.amount).toFixed(2)}</td>
                                <td className="px-4 py-3 text-sm text-center text-gray-600 dark:text-gray-300">{item.type}</td>
                                <td className="px-4 py-3 text-sm text-center">
                                    <button onClick={() => onDelete(item.id)} className="text-sm text-red-600 hover:underline">Delete</button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
