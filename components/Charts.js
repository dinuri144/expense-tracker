"use client";
import React, { useMemo } from "react";
import { Pie, Bar } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function Charts({ expenses = [] }) {
    // category pie
    const categoryData = useMemo(() => {
        const map = {};
        for (const e of expenses) {
            const k = e.category || 'General';
            map[k] = (map[k] || 0) + Number(e.amount || 0) * (e.type === 'expense' ? 1 : -1) * -1; // show expenses positive
        }
        const labels = Object.keys(map);
        const data = labels.map(l => Math.abs(map[l]));
        return { labels, datasets: [{ data, backgroundColor: ['#4F46E5', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'] }] };
    }, [expenses]);

    // monthly bar - group by month-year
    const monthlyData = useMemo(() => {
        const map = {};
        for (const e of expenses) {
            const date = new Date(e.date || e.createdAt);
            if (isNaN(date)) continue;
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            map[key] = (map[key] || 0) + (e.type === 'expense' ? -Number(e.amount || 0) : Number(e.amount || 0));
        }
        const keys = Object.keys(map).sort();
        const labels = keys;
        const data = keys.map(k => map[k]);
        return { labels, datasets: [{ label: 'Net (income - expense)', data, backgroundColor: '#4F46E5' }] };
    }, [expenses]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-4 bg-white dark:bg-gray-800 rounded shadow">
                <h3 className="text-sm text-gray-600 dark:text-gray-300 mb-3">Monthly overview</h3>
                <Bar data={monthlyData} />
            </div>

            <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
                <h3 className="text-sm text-gray-600 dark:text-gray-300 mb-3">Spending by category</h3>
                <Pie data={categoryData} />
            </div>
        </div>
    );
}
