"use client";
import React, { useState, useEffect } from "react";

export default function BudgetForm({ onSaved }) {
    const [monthly, setMonthly] = useState("");
    const [weekly, setWeekly] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch("/api/settings");
                if (res.ok) {
                    const data = await res.json();
                    setMonthly(data.monthlyBudget ?? "");
                    setWeekly(data.weeklyBudget ?? "");
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    async function save(e) {
        e.preventDefault();
        setSaving(true);
        setMessage("");

        try {
            const res = await fetch("/api/settings", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    monthlyBudget: monthly || 0,
                    weeklyBudget: weekly || 0,
                }),
            });

            if (res.ok) {
                setMessage("Saved successfully");
                onSaved && onSaved();
                setTimeout(() => setMessage(""), 2500);
            } else {
                setMessage("Save failed");
            }
        } catch (err) {
            console.error(err);
            setMessage("Save failed");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="p-5 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-center text-gray-500 text-sm">
                Loading...
            </div>
        );
    }

    return (
        <form
            onSubmit={save}
            className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-4"
        >
            <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Monthly budget
                </label>
                <input
                    value={monthly ?? ""}
                    onChange={(e) => setMonthly(e.target.value)}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-3 py-2.5 mt-1.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
            </div>

            <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Weekly budget
                </label>
                <input
                    value={weekly ?? ""}
                    onChange={(e) => setWeekly(e.target.value)}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-3 py-2.5 mt-1.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
            </div>

            {message && (
                <p className={`text-sm ${message.includes("success") ? "text-green-600" : "text-red-500"}`}>
                    {message}
                </p>
            )}

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={saving}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-60"
                >
                    {saving ? "Saving..." : "Save"}
                </button>
            </div>
        </form>
    );
}