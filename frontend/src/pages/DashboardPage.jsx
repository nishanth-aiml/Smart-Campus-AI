import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  CalendarCheck2, 
  Percent, 
  Clock, 
  Sparkles, 
  Layers, 
  Users, 
  MapPin, 
  Tv, 
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { StatCard, StatusBadge } from '../components/StatCard';
import { LoadingSkeleton, EmptyState } from '../components/LoadingSkeleton';
import { fetchDashboardStats } from '../api';

export default function DashboardPage({ onNavigateToNewRequest }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('All');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchDashboardStats();
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const facilityTypes = ['All', 'Classroom', 'Lab', 'Auditorium', 'Seminar Hall', 'Sports Ground'];

  const filteredGrid = data?.facilityGrid?.filter(item => {
    if (filterType === 'All') return true;
    return item.type === filterType;
  }) || [];

  return (
    <div className="space-y-8">
      {/* Top Banner & Quick Action */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-900 rounded-2xl p-6 sm:p-8 text-white shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            VSB AI-Assisted Allocation Engine
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">VSB Campus Facility Control</h2>
          <p className="text-indigo-200 text-sm mt-1.5 max-w-xl leading-relaxed">
            Real-time constraint checking, capacity optimization, and conflict-free facility assignments across MB-I, MB-II, MB-III, Thermal, EEE, ECE, PG & Auditorium blocks.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
            title="Refresh statistics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            id="btn-dash-new-request"
            onClick={onNavigateToNewRequest}
            className="px-5 py-3 bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-sm rounded-xl shadow-md transition-all active:scale-[0.98] whitespace-nowrap"
          >
            + New Allocation Request
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div className="text-sm font-medium">{error}</div>
        </div>
      )}

      {/* 4 Stat Cards */}
      {loading && !data ? (
        <LoadingSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Total Facilities"
            value={data?.stats?.totalFacilities ?? 12}
            icon={Building2}
            description="Active venues across 5 blocks"
            color="indigo"
          />
          <StatCard
            title="Active Today"
            value={data?.stats?.activeAllocationsToday ?? 0}
            icon={CalendarCheck2}
            description="Confirmed booking sessions"
            trend="+18% vs avg"
            color="emerald"
          />
          <StatCard
            title="Campus Utilization"
            value={`${data?.stats?.utilizationRate ?? 0}%`}
            icon={Percent}
            description="Facility occupancy rate today"
            color="amber"
          />
          <StatCard
            title="Pending Requests"
            value={data?.stats?.pendingRequests ?? 0}
            icon={Clock}
            description="Awaiting administrator review"
            color="blue"
          />
        </div>
      )}

      {/* Section 1: Facility Availability Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Facility Availability Matrix</h3>
            <p className="text-xs text-slate-500 mt-0.5">Live status and capacity overview across campus venues</p>
          </div>
          {/* Facility Type Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {facilityTypes.map(t => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  filterType === t
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {loading && !data ? (
          <div className="py-8"><LoadingSkeleton count={6} /></div>
        ) : filteredGrid.length === 0 ? (
          <div className="py-8"><EmptyState title="No facilities found" message="No facilities match the selected filter criteria." /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6">
            {filteredGrid.map(fac => (
              <div
                key={fac.id}
                className="rounded-xl border border-slate-200 bg-white p-4 hover:border-indigo-300 hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {fac.type}
                    </span>
                    <StatusBadge status={fac.status} />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{fac.name}</h4>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{fac.building} • {fac.floor}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium mt-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Capacity: {fac.capacity} students</span>
                  </div>
                </div>

                {/* Equipment Chips */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="flex flex-wrap gap-1">
                    {(fac.equipment || []).slice(0, 3).map((eq, i) => (
                      <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                        {eq}
                      </span>
                    ))}
                    {(fac.equipment || []).length > 3 && (
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium">
                        +{fac.equipment.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Today's Allocations Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between pb-5 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Today's Scheduled Allocations</h3>
            <p className="text-xs text-slate-500 mt-0.5">Timeline of verified venue bookings for today</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            {data?.todaysAllocations?.length || 0} Bookings
          </span>
        </div>

        {loading && !data ? (
          <div className="py-6"><LoadingSkeleton type="table" count={4} /></div>
        ) : (data?.todaysAllocations || []).length === 0 ? (
          <div className="py-8">
            <EmptyState
              title="No bookings for today"
              message="There are no active or scheduled allocations for today. Create a new request to get started."
              actionText="Create Request"
              onAction={onNavigateToNewRequest}
            />
          </div>
        ) : (
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                  <th className="py-3 px-3">Time Window</th>
                  <th className="py-3 px-3">Event Name</th>
                  <th className="py-3 px-3">Facility</th>
                  <th className="py-3 px-3">Attendees</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.todaysAllocations.map((alloc) => {
                  const sTime = new Date(alloc.start_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const eTime = new Date(alloc.end_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                  return (
                    <tr key={alloc.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-3 whitespace-nowrap font-medium text-slate-700">
                        <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md text-xs font-semibold">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          {sTime} - {eTime}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-semibold text-slate-900">{alloc.event_name || 'Campus Event'}</div>
                        <div className="text-xs text-slate-500">{alloc.event_type || 'General'}</div>
                      </td>
                      <td className="py-3.5 px-3 font-medium text-slate-800">
                        {alloc.facility_name}
                      </td>
                      <td className="py-3.5 px-3 text-slate-600">
                        <span className="inline-flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          {alloc.student_count || 40}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <StatusBadge status={alloc.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
