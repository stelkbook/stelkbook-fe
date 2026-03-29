'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import React from 'react';

interface ProgressChartProps {
  data: { name: string; value: number }[];
  title: string;
}

export default function ProgressChart({ data, title }: ProgressChartProps) {
  return (
    <div className="flex flex-col items-center w-full max-w-lg">
        <h3 className="text-xl font-bold font-poppins mb-4">{title}</h3>
        <div className="w-full h-64 bg-white rounded-lg pt-4 pb-2 pr-4 pl-0">
            <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={true} />
                <XAxis 
                dataKey="name" 
                tick={{ fill: '#4a5568', fontSize: 12 }}
                axisLine={{ stroke: '#cbd5e0' }}
                tickLine={false}
                />
                <YAxis 
                allowDecimals={false}
                tick={{ fill: '#4a5568', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                />
                <Tooltip 
                contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    padding: '8px 12px'
                }}
                labelStyle={{ color: '#2d3748', fontWeight: 'bold', marginBottom: '4px' }}
                itemStyle={{ color: '#22c55e' }}
                />
                <Line
                type="linear"
                dataKey="value"
                name="Membaca Buku"
                stroke="#22c55e" 
                strokeWidth={2}
                dot={{ 
                    fill: '#22c55e', 
                    stroke: '#22c55e', 
                    strokeWidth: 2, 
                    r: 3,
                }}
                activeDot={{ 
                    fill: '#16a34a', 
                    stroke: 'white', 
                    strokeWidth: 2, 
                    r: 5 
                }}
                />
            </LineChart>
            </ResponsiveContainer>
        </div>
    </div>
  );
}
