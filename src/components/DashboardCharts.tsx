'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  Sector
} from 'recharts';
import api from '@/utils/axios';
import { Download, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

interface ChartData {
  name: string;
  value: number;
}

const renderActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180;
  const {
    cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, percent, value,
  } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>{payload.name}</text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333" fontSize={12}>{`Value: ${value}`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999" fontSize={12}>
        {`(${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};

export default function DashboardCharts() {
  const [studentData, setStudentData] = useState<ChartData[]>([]);
  const [inventoryData, setInventoryData] = useState<ChartData[]>([]);
  const [freqData, setFreqData] = useState<ChartData[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState(30000); // Default 30s
  const [freqDays, setFreqDays] = useState(30);
  const [activeStudentIndex, setActiveStudentIndex] = useState(0);
  const [activeInventoryIndex, setActiveInventoryIndex] = useState(0);
  const [activeFreqIndex, setActiveFreqIndex] = useState(0);

  const studentChartRef = useRef<HTMLDivElement>(null);
  const inventoryChartRef = useRef<HTMLDivElement>(null);
  const freqChartRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [studentRes, inventoryRes, freqRes] = await Promise.all([
        api.get('/dashboard/student-distribution'),
        api.get('/dashboard/book-inventory'),
        api.get(`/dashboard/high-frequency-books?limit=5&days=${freqDays}`)
      ]);

      if (studentRes.data.success) setStudentData(studentRes.data.data);
      if (inventoryRes.data.success) setInventoryData(inventoryRes.data.data);
      if (freqRes.data.success) setFreqData(freqRes.data.data);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError('Gagal memuat data dashboard. Silakan coba lagi nanti.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval, freqDays]);

  const handleExport = (ref: React.RefObject<HTMLDivElement>, filename: string) => {
    if (!ref.current) return;
    
    const svg = ref.current.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `${filename}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const renderChartContainer = (
    title: string, 
    data: ChartData[], 
    activeIndex: number, 
    setActiveIndex: (i: number) => void,
    ref: React.RefObject<HTMLDivElement>,
    filename: string,
    extraHeader?: React.ReactNode
  ) => (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col h-[400px]">
      <div className="flex justify-between items-center mb-4">
        <div className="flex flex-col">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          {extraHeader}
        </div>
        <button 
          onClick={() => handleExport(ref, filename)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          title="Export PNG"
          aria-label={`Export ${title} as PNG`}
        >
          <Download size={18} />
        </button>
      </div>
      
      <div className="flex-1 w-full" ref={ref}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="animate-spin text-OldRed" size={32} />
          </div>
        ) : data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                onMouseEnter={(_, index) => setActiveIndex(index)}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <AlertCircle size={48} className="mb-2" />
            <p>Tidak ada data tersedia</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4 bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-gray-800">Dashboard Statistik</h2>
          {loading && <Loader2 className="animate-spin text-OldRed" size={20} />}
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="refresh-interval" className="text-sm text-gray-600">Refresh:</label>
            <select 
              id="refresh-interval"
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-OldRed"
            >
              <option value={10000}>10 detik</option>
              <option value={30000}>30 detik</option>
              <option value={60000}>1 menit</option>
              <option value={300000}>5 menit</option>
            </select>
          </div>
          
          <button 
            onClick={fetchData}
            className="flex items-center gap-1 px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative flex items-center gap-2" role="alert">
          <AlertCircle size={20} />
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {renderChartContainer(
          "Distribusi Siswa", 
          studentData, 
          activeStudentIndex, 
          setActiveStudentIndex,
          studentChartRef,
          "distribusi_siswa"
        )}
        
        {renderChartContainer(
          "Inventaris Buku", 
          inventoryData, 
          activeInventoryIndex, 
          setActiveInventoryIndex,
          inventoryChartRef,
          "inventaris_buku"
        )}
        
        {renderChartContainer(
          "Buku Terpopuler", 
          freqData, 
          activeFreqIndex, 
          setActiveFreqIndex,
          freqChartRef,
          "buku_terpopuler",
          <select 
            value={freqDays}
            onChange={(e) => setFreqDays(Number(e.target.value))}
            className="text-xs border border-gray-200 rounded mt-1 focus:outline-none focus:ring-1 focus:ring-OldRed w-fit"
          >
            <option value={7}>7 hari terakhir</option>
            <option value={30}>30 hari terakhir</option>
            <option value={90}>90 hari terakhir</option>
            <option value={365}>1 tahun terakhir</option>
          </select>
        )}
      </div>
    </div>
  );
}
