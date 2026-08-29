"use client";
import React, { useState, useEffect } from "react";
import { Wallet, ArrowUpRight, ArrowDownLeft, Loader2, Receipt, Plus } from "lucide-react";

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [expenses, setExpenses] = useState([]);
    const [budgets, setBudgets] = useState([]);

    // Quick Transaction Form States
    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");
    const [type, setType] = useState("expense");
    const [category, setCategory] = useState("General");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [submitting, setSubmitting] = useState(false);

    // Fetch Data
    const fetchData = async () => {
        try {
            const [expRes, budRes] = await Promise.all([
                fetch("/api/expenses"),
                fetch("/api/budgets"),
            ]);

            if (expRes.ok) {
                const data = await expRes.json();
                setExpenses(data);
            }
            if (budRes.ok) {
                const data = await budRes.json();
                setBudgets(data);
            }
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Handle Quick Transaction Submit
    const handleQuickAdd = async (e) => {
        e.preventDefault();
        if (!title || !amount) return;
        setSubmitting(true);

        try {
            const res = await fetch("/api/expenses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    amount: Number(amount),
                    type,
                    category,
                    date,
                }),
            });

            if (res.ok) {
                setTitle("");
                setAmount("");
                fetchData();
            } else {
                alert("Failed to add transaction");
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setSubmitting(false);
        }
    };

    // Calculations
    const totalIncome = expenses
        .filter(t => (t.type || "").toLowerCase() === "income")
        .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

    const totalExpense = expenses
        .filter(t => (t.type || "").toLowerCase() === "expense")
        .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

    const netBalance = totalIncome - totalExpense;

    // Calculate total budget limit and spent for the top budget progress card
    const totalBudgetLimit = budgets.reduce((acc, curr) => acc + Number(curr.limit || 0), 0);
    const totalBudgetSpent = budgets.reduce((acc, curr) => acc + Number(curr.spent || curr.currentSpent || 0), 0);
    const budgetUsedPercent = totalBudgetLimit > 0 ? Math.min(Math.round((totalBudgetSpent / totalBudgetLimit) * 100), 100) : 38;

    const recentTransactions = expenses.slice(0, 4);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-40 text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin mr-3" /> Loading dashboard...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-medium text-gray-300">Welcome back, Nimesh 👋</h1>
                </div>
            </div>

            {/* Top 4 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#121624] p-5 rounded-2xl border border-gray-800 space-y-2">
                    <span className="text-sm text-gray-400">Total Income</span>
                    <div className="text-2xl font-bold text-emerald-400">${totalIncome.toLocaleString()}</div>
                    <p className="text-xs text-emerald-500">+12.5% from last month</p>
                </div>

                <div className="bg-[#121624] p-5 rounded-2xl border border-gray-800 space-y-2">
                    <span className="text-sm text-gray-400">Total Expenses</span>
                    <div className="text-2xl font-bold text-rose-500">${totalExpense.toLocaleString()}</div>
                    <p className="text-xs text-rose-500">-5.2% from last month</p>
                </div>

                <div className="bg-[#121624] p-5 rounded-2xl border border-gray-800 space-y-2">
                    <span className="text-sm text-gray-400">Net Balance</span>
                    <div className="text-2xl font-bold text-indigo-400">${netBalance.toLocaleString()}</div>
                    <p className="text-xs text-gray-400">Updated just now</p>
                </div>

                <div className="bg-[#121624] p-5 rounded-2xl border border-gray-800 space-y-3">
                    <div className="flex justify-between text-sm text-gray-400">
                        <span>Budget Used</span>
                        <span>{budgetUsedPercent}%</span>
                    </div>
                    <div className="text-2xl font-bold">{budgetUsedPercent}%</div>
                    <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${budgetUsedPercent}%` }}></div>
                    </div>
                </div>
            </div>

            {/* Middle Grid: Trend Chart & Quick Transaction */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Trend Chart Area */}
                <div className="lg:col-span-2 bg-[#121624] p-6 rounded-2xl border border-gray-800 space-y-4 flex flex-col justify-between">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-base">Income vs Expenses Trend</h3>
                        <span className="text-xs px-3 py-1 bg-gray-800 text-gray-400 rounded-lg">Last 30 days</span>
                    </div>
                    <div className="h-64 flex items-center justify-center border border-dashed border-gray-800 rounded-xl text-gray-500 text-sm">
                        [ Recharts Line Chart Visualization Area ]
                    </div>
                </div>

                {/* Quick Transaction Form */}
                <div className="bg-[#121624] p-6 rounded-2xl border border-gray-800 space-y-4">
                    <h3 className="font-semibold text-base">Quick Transaction</h3>
                    <form onSubmit={handleQuickAdd} className="space-y-3">
                        <div>
                            <label className="text-xs text-gray-400">Add Transaction</label>
                            <input
                                type="text"
                                placeholder="Description"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                className="w-full mt-1 px-3 py-2 bg-[#1a1f35] border border-gray-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <input
                                type="number"
                                placeholder="Amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                                className="w-full px-3 py-2 bg-[#1a1f35] border border-gray-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="px-3 py-2 bg-[#1a1f35] border border-gray-800 rounded-xl text-sm focus:outline-none"
                            >
                                <option value="General">General</option>
                                <option value="Food">Food</option>
                                <option value="Transport">Transport</option>
                                <option value="Shopping">Shopping</option>
                            </select>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="px-3 py-2 bg-[#1a1f35] border border-gray-800 rounded-xl text-sm focus:outline-none"
                            >
                                <option value="expense">Expense</option>
                                <option value="income">Income</option>
                            </select>
                        </div>
                        <div>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full px-3 py-2 bg-[#1a1f35] border border-gray-800 rounded-xl text-sm focus:outline-none"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition flex items-center justify-center gap-2"
                        >
                            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                            Add
                        </button>
                    </form>
                </div>
            </div>

            {/* Bottom Grid: Recent Transactions & Budget Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Transactions */}
                <div className="lg:col-span-2 bg-[#121624] p-6 rounded-2xl border border-gray-800 space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-base">Recent Transactions</h3>
                        <a href="/dashboard/transactions" className="text-xs text-indigo-400 hover:underline">View all →</a>
                    </div>

                    {recentTransactions.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 text-sm">No recent transactions.</div>
                    ) : (
                        <div className="space-y-3">
                            {recentTransactions.map((t) => {
                                const isIncome = (t.type || "").toLowerCase() === "income";
                                return (
                                    <div key={t.id || t._id} className="flex justify-between items-center p-3 bg-[#1a1f35]/50 rounded-xl border border-gray-800/50">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs ${isIncome ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-500"
                                                }`}>
                                                {isIncome ? "IN" : (t.category ? t.category.charAt(0).toUpperCase() : "EX")}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-medium">{t.title || t.description}</h4>
                                                <p className="text-xs text-gray-500">{t.category} • {t.date ? new Date(t.date).toLocaleDateString() : ""}</p>
                                            </div>
                                        </div>
                                        <span className={`font-bold text-sm ${isIncome ? "text-emerald-400" : "text-rose-500"}`}>
                                            {isIncome ? `+$${t.amount}` : `-$${t.amount}`}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Budget Status */}
                <div className="bg-[#121624] p-6 rounded-2xl border border-gray-800 space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-base">Budget Status</h3>
                        <a href="/dashboard/budgets" className="text-xs text-indigo-400 hover:underline">Manage</a>
                    </div>

                    {budgets.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 text-sm">No budgets configured.</div>
                    ) : (
                        <div className="space-y-4">
                            {budgets.slice(0, 3).map((b) => {
                                const spent = b.spent || 0;
                                const limit = b.limit || 1;
                                const pct = Math.min(Math.round((spent / limit) * 100), 100);
                                const isOver = spent > limit;

                                return (
                                    <div key={b.id || b._id} className="space-y-1.5">
                                        <div className="flex justify-between text-xs">
                                            <span className="font-medium">{b.category}</span>
                                            <span className="text-gray-400">${spent} / ${limit}</span>
                                        </div>
                                        <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${isOver ? "bg-rose-500" : "bg-amber-500"}`}
                                                style={{ width: `${pct}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}