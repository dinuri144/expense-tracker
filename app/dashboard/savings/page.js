"use client";
import React, { useState, useEffect } from "react";
import { Plus, MoreVertical, Edit3, Target, Loader2, Trash2, DollarSign, X } from "lucide-react";

export default function SavingsPage() {
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form states (Add / Edit)
    const [showForm, setShowForm] = useState(false);
    const [editingGoalId, setEditingGoalId] = useState(null);
    const [title, setTitle] = useState("");
    const [targetAmount, setTargetAmount] = useState("");
    const [currentAmount, setCurrentAmount] = useState("");
    const [targetDate, setTargetDate] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Deposit Modal States
    const [depositModalGoal, setDepositModalGoal] = useState(null);
    const [depositAmount, setDepositAmount] = useState("");

    // Dropdown / Action menu state for 3 dots
    const [activeMenuId, setActiveMenuId] = useState(null);

    // 1. Fetch Goals from API
    const fetchGoals = async () => {
        try {
            const res = await fetch("/api/goals");
            if (res.ok) {
                const data = await res.json();
                setGoals(data);
            }
        } catch (error) {
            console.error("Error fetching goals:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGoals();
    }, []);

    // 2. Handle Create or Update Goal (POST / PUT request)
    const handleSaveGoal = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const method = editingGoalId ? "PUT" : "POST";
            const bodyData = {
                title,
                targetAmount: Number(targetAmount),
                currentAmount: currentAmount ? Number(currentAmount) : 0,
                targetDate: targetDate || null,
            };

            if (editingGoalId) {
                bodyData.id = editingGoalId;
            }

            const res = await fetch("/api/goals", {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bodyData),
            });

            if (res.ok) {
                // Clear form and close form view
                setTitle("");
                setTargetAmount("");
                setCurrentAmount("");
                setTargetDate("");
                setEditingGoalId(null);
                setShowForm(false);
                fetchGoals();
            } else {
                const errData = await res.json();
                alert(errData.error || "Failed to save goal");
            }
        } catch (error) {
            console.error("Error saving goal:", error);
        } finally {
            setSubmitting(false);
        }
    };

    // Open Edit Form
    const handleEditClick = (g) => {
        setEditingGoalId(g.id || g._id);
        setTitle(g.title);
        setTargetAmount(g.targetAmount);
        setCurrentAmount(g.currentAmount);
        setTargetDate(g.targetDate ? g.targetDate.split("T")[0] : "");
        setShowForm(true);
        setActiveMenuId(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Delete Goal
    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this goal?")) return;
        try {
            const res = await fetch(`/api/goals?id=${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                fetchGoals();
            } else {
                alert("Failed to delete goal");
            }
        } catch (err) {
            console.error("Error deleting goal", err);
        }
    };

    // Deposit Money Handler
    const handleDeposit = async (e) => {
        e.preventDefault();
        if (!depositAmount || Number(depositAmount) <= 0) return;

        const goalId = depositModalGoal.id || depositModalGoal._id;
        const newCurrentAmount = Number(depositModalGoal.currentAmount || 0) + Number(depositAmount);

        try {
            const res = await fetch("/api/goals", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: goalId,
                    currentAmount: newCurrentAmount,
                }),
            });

            if (res.ok) {
                setDepositModalGoal(null);
                setDepositAmount("");
                fetchGoals();
            } else {
                alert("Failed to deposit funds");
            }
        } catch (err) {
            console.error("Error depositing funds", err);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-10">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Savings Goals</h1>
                    <p className="text-sm text-gray-400">Track and manage your long-term financial milestones.</p>
                </div>
                {!showForm && (
                    <button
                        onClick={() => {
                            setEditingGoalId(null);
                            setTitle("");
                            setTargetAmount("");
                            setCurrentAmount("");
                            setTargetDate("");
                            setShowForm(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium shadow-lg shadow-indigo-600/20 transition"
                    >
                        <Plus className="w-4 h-4" /> Add Goal
                    </button>
                )}
            </div>

            {/* Add / Edit Form Card */}
            {showForm && (
                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-3">
                        <h3 className="font-semibold text-lg">
                            {editingGoalId ? "Edit Savings Goal" : "Add New Goal"}
                        </h3>
                        <button
                            onClick={() => {
                                setShowForm(false);
                                setEditingGoalId(null);
                            }}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSaveGoal} className="space-y-4">
                        <div>
                            <label className="text-xs font-medium text-gray-400">Goal Title</label>
                            <input
                                type="text"
                                placeholder="e.g., New Laptop, Vacation"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                className="w-full mt-1 px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-gray-400">Target Amount ($)</label>
                                <input
                                    type="number"
                                    placeholder="1000"
                                    value={targetAmount}
                                    onChange={(e) => setTargetAmount(e.target.value)}
                                    required
                                    className="w-full mt-1 px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-400">Current Saved ($)</label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={currentAmount}
                                    onChange={(e) => setCurrentAmount(e.target.value)}
                                    className="w-full mt-1 px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-medium text-gray-400">Target Date</label>
                            <input
                                type="date"
                                value={targetDate}
                                onChange={(e) => setTargetDate(e.target.value)}
                                className="w-full mt-1 px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForm(false);
                                    setEditingGoalId(null);
                                }}
                                className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium shadow-lg shadow-indigo-600/20 transition flex items-center gap-2 disabled:opacity-50"
                            >
                                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                {editingGoalId ? "Update Goal" : "Add Goal"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Your Active Goals Section */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-200">Your Active Goals</h2>

                {loading ? (
                    <div className="flex justify-center items-center py-20 text-gray-400">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading your goals...
                    </div>
                ) : goals.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
                        <Target className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                        <h3 className="font-semibold text-lg">No savings goals found</h3>
                        <p className="text-sm text-gray-500 mt-1">Create your first goal to start tracking your progress.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {goals.map((g) => {
                            const goalId = g.id || g._id;
                            const current = g.currentAmount || 0;
                            const target = g.targetAmount || 1;
                            const percent = Math.min(Math.round((current / target) * 100), 100);
                            const remaining = Math.max(target - current, 0);
                            const formattedDate = g.targetDate ? new Date(g.targetDate).toLocaleDateString() : "No deadline";

                            return (
                                <div key={goalId} className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4 relative">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold text-lg capitalize">{g.title}</h3>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {/* Add Funds Button */}
                                            <button
                                                onClick={() => setDepositModalGoal(g)}
                                                className="px-3 py-1 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-500 rounded-lg text-xs font-medium transition flex items-center gap-1"
                                            >
                                                <DollarSign className="w-3.5 h-3.5" /> Add Funds
                                            </button>

                                            {/* Edit Button */}
                                            <button
                                                onClick={() => handleEditClick(g)}
                                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 transition"
                                                title="Edit Goal"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>

                                            {/* Delete Button */}
                                            <button
                                                onClick={() => handleDelete(goalId)}
                                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-red-400 hover:text-red-500 transition"
                                                title="Delete Goal"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-baseline text-sm">
                                        <span className="font-bold text-base">${current} / ${target}</span>
                                        <span className="text-gray-400">${remaining} remaining</span>
                                    </div>

                                    <div className="w-full bg-gray-100 dark:bg-gray-800 h-2.5 rounded-full overflow-hidden">
                                        <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${percent}%` }}></div>
                                    </div>

                                    <div className="flex justify-between text-xs text-gray-400 pt-1">
                                        <span>{percent}% Completed</span>
                                        <span>Target: {formattedDate}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Deposit Money Modal (Popup only for adding funds) */}
            {depositModalGoal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-base">Add Funds to "{depositModalGoal.title}"</h3>
                            <button onClick={() => setDepositModalGoal(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleDeposit} className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-gray-400">Amount to Add ($)</label>
                                <input
                                    type="number"
                                    placeholder="50"
                                    value={depositAmount}
                                    onChange={(e) => setDepositAmount(e.target.value)}
                                    required
                                    autoFocus
                                    className="w-full mt-1 px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-sm font-medium transition shadow-lg shadow-emerald-600/20"
                                >
                                    Deposit
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setDepositModalGoal(null);
                                        setDepositAmount("");
                                    }}
                                    className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-white py-2.5 rounded-xl text-sm font-medium transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}