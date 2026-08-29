"use client";
import React, { useState, useEffect } from "react";
import { Plus, MoreVertical, Edit3, Target, X, Loader2 } from "lucide-react";

export default function SavingsPage() {
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Form states
    const [title, setTitle] = useState("");
    const [targetAmount, setTargetAmount] = useState("");
    const [currentAmount, setCurrentAmount] = useState("");
    const [targetDate, setTargetDate] = useState("");
    const [submitting, setSubmitting] = useState(false);

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

    // 2. Handle Create Goal (POST request)
    const handleCreateGoal = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await fetch("/api/goals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    targetAmount: Number(targetAmount),
                    currentAmount: currentAmount ? Number(currentAmount) : 0,
                    targetDate,
                }),
            });

            if (res.ok) {
                // Clear form and close modal
                setTitle("");
                setTargetAmount("");
                setCurrentAmount("");
                setTargetDate("");
                setShowModal(false);
                // Refresh list
                fetchGoals();
            } else {
                const errData = await res.json();
                alert(errData.error || "Failed to create goal");
            }
        } catch (error) {
            console.error("Error creating goal:", error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Savings Goals</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Track and manage your long-term financial milestones.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium shadow-lg shadow-indigo-600/20 transition"
                >
                    <Plus className="w-4 h-4" /> Add Goal
                </button>
            </div>

            {/* Loading State */}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {goals.map((g) => {
                        const current = g.currentAmount || 0;
                        const target = g.targetAmount || 1;
                        const percent = Math.min(Math.round((current / target) * 100), 100);
                        const remaining = Math.max(target - current, 0);
                        const formattedDate = g.targetDate ? new Date(g.targetDate).toLocaleDateString() : "No deadline";

                        return (
                            <div key={g.id} className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-lg">{g.title}</h3>
                                        <div className="text-xs text-gray-500 mt-1">Target Date: {formattedDate}</div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 transition">
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                        <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 transition">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex justify-between items-baseline">
                                    <span className="text-2xl font-bold">${current} <span className="text-sm font-normal text-gray-400">/ ${target}</span></span>
                                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{percent}%</span>
                                </div>

                                <div className="w-full bg-gray-100 dark:bg-gray-800 h-2.5 rounded-full overflow-hidden">
                                    <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${percent}%` }}></div>
                                </div>

                                <div className="flex justify-between text-xs text-gray-500 pt-1">
                                    <span>${remaining} remaining</span>
                                    <span className="text-emerald-500 font-medium">{percent >= 100 ? "Completed 🎉" : "On track"}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add Goal Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-md p-6 space-y-6 shadow-2xl">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold">Add Savings Goal</h2>
                            <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateGoal} className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-gray-500">Goal Title</label>
                                <input
                                    type="text"
                                    placeholder="e.g., New Laptop"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                    className="w-full mt-1 px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-500">Target Amount ($)</label>
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
                                    <label className="text-xs font-medium text-gray-500">Current Saved ($)</label>
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
                                <label className="text-xs font-medium text-gray-500">Target Date</label>
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
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium shadow-lg shadow-indigo-600/20 transition flex items-center gap-2 disabled:opacity-50"
                                >
                                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Save Goal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}