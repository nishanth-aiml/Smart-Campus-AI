import React, { useState } from 'react';
import { 
  Sparkles, 
  Calendar, 
  Clock, 
  Users, 
  Layers, 
  Tv, 
  AlertCircle,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { analyzeRequest } from '../api';

const EVENT_TYPES = ['Workshop', 'Lecture', 'Conference', 'Hackathon', 'Seminar', 'Sports Tournament', 'Department Meeting'];
const FACILITY_TYPES = ['Classroom', 'Lab', 'Auditorium', 'Seminar Hall', 'Sports Ground'];
const EQUIPMENT_OPTIONS = ['Projector', 'Mic', 'AC', 'Computers', 'Whiteboard', 'Live Stream'];

export default function NewRequestPage({ onSubmitSuccess }) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().slice(0, 10);

  const [formData, setFormData] = useState({
    eventName: '',
    eventType: 'Workshop',
    studentCount: 45,
    date: defaultDate,
    startTime: '10:00',
    endTime: '13:00',
    facilityType: 'Lab',
    requiredEquipment: ['Computers', 'AC', 'Projector'],
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);

  const toggleEquipment = (item) => {
    setFormData(prev => {
      const exists = prev.requiredEquipment.includes(item);
      return {
        ...prev,
        requiredEquipment: exists 
          ? prev.requiredEquipment.filter(e => e !== item)
          : [...prev.requiredEquipment, item]
      };
    });
  };

  const validate = () => {
    const errs = {};
    if (!formData.eventName.trim()) {
      errs.eventName = 'Event name is required';
    }
    if (!formData.studentCount || parseInt(formData.studentCount, 10) <= 0) {
      errs.studentCount = 'Please enter a valid attendee count (at least 1)';
    }
    if (!formData.date) {
      errs.date = 'Date is required';
    }
    if (!formData.startTime) {
      errs.startTime = 'Start time is required';
    }
    if (!formData.endTime) {
      errs.endTime = 'End time is required';
    }

    if (formData.startTime && formData.endTime) {
      const [sH, sM] = formData.startTime.split(':').map(Number);
      const [eH, eM] = formData.endTime.split(':').map(Number);
      const sVal = sH + sM / 60;
      const eVal = eH + eM / 60;

      if (eVal <= sVal) {
        errs.endTime = 'End time must be after start time';
      }
      if (sVal < 8 || eVal > 20) {
        errs.startTime = 'Operating hours are strictly between 08:00 and 20:00';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      setServerError(null);

      const start_datetime = `${formData.date} ${formData.startTime}:00`;
      const end_datetime = `${formData.date} ${formData.endTime}:00`;

      const payload = {
        event_name: formData.eventName,
        event_type: formData.eventType,
        student_count: parseInt(formData.studentCount, 10),
        start_datetime,
        end_datetime,
        facility_type: formData.facilityType,
        required_equipment: formData.requiredEquipment
      };

      const result = await analyzeRequest(payload);
      onSubmitSuccess({
        requestPayload: payload,
        analysisResult: result
      });
    } catch (err) {
      setServerError(err.message || 'Analysis failed. Please check constraints.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">New Facility Allocation Request</h2>
        <p className="text-sm text-slate-500 mt-1">
          Specify your event constraints. The SQL Constraint Engine and AI Scorer will evaluate real-time capacity, schedule, and equipment match.
        </p>
      </div>

      {serverError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold">Constraint Verification Failed</h4>
            <p className="text-xs mt-0.5">{serverError}</p>
          </div>
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-8">
        {/* Section 1: Event Fundamentals */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 font-bold text-xs flex items-center justify-center">1</span>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Event Fundamentals</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Event Title <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-event-name"
                type="text"
                placeholder="e.g. Machine Learning Hands-on Bootcamp"
                value={formData.eventName}
                onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                  errors.eventName ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200 hover:border-slate-300'
                }`}
              />
              {errors.eventName && (
                <p className="text-xs text-rose-500 mt-1 font-medium">{errors.eventName}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Event Category <span className="text-rose-500">*</span>
              </label>
              <select
                id="select-event-type"
                value={formData.eventType}
                onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
              >
                {EVENT_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Headcount & Timing */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 font-bold text-xs flex items-center justify-center">2</span>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Scale & Schedule</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Expected Headcount <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Users className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="input-student-count"
                  type="number"
                  min="1"
                  max="1000"
                  value={formData.studentCount}
                  onChange={(e) => setFormData({ ...formData, studentCount: e.target.value })}
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                    errors.studentCount ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200'
                  }`}
                />
              </div>
              {errors.studentCount && (
                <p className="text-xs text-rose-500 mt-1 font-medium">{errors.studentCount}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="input-date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Start Time (08:00 - 20:00) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="input-start-time"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              {errors.startTime && (
                <p className="text-xs text-rose-500 mt-1 font-medium">{errors.startTime}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                End Time <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="input-end-time"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                    errors.endTime ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200'
                  }`}
                />
              </div>
              {errors.endTime && (
                <p className="text-xs text-rose-500 mt-1 font-medium">{errors.endTime}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Venue Type & Equipment Selection */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 font-bold text-xs flex items-center justify-center">3</span>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Facility Type & Equipment</h3>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Facility Classification <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {FACILITY_TYPES.map(ft => (
                <button
                  key={ft}
                  type="button"
                  id={`btn-fac-type-${ft.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setFormData({ ...formData, facilityType: ft })}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                    formData.facilityType === ft
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                  }`}
                >
                  {ft}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Required Equipment (Constraint Match)
            </label>
            <div className="flex flex-wrap gap-2">
              {EQUIPMENT_OPTIONS.map(eq => {
                const selected = formData.requiredEquipment.includes(eq);
                return (
                  <button
                    key={eq}
                    type="button"
                    id={`chip-eq-${eq.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => toggleEquipment(eq)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                      selected
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {selected && <CheckCircle2 className="w-3.5 h-3.5" />}
                    <span>{eq}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Submit Action Strip */}
        <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>Strict SQL constraint filtering with 4-factor deterministic scoring</span>
          </div>

          <button
            id="btn-submit-request"
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-bold rounded-xl shadow-md shadow-indigo-200 transition-all active:scale-[0.98]"
          >
            <Sparkles className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Evaluating Constraints...' : 'Find Best Facility'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
