"use client";
import React, { useState, useEffect } from "react";
import { Wallet, ArrowUpRight, ArrowDownLeft, Loader2, Receipt, Plus } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// AI Insights Section Component
function AIInsightsSection({ transactions }) {
    const [insights, setInsights] = useState("");
    const [loading, setLoading] = useState(false);

    const fetchInsights = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/ai-insights", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ transactions }),
            });
            const data = await res.json();
            if (data.success) {
                setInsights(data.insights);
            } else {
                setInsights("An error occurred while fetching insights.");
            }
        } catch (err) {
            setInsights("An error occurred while fetching insights.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-[#121624] rounded-2xl border border-gray-800 space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold text-base text-purple-400">✨ AI Financial Advisor</h3>
                <button
                    onClick={fetchInsights}
                    disabled={loading}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium transition disabled:opacity-50 flex items-center gap-2"
                >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {loading ? "Fetching insights..." : "Get AI Insights"}
                </button>
            </div>
            {insights ? (
                <div className="p-4 bg-[#1a1f35] rounded-xl text-gray-300 text-sm whitespace-pre-line border border-gray-800">
                    <ReactMarkdown>{insights}</ReactMarkdown>
                </div>
            ) : (
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5 text-gray-300 text-sm leading-relaxed">
                    Click 'Get AI Insights' to analyze your spending.
                </div>
            )}
        </div>
    );
}

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [expenses, setExpenses] = useState([]);
    const [budgets, setBudgets] = useState([]);
    const [categories, setCategories] = useState([]);

    // Quick Transaction Form States
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [type, setType] = useState("expense");
    const [category, setCategory] = useState("General");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [submitting, setSubmitting] = useState(false);

    // New Category Inline States
    const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");

    // Fetch Data (Expenses, Budgets, and Categories)
    const fetchData = async () => {
        try {
            const [expRes, budRes, catRes] = await Promise.all([
                fetch("/api/expenses"),
                fetch("/api/budgets"),
                fetch("/api/categories")
            ]);

            if (expRes.ok) {
                const data = await expRes.json();
                setExpenses(data);
            }
            if (budRes.ok) {
                const data = await budRes.json();
                setBudgets(data);
            }
            if (catRes.ok) {
                const data = await catRes.json();
                const catList = data.map(c => typeof c === 'string' ? c : c.name);
                setCategories(catList.length > 0 ? catList : ["General", "Food", "Transport", "Shopping"]);
            } else {
                setCategories(["General", "Food", "Transport", "Shopping"]);
            }
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            setCategories(["General", "Food", "Transport", "Shopping"]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Handle Adding a New Category on the fly
    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) return;
        const formattedCat = newCategoryName.trim();

        try {
            const res = await fetch("/api/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: formattedCat }),
            });

            if (res.ok) {
                setCategories(prev => [...prev, formattedCat]);
                setCategory(formattedCat);
                setNewCategoryName("");
                setIsAddingNewCategory(false);
            } else {
                setCategories(prev => [...prev, formattedCat]);
                setCategory(formattedCat);
                setNewCategoryName("");
                setIsAddingNewCategory(false);
            }
        } catch (err) {
            console.error("Error creating category:", err);
            setCategories(prev => [...prev, formattedCat]);
            setCategory(formattedCat);
            setNewCategoryName("");
            setIsAddingNewCategory(false);
        }
    };

    // Handle Quick Transaction Submit
    const handleQuickAdd = async (e) => {
        e.preventDefault();
        if (!description || !amount) return;
        setSubmitting(true);

        try {
            const res = await fetch("/api/expenses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    description,
                    amount: Number(amount),
                    type,
                    category,
                    date,
                }),
            });

            if (res.ok) {
                setDescription("");
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

    const totalBudgetLimit = budgets.reduce((acc, curr) => acc + Number(curr.limit || 0), 0);
    const totalBudgetSpent = budgets.reduce((acc, curr) => acc + Number(curr.spent || curr.currentSpent || 0), 0);
    const budgetUsedPercent = totalBudgetLimit > 0 ? Math.min(Math.round((totalBudgetSpent / totalBudgetLimit) * 100), 100) : 11;

    const recentTransactions = expenses.slice(0, 4);

    // Prepare Chart Data grouped by Date
    const chartDataMap = {};
    expenses.forEach(item => {
        if (!item.date) return;
        const dateStr = item.date.split("T")[0];
        if (!chartDataMap[dateStr]) {
            chartDataMap[dateStr] = { date: dateStr, income: 0, expense: 0 };
        }
        const amt = Number(item.amount || 0);
        if ((item.type || "").toLowerCase() === "income") {
            chartDataMap[dateStr].income += amt;
        } else {
            chartDataMap[dateStr].expense += amt;
        }
    });

    const chartData = Object.values(chartDataMap).sort((a, b) => new Date(a.date) - new Date(b.date));

    if (loading) {
        return (
            <div className="flex justify-center items-center py-40 text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin mr-3" /> Loading dashboard...
            </div>
        );
    }

    return (
        <div className="space-y-6">

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
                <div className="lg:col-span-2 bg-[#121624] p-6 rounded-2xl border border-gray-800 space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-base">Income vs Expenses Trend</h3>
                        <span className="text-xs px-3 py-1 bg-gray-800 text-gray-400 rounded-lg">Last 30 days</span>
                    </div>
                    <div className="w-full h-64">
                        <ResponsiveContainer width="100%" height={240}>
                            <LineChart data={chartData}>
                                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                                <YAxis stroke="#6b7280" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1a1f35', borderColor: '#374151', borderRadius: '0.75rem' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="expense" name="Expense" stroke="#f43f5e" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
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
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
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
                            {/* Dynamic Category Selector */}
                            {!isAddingNewCategory ? (
                                <select
                                    value={category}
                                    onChange={(e) => {
                                        if (e.target.value === "__add_new__") {
                                            setIsAddingNewCategory(true);
                                        } else {
                                            setCategory(e.target.value);
                                        }
                                    }}
                                    className="px-3 py-2 bg-[#1a1f35] border border-gray-800 rounded-xl text-sm focus:outline-none text-gray-200"
                                >
                                    {categories.map((cat, idx) => (
                                        <option key={idx} value={cat}>{cat}</option>
                                    ))}
                                    <option value="__add_new__" className="text-indigo-400 font-semibold">+ Add New Category</option>
                                </select>
                            ) : (
                                <div className="flex gap-1">
                                    <input
                                        type="text"
                                        placeholder="New category..."
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                        className="w-full px-2 py-1 bg-[#1a1f35] border border-indigo-500 rounded-xl text-xs focus:outline-none text-white"
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        onClick={handleCreateCategory}
                                        className="px-2 py-1 bg-indigo-600 text-white rounded-lg text-xs"
                                    >
                                        Add
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsAddingNewCategory(false)}
                                        className="px-2 py-1 bg-gray-700 text-gray-300 rounded-lg text-xs"
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}

                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="px-3 py-2 bg-[#1a1f35] border border-gray-800 rounded-xl text-sm focus:outline-none text-gray-200"
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
                                className="w-full px-3 py-2 bg-[#1a1f35] border border-gray-800 rounded-xl text-sm focus:outline-none text-gray-200"
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

            {/* AI Insights */}
            <AIInsightsSection transactions={expenses} />

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
                                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs ${isIncome ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-500"}`}>
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