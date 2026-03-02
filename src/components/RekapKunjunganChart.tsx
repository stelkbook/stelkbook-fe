'use client';
import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Line,
  type TooltipProps
} from 'recharts';
import type { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';

type ChartItem = {
  name: string;
  pengunjung: number;
};

export default function RekapKunjunganChart({ data }: { data: ChartItem[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-xs text-gray-400">Belum ada data kunjungan tahun ini</p>
      </div>
    );
  }

  return (
    <div className="h-32 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 8 }}
            interval={0}
            angle={-45}
            textAnchor="end"
            height={40}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide={true} domain={[0, 'dataMax + 2']} />
          <Tooltip
            contentStyle={{
              fontSize: '10px',
              padding: '4px 8px',
              borderRadius: '4px',
            }}
            formatter={((value: ValueType) => {
              const num = typeof value === 'number' ? value : Number(value) || 0;
              return [`${num} pengunjung`, 'Total'];
            }) as TooltipProps<ValueType, NameType>['formatter']}
            labelFormatter={(label) => `Bulan: ${label}`}
          />
          <Line
            type="monotone"
            dataKey="pengunjung"
            stroke="#ef4444"
            strokeWidth={2}
            dot={{ r: 2, fill: '#ef4444' }}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
