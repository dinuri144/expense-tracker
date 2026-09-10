"use client";
import React, { useState, useEffect } from "react";
import { Loader2, BarChart3, PieChart, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import useCurrency from "../../../hooks/useCurrency";

export default function AnalyticsPage() {
    const currency = useCurrency();
    const [loading, setLoading] = useState(true);
    const [expenses, setExpenses] = useState([]);
    const [budgets, setBudgets] = useState([]);

    useEffect(() => {
        const fetchAnalyticsData = async () => {
            try {
                const [expRes, budRes] = await Promise.all([
                    fetch("/api/expenses"),
                    fetch("/api/budgets"),
                ]);
                if (expRes.ok) setExpenses(await expRes.json());
                if (budRes.ok) setBudgets(await budRes.json());
            } catch (error) {
                console.error("Error fetching analytics data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalyticsData();
    }, []);

    const totalIncome = expenses
        .filter((t) => (t.type || "").toLowerCase() === "income")
        .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

    const totalExpense = expenses
        .filter((t) => (t.type || "").toLowerCase() === "expense")
        .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

    const savingsRate =
        totalIncome > 0
            ? Math.max(0, Math.round(((totalIncome - totalExpense) / totalIncome) * 100))
            : 0;

    const categoryTotals = expenses
        .filter((t) => (t.type || "").toLowerCase() === "expense")
        .reduce((acc, curr) => {
            const cat = curr.category || "General";
            acc[cat] = (acc[cat] || 0) + Number(curr.amount || 0);
            return acc;
        }, {});

    const categoryArray = Object.keys(categoryTotals)
        .map((cat) => ({
            category: cat,
            amount: categoryTotals[cat],
            percentage: totalExpense > 0 ? Math.round((categoryTotals[cat] / totalExpense) * 100) : 0,
        }))
        .sort((a, b) => b.amount - a.amount);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-40 text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin mr-3" /> Loading analytics...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Financial Analytics</h1>
                <p className="text-sm text-gray-400">
                    Deep dive into your spending habits and category distribution from database records.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#121624] p-6 rounded-2xl border border-gray-800 space-y-2">
                    <span className="text-sm text-gray-400">Savings Rate</span>
                    <div className="text-3xl font-bold text-indigo-400">{savingsRate}%</div>
                    <p className="text-xs text-gray-500">From total income</p>
                </div>

                <div className="bg-[#121624] p-6 rounded-2xl border border-gray-800 space-y-2">
                    <span className="text-sm text-gray-400">Total Volume Flow</span>
                    <div className="text-3xl font-bold text-emerald-400">
                        {currency}{(totalIncome + totalExpense).toLocaleString()}
                    </div>
                    <p className="text-xs text-gray-500">Combined income & expenses</p>
                </div>

                <div className="bg-[#121624] p-6 rounded-2xl border border-gray-800 space-y-2">
                    <span className="text-sm text-gray-400">Active Categories</span>
                    <div className="text-3xl font-bold text-amber-400">{categoryArray.length}</div>
                    <p className="text-xs text-gray-500">Categories with recorded expenses</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#121624] p-6 rounded-2xl border border-gray-800 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-base flex items-center gap-2">
                            <PieChart className="w-5 h-5 text-indigo-400" /> Expenses by Category
                        </h3>
                        <span className="text-xs text-gray-400">
                            Total Spent: {currency}{totalExpense.toLocaleString()}
                        </span>
                    </div>

                    {categoryArray.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 text-sm">No expense records found to analyze.</div>
                    ) : (
                        <div className="space-y-4">
                            {categoryArray.map((item, idx) => (
                                <div key={idx} className="space-y-1.5">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium text-gray-300">{item.category}</span>
                                        <span className="text-gray-400">
                                            {currency}{item.amount.toLocaleString()} ({item.percentage}%)
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-800 h-2.5 rounded-full overflow-hidden">
                                        <div
                                            className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                                            style={{ width: `${item.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-[#121624] p-6 rounded-2xl border border-gray-800 space-y-4 flex flex-col justify-between">
                    <div>
                        <h3 className="font-semibold text-base flex items-center gap-2 mb-2">
                            <BarChart3 className="w-5 h-5 text-emerald-400" /> Cash Flow Overview
                        </h3>
                        <p className="text-xs text-gray-400">Summary of total earnings versus spending.</p>
                    </div>

                    <div className="space-y-4 py-4">
                        <div className="p-4 bg-[#1a1f35] rounded-xl border border-gray-800 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                                    <ArrowUpRight className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium">Total Inflows</h4>
                                    <p className="text-xs text-gray-400">All recorded income</p>
                                </div>
                            </div>
                            <span className="text-lg font-bold text-emerald-400">
                                +{currency}{totalIncome.toLocaleString()}
                            </span>
                        </div>

                        <div className="p-4 bg-[#1a1f35] rounded-xl border border-gray-800 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-rose-500/10 text-rose-500 rounded-lg">
                                    <ArrowDownLeft className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium">Total Outflows</h4>
                                    <p className="text-xs text-gray-400">All recorded expenses</p>
                                </div>
                            </div>
                            <span className="text-lg font-bold text-rose-500">
                                -{currency}{totalExpense.toLocaleString()}
                            </span>
                        </div>
                    </div>

                    <div className="text-xs text-gray-500 text-center">
                        Analytics update automatically based on database transactions.
                    </div>
                </div>
            </div>
        </div>
    );
}