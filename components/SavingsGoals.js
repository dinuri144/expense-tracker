"use client";
import React, { useState, useEffect } from "react";

export default function SavingsGoals() {
    const [goals, setGoals] = useState([]);
    const [title, setTitle] = useState("");
    const [targetAmount, setTargetAmount] = useState("");
    const [currentAmount, setCurrentAmount] = useState("");
    const [targetDate, setTargetDate] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Fetch goals
    const fetchGoals = async () => {
        try {
            const token = localStorage.getItem('dev:token');
            const res = await fetch('/api/goals', {
                headers: { Authorization: token ? `Bearer ${token}` : '' }
            });
            if (res.ok) {
                const data = await res.json();
                setGoals(data || []);
            }
        } catch (err) {
            console.error("Failed to load goals", err);
        }
    };

    useEffect(() => {
        fetchGoals();
    }, []);

    // Add goal handler
    const handleAddGoal = async (e) => {
        e.preventDefault();
        setError("");
        if (!title || !targetAmount) {
            setError("Title and target amount are required.");
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('dev:token');
            const res = await fetch('/api/goals', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify({
                    title,
                    targetAmount: Number(targetAmount),
                    currentAmount: currentAmount ? Number(currentAmount) : 0,
                    targetDate: targetDate || null
                })
            });

            if (res.ok) {
                setTitle("");
                setTargetAmount("");
                setCurrentAmount("");
                setTargetDate("");
                fetchGoals();
            } else {
                const data = await res.json();
                setError(data.error || "Failed to add goal");
            }
        } catch (err) {
            setError("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Savings Goals</h3>

            {/* Add Goal Form */}
            <form onSubmit={handleAddGoal} className="space-y-4 border-b pb-6 dark:border-gray-700">
                {error && <p className="text-sm text-red-500">{error}</p>}
                <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Goal Title</label>
                    <input
                        type="text"
                        placeholder="e.g., New Laptop, Vacation"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="w-full px-3 py-2 border rounded bg-gray-50 dark:bg-gray-900 dark:border-gray-700 text-sm"
                    />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Target Amount ($)</label>
                        <input
                            type="number"
                            placeholder="1000"
                            value={targetAmount}
                            onChange={e => setTargetAmount(e.target.value)}
                            className="w-full px-3 py-2 border rounded bg-gray-50 dark:bg-gray-900 dark:border-gray-700 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Current Saved ($)</label>
                        <input
                            type="number"
                            placeholder="0"
                            value={currentAmount}
                            onChange={e => setCurrentAmount(e.target.value)}
                            className="w-full px-3 py-2 border rounded bg-gray-50 dark:bg-gray-900 dark:border-gray-700 text-sm"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Target Date</label>
                    <input
                        type="date"
                        value={targetDate}
                        onChange={e => setTargetDate(e.target.value)}
                        className="w-full px-3 py-2 border rounded bg-gray-50 dark:bg-gray-900 dark:border-gray-700 text-sm"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded text-sm font-medium transition"
                >
                    {loading ? "Adding..." : "Add Goal"}
                </button>
            </form>

            {/* Goals List with Progress Bar */}
            <div className="space-y-4">
                <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Your Active Goals</h4>
                {goals.length === 0 ? (
                    <p className="text-sm text-gray-500">No savings goals set yet.</p>
                ) : (
                    goals.map(goal => {
                        const progress = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
                        return (
                            <div key={goal.id || goal._id} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border dark:border-gray-700 space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-sm">{goal.title}</span>
                                    <span className="text-xs text-gray-500">
                                        ${goal.currentAmount} / ${goal.targetAmount}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                                    <div
                                        className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>{progress}% Completed</span>
                                    {goal.targetDate && <span>Target: {new Date(goal.targetDate).toLocaleDateString()}</span>}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}