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

interface ChartProps {
  data: { name: string; pengunjung: number }[];
}

export default function KunjunganChart({ data }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <defs>
          <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#B22222" stopOpacity={1} />
            <stop offset="100%" stopColor="#e53935" stopOpacity={1} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis 
          dataKey="name" 
          tick={{ fill: '#4a5568', fontSize: 12 }}
          axisLine={{ stroke: '#cbd5e0' }}
        />
        <YAxis 
          tick={{ fill: '#4a5568', fontSize: 12 }}
          axisLine={{ stroke: '#cbd5e0' }}
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
          itemStyle={{ color: '#B22222' }}
        />
        <Line
          type="monotone"
          dataKey="pengunjung"
          stroke="url(#colorGradient)"
          strokeWidth={3}
          dot={{ 
            fill: '#B22222', 
            stroke: 'white', 
            strokeWidth: 2, 
            r: 6,
          }}
          activeDot={{ 
            fill: '#e53935', 
            stroke: 'white', 
            strokeWidth: 2, 
            r: 8 
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}