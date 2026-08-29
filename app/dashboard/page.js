"use client";
import React, { useState, useEffect, useRef } from "react";
import Navbar from "../../components/Navbar";
import BudgetForm from "../../components/BudgetForm";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Dashboard() {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");

    // Dropdown එක පේනවද නැද්ද බලාගන්න state එක
    const [exportOpen, setExportOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Dropdown එකෙන්පිටින් ක්ලික් කළොත් ඒක ක්ලෝස් වෙන්න
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setExportOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        loadExpenses();
    }, []);

    async function loadExpenses() {
        try {
            const token = localStorage.getItem('dev:token');
            const res = await fetch('/api/expenses', { headers: { Authorization: token ? `Bearer ${token}` : '' } });
            if (res.ok) {
                const data = await res.json();
                setExpenses(data || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    // CSV විදිහට ඩවුන්ලෝඩ් කිරීම
    const exportCSV = () => {
        setExportOpen(false);
        if (expenses.length === 0) return alert('No data to export');

        const headers = ["Date", "Description", "Category", "Type", "Amount"];
        const rows = expenses.map(e => [
            new Date(e.date || e.createdAt).toLocaleDateString(),
            `"${(e.description || '').replace(/"/g, '""')}"`,
            e.category || 'General',
            e.type || 'expense',
            e.amount || 0
        ]);

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "expenses.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // PDF විදිහට ඩවුන්ලෝඩ් කිරීම
    const exportPDF = () => {
        setExportOpen(false);
        if (expenses.length === 0) return alert('No data to export');

        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("Expense Tracker Report", 14, 20);

        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);

        const tableColumn = ["Date", "Description", "Category", "Type", "Amount"];
        const tableRows = [];

        expenses.forEach(exp => {
            const dateStr = new Date(exp.date || exp.createdAt).toLocaleDateString();
            tableRows.push([
                dateStr,
                exp.description || "-",
                exp.category || "General",
                exp.type || "expense",
                `${exp.type === 'expense' ? '-' : '+'}${exp.amount}`
            ]);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 35,
            theme: 'grid',
            styles: { fontSize: 9 },
            headStyles: { fillColor: [79, 70, 229] }
        });

        doc.save("expense-report.pdf");
    };

    // Filter logic
    const filteredExpenses = expenses.filter(e => {
        const matchesSearch = (e.description || '').toLowerCase().includes(search.toLowerCase());
        const matchesCategory = categoryFilter === 'All' || (e.category || 'General') === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const totalIncome = expenses.filter(e => e.type === 'income').reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
    const totalExpense = expenses.filter(e => e.type === 'expense').reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
    const balance = totalIncome - totalExpense;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <Navbar />
            <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
                <div>
                    <h1 className="text-3xl font-extrabold">Dashboard</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Overview of your finances</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
                        <div className="text-sm text-gray-500">Total Income</div>
                        <div className="text-2xl font-bold text-green-600">${totalIncome.toFixed(2)}</div>
                    </div>
                    <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
                        <div className="text-sm text-gray-500">Total Expense</div>
                        <div className="text-2xl font-bold text-red-500">${totalExpense.toFixed(2)}</div>
                    </div>
                    <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
                        <div className="text-sm text-gray-500">Balance</div>
                        <div className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                            ${balance.toFixed(2)}
                        </div>
                    </div>
                </div>

                {/* Search, Filters and Export Dropdown */}
                <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-gray-800 p-4 rounded shadow">
                    <input
                        type="text"
                        placeholder="Search description..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="flex-1 min-w-[200px] px-3 py-2 border rounded bg-gray-50 dark:bg-gray-900 dark:border-gray-700"
                    />

                    {/* Export Dropdown Button */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setExportOpen(!exportOpen)}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-medium text-sm flex items-center gap-2 transition"
                        >
                            Export ▾
                        </button>

                        {exportOpen && (
                            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded shadow-lg z-10 py-1">
                                <button
                                    onClick={exportCSV}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600"
                                >
                                    Export as CSV
                                </button>
                                <button
                                    onClick={exportPDF}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600"
                                >
                                    Export as PDF
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Transactions Table & Forms */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-4 rounded shadow overflow-x-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold">Transactions</h3>
                            <select
                                value={categoryFilter}
                                onChange={e => setCategoryFilter(e.target.value)}
                                className="px-2 py-1 border rounded bg-gray-50 dark:bg-gray-900 dark:border-gray-700 text-sm"
                            >
                                <option value="All">All Categories</option>
                                <option value="Food">Food</option>
                                <option value="General">General</option>
                                <option value="Rent">Rent</option>
                                <option value="Utilities">Utilities</option>
                            </select>
                        </div>

                        {loading ? (
                            <p className="text-center py-4 text-gray-500">Loading...</p>
                        ) : filteredExpenses.length === 0 ? (
                            <p className="text-center py-4 text-gray-500">No transactions found.</p>
                        ) : (
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b dark:border-gray-700 text-gray-500">
                                        <th className="pb-2">DATE</th>
                                        <th className="pb-2">DESCRIPTION</th>
                                        <th className="pb-2">CATEGORY</th>
                                        <th className="pb-2">AMOUNT</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y dark:divide-gray-700">
                                    {filteredExpenses.map(e => (
                                        <tr key={e._id || e.id}>
                                            <td className="py-3">{new Date(e.date || e.createdAt).toLocaleDateString()}</td>
                                            <td className="py-3">{e.description}</td>
                                            <td className="py-3">
                                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                                                    {e.category || 'General'}
                                                </span>
                                            </td>
                                            <td className={`py-3 font-medium ${e.type === 'expense' ? 'text-red-500' : 'text-green-600'}`}>
                                                {e.type === 'expense' ? '-' : '+'}${Number(e.amount).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Right Column: Add Form & Budget */}
                    <div className="space-y-6">
                        <BudgetForm onSaved={loadExpenses} />
                    </div>
                </div>
            </main>
        </div>
    );
}