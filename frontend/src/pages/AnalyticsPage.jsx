import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart as PieIcon, 
  Calendar, 
  Clock, 
  Building2, 
  RefreshCw,
  AlertCircle 
} from 'lucide-react';
import { fetchAnalytics } from '../api';
import { LoadingSkeleton, EmptyState } from '../components/LoadingSkeleton';

const TYPE_COLORS = ['#4F46E5', '#06B6D4', '#8B5CF6', '#10B981', '#F59E0B'];

export default function AnalyticsPage() {
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [utilizationData, setUtilizationData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [typeData, setTypeData] = useState([]);
  const [topFacilitiesData, setTopFacilitiesData] = useState([]);

  const loadAllAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const [utilRes, weeklyRes, typeRes, topRes] = await Promise.all([
        fetchAnalytics('utilization-by-hour', days),
        fetchAnalytics('weekly-bookings', days),
        fetchAnalytics('by-facility-type', days),
        fetchAnalytics('top-facilities', days)
      ]);

      setUtilizationData(utilRes.data || []);
      setWeeklyData(weeklyRes.data || []);
      setTypeData(typeRes.data || []);
      setTopFacilitiesData(topRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch analytics metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAnalytics();
  }, [days]);

  return (
    <div className="space-y-6">
      {/* Top Controls Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Campus Facility Allocation Analytics</h2>
          <p className="text-xs text-slate-500 mt-0.5">Historical utilization patterns, peak operating hours, and venue demand</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Date Range Select */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            {[7, 14, 30].map(d => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  days === d
                    ? 'bg-white text-indigo-600 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {d} Days
              </button>
            ))}
          </div>

          <button
            onClick={loadAllAnalytics}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            title="Refresh Analytics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div className="text-sm font-medium">{error}</div>
        </div>
      )}

      {/* Grid of 4 Recharts Analytics Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Utilization by Hour */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Hourly Utilization Rate (08:00 - 20:00)</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Campus occupancy across operational time slots</p>
            </div>
            <span className="text-xs font-semibold px-2 py-1 rounded bg-indigo-50 text-indigo-700">Occupancy %</span>
          </div>

          {loading ? (
            <div className="h-64 flex items-center justify-center"><LoadingSkeleton count={1} /></div>
          ) : utilizationData.length === 0 ? (
            <div className="h-64 flex items-center justify-center"><EmptyState title="No Hourly Data" message="No bookings recorded for this range." /></div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={utilizationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="utilGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748B' }} unit="%" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
                    formatter={(val) => [`${val}%`, 'Utilization']}
                  />
                  <Area type="monotone" dataKey="utilizationRate" stroke="#4F46E5" strokeWidth={2.5} fillOpacity={1} fill="url(#utilGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Chart 2: Weekly Bookings Trend */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Allocation Volume Trend</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Daily confirmed reservations</p>
            </div>
            <span className="text-xs font-semibold px-2 py-1 rounded bg-emerald-50 text-emerald-700">Total Bookings</span>
          </div>

          {loading ? (
            <div className="h-64 flex items-center justify-center"><LoadingSkeleton count={1} /></div>
          ) : weeklyData.length === 0 ? (
            <div className="h-64 flex items-center justify-center"><EmptyState title="No Trend Data" message="No allocations recorded." /></div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748B' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E2E8F0' }}
                    formatter={(val) => [val, 'Confirmed Bookings']}
                  />
                  <Bar dataKey="bookings" fill="#10B981" radius={[6, 6, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Chart 3: Allocations by Facility Type (Donut) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Demand by Facility Classification</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Allocation share across venue categories</p>
            </div>
          </div>

          {loading ? (
            <div className="h-64 flex items-center justify-center"><LoadingSkeleton count={1} /></div>
          ) : typeData.length === 0 ? (
            <div className="h-64 flex items-center justify-center"><EmptyState title="No Type Data" message="No categorized data available." /></div>
          ) : (
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeData}
                    dataKey="count"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {typeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={TYPE_COLORS[index % TYPE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E2E8F0' }}
                    formatter={(val, name, entry) => [`${val} bookings (${entry.payload.percentage}%)`, name]}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    iconType="circle"
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Chart 4: Top 5 Facilities */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">Top 5 Most Booked Venues</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Highest volume campus facilities</p>
            </div>
          </div>

          {loading ? (
            <div className="h-64 flex items-center justify-center"><LoadingSkeleton count={1} /></div>
          ) : topFacilitiesData.length === 0 ? (
            <div className="h-64 flex items-center justify-center"><EmptyState title="No Venue Data" message="No facilities have been booked yet." /></div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topFacilitiesData}
                  layout="vertical"
                  margin={{ top: 10, right: 20, left: 40, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    tick={{ fontSize: 10, fill: '#334155' }} 
                    width={110} 
                    tickFormatter={(name) => name.length > 15 ? `${name.substring(0, 15)}…` : name}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E2E8F0' }}
                    formatter={(val, name, item) => [`${val} Bookings (${item.payload.totalHours} hrs)`, item.payload.name]}
                  />
                  <Bar dataKey="bookings" fill="#4F46E5" radius={[0, 6, 6, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
