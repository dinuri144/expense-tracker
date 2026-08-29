"use client";
import React, { useState, useEffect } from "react";
import { Loader2, FileText, Download, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ReportsPage() {
    const [loading, setLoading] = useState(true);
    const [expenses, setExpenses] = useState([]);

    const fetchReportsData = async () => {
        try {
            const res = await fetch("/api/expenses");
            if (res.ok) {
                const data = await res.json();
                setExpenses(data);
            }
        } catch (error) {
            console.error("Error fetching reports data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReportsData();
    }, []);

    const totalIncome = expenses
        .filter(t => (t.type || "").toLowerCase() === "income")
        .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

    const totalExpense = expenses
        .filter(t => (t.type || "").toLowerCase() === "expense")
        .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

    const netSavings = totalIncome - totalExpense;

    // Export as true CSV File for Excel
    const exportToCSV = () => {
        if (expenses.length === 0) {
            alert("No data available to export.");
            return;
        }

        const headers = ["Description,Category,Type,Date,Amount\n"];
        const rows = expenses.map(t => {
            const desc = `"${(t.title || t.description || "").replace(/"/g, '""')}"`;
            const cat = `"${(t.category || "General").replace(/"/g, '""')}"`;
            const type = t.type || "Expense";
            const date = t.date ? new Date(t.date).toLocaleDateString() : "";
            const amount = t.amount || 0;
            return `${desc},${cat},${type},${date},${amount}`;
        });

        const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `financial_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Export directly as PDF using autoTable function
    const exportToPDF = () => {
        if (expenses.length === 0) {
            alert("No data available to export.");
            return;
        }

        const doc = new jsPDF();

        // Title & Header info
        doc.setFontSize(20);
        doc.setTextColor(40, 40, 40);
        doc.text("Financial Report", 14, 20);

        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);

        // Summary text
        doc.setFontSize(12);
        doc.setTextColor(40, 40, 40);
        doc.text(`Total Income: +$${totalIncome}`, 14, 40);
        doc.text(`Total Expenses: -$${totalExpense}`, 14, 48);
        doc.text(`Net Balance: $${netSavings}`, 14, 56);

        // Table Data mapping
        const tableColumn = ["Description", "Category", "Type", "Date", "Amount"];
        const tableRows = [];

        expenses.forEach(t => {
            const desc = t.title || t.description || "";
            const cat = t.category || "General";
            const type = t.type || "Expense";
            const date = t.date ? new Date(t.date).toLocaleDateString() : "";
            const amount = (type.toLowerCase() === "income" ? "+$" : "-$") + (t.amount || 0);

            tableRows.push([desc, cat, type, date, amount]);
        });

        // Generate AutoTable correctly
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 66,
            theme: "grid",
            headStyles: { fillColor: [79, 70, 229] }, // Indigo color matching theme
            styles: { fontSize: 10, cellPadding: 4 },
        });

        // Save the PDF
        doc.save(`financial_report_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-40 text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin mr-3" /> Loading reports...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Financial Reports</h1>
                    <p className="text-sm text-gray-400">Summary and exportable financial performance logs.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={exportToCSV}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition flex items-center gap-2 shadow-lg shadow-emerald-600/20"
                    >
                        <Download className="w-4 h-4" /> Export CSV
                    </button>
                    <button
                        onClick={exportToPDF}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition flex items-center gap-2 shadow-lg shadow-indigo-600/20"
                    >
                        <FileText className="w-4 h-4" /> Download PDF
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#121624] p-6 rounded-2xl border border-gray-800 space-y-2">
                    <span className="text-sm text-gray-400">Total Income</span>
                    <div className="text-3xl font-bold text-emerald-400">+${totalIncome.toLocaleString()}</div>
                    <p className="text-xs text-gray-500">All recorded inflows</p>
                </div>

                <div className="bg-[#121624] p-6 rounded-2xl border border-gray-800 space-y-2">
                    <span className="text-sm text-gray-400">Total Expenses</span>
                    <div className="text-3xl font-bold text-rose-500">-${totalExpense.toLocaleString()}</div>
                    <p className="text-xs text-gray-500">All recorded outflows</p>
                </div>

                <div className="bg-[#121624] p-6 rounded-2xl border border-gray-800 space-y-2">
                    <span className="text-sm text-gray-400">Net Balance</span>
                    <div className="text-3xl font-bold text-indigo-400">${netSavings.toLocaleString()}</div>
                    <p className="text-xs text-gray-500">Overall savings balance</p>
                </div>
            </div>

            {/* Detailed Transactions Statement */}
            <div className="bg-[#121624] p-6 rounded-2xl border border-gray-800 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-base flex items-center gap-2">
                        <FileText className="w-5 h-5 text-indigo-400" /> Transaction Statement History
                    </h3>
                    <span className="text-xs text-gray-400">{expenses.length} total records</span>
                </div>

                {expenses.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 text-sm">No transactions found to generate reports.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-800 text-xs text-gray-400">
                                    <th className="py-3 px-4 font-medium">Description</th>
                                    <th className="py-3 px-4 font-medium">Category</th>
                                    <th className="py-3 px-4 font-medium">Type</th>
                                    <th className="py-3 px-4 font-medium">Date</th>
                                    <th className="py-3 px-4 font-medium text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800/60 text-sm">
                                {expenses.map((t) => {
                                    const isIncome = (t.type || "").toLowerCase() === "income";
                                    return (
                                        <tr key={t.id || t._id} className="hover:bg-[#1a1f35]/50 transition">
                                            <td className="py-3 px-4 font-medium text-gray-200">{t.title || t.description}</td>
                                            <td className="py-3 px-4 text-gray-400">{t.category || "General"}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2.5 py-1 rounded-lg text-xs font-medium inline-flex items-center gap-1 ${isIncome ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-500"
                                                    }`}>
                                                    {isIncome ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
                                                    {isIncome ? "Income" : "Expense"}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-gray-400">{t.date ? new Date(t.date).toLocaleDateString() : ""}</td>
                                            <td className={`py-3 px-4 text-right font-bold ${isIncome ? "text-emerald-400" : "text-rose-500"}`}>
                                                {isIncome ? `+$${t.amount}` : `-$${t.amount}`}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}