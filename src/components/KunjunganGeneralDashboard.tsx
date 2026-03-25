'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import api from '@/utils/axios';
import { 
  Users, 
  UserPlus, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw,
  Loader2,
  AlertCircle
} from 'lucide-react';

const COLORS = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#6366F1'];

interface VisitStat {
  value: number;
  trend?: number;
  label: string;
}

interface VisitStats {
  activeUsers: VisitStat;
  newUsers: VisitStat;
  avgVisits: VisitStat;
}

interface ComparisonData {
  name: string;
  current: number;
  previous: number;
}

interface RoleData {
  name: string;
  value: number;
}

export default function KunjunganGeneralDashboard() {
  const [stats, setStats] = useState<VisitStats | null>(null);
  const [comparisonData, setComparisonData] = useState<ComparisonData[]>([]);
  const [roleData, setRoleData] = useState<RoleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState(60000); // 1 minute

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, compRes, roleRes] = await Promise.all([
        api.get('/dashboard/visit-stats'),
        api.get('/dashboard/visit-comparison'),
        api.get('/dashboard/visit-role')
      ]);

      if (statsRes.data.success) setStats(statsRes.data.data);
      if (compRes.data.success) setComparisonData(compRes.data.data);
      if (roleRes.data.success) setRoleData(roleRes.data.data);
    } catch (err: any) {
      console.error('Error fetching visit dashboard data:', err);
      setError('Gagal memuat statistik kunjungan.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  const renderStatCard = (icon: React.ReactNode, stat: VisitStat | undefined, color: string) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
      <div className="flex justify-between items-start mb-2">
        <div className={`p-2 rounded-lg ${color} bg-opacity-10 text-${color.split('-')[1]}-600`}>
          {icon}
        </div>
        {stat?.trend !== undefined && (
          <div className={`flex items-center text-xs font-medium ${stat.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {stat.trend >= 0 ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
            {Math.abs(stat.trend)}%
          </div>
        )}
      </div>
      <div className="mt-2">
        <p className="text-2xl font-bold text-gray-800">{stat?.value.toLocaleString() || 0}</p>
        <p className="text-sm text-gray-500 font-medium">{stat?.label}</p>
      </div>
    </div>
  );

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 text-red-600 rounded-lg">
            <Activity size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Ringkasan Aktivitas</h2>
            <p className="text-sm text-gray-500">Pantau statistik kunjungan perpustakaan secara real-time</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-2 rounded-lg shadow-sm border border-gray-100">
          <select 
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="text-xs font-medium border-none focus:ring-0 cursor-pointer bg-transparent"
          >
            <option value={30000}>Update 30 detik</option>
            <option value={60000}>Update 1 menit</option>
            <option value={300000}>Update 5 menit</option>
          </select>
          <div className="h-4 w-px bg-gray-200"></div>
          <button 
            onClick={fetchData}
            className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-500"
            title="Refresh Manual"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3 animate-pulse">
          <AlertCircle size={20} />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {renderStatCard(<Users size={20} />, stats?.activeUsers, 'bg-blue-500')}
        {renderStatCard(<UserPlus size={20} />, stats?.newUsers, 'bg-green-500')}
        {renderStatCard(<Activity size={20} />, stats?.avgVisits, 'bg-purple-500')}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800">Tren Kunjungan (7 Hari Terakhir)</h3>
            <div className="flex gap-4 text-xs font-medium">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>Minggu Ini</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                <span>Minggu Lalu</span>
              </div>
            </div>
          </div>
          <div className="flex-1 w-full">
            {loading && !comparisonData.length ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin text-red-500" size={32} />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={comparisonData}>
                  <defs>
                    <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#9CA3AF', fontSize: 12}}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#9CA3AF', fontSize: 12}}
                  />
                  <Tooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="previous" 
                    stroke="#D1D5DB" 
                    fill="transparent" 
                    strokeDasharray="5 5"
                    strokeWidth={2}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="current" 
                    stroke="#EF4444" 
                    fillOpacity={1} 
                    fill="url(#colorCurrent)" 
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[400px] flex flex-col">
          <h3 className="font-bold text-gray-800 mb-6">Distribusi Pengunjung</h3>
          <div className="flex-1 w-full">
            {loading && !roleData.length ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin text-red-500" size={32} />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roleData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {roleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    align="center"
                    iconType="circle"
                    formatter={(value) => <span className="text-xs font-medium text-gray-600 capitalize">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
