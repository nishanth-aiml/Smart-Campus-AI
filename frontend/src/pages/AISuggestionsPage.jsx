import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ArrowLeft, 
  Building2, 
  MapPin, 
  Users, 
  Layers, 
  Check, 
  Info,
  Calendar,
  Clock,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { confirmAllocation } from '../api';

export default function AISuggestionsPage({ 
  requestData, 
  suggestions, 
  audit, 
  onEditRequest, 
  onAllocationSuccess 
}) {
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [conflictError, setConflictError] = useState(null);
  const [successData, setSuccessData] = useState(null);

  if (!requestData || !suggestions) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center bg-white rounded-2xl border border-slate-200 p-8">
        <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-900">No Active Request Evaluation</h3>
        <p className="text-sm text-slate-500 mt-1">Please create a new facility allocation request to view AI suggestions.</p>
        <button
          onClick={onEditRequest}
          className="mt-5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl"
        >
          Create New Request
        </button>
      </div>
    );
  }

  const { primary, alternatives = [], fallback } = suggestions;
  const req = requestData.requestPayload || requestData;

  const handleOpenConfirm = (candidate) => {
    setSelectedCandidate(candidate);
    setConflictError(null);
    setIsReviewOpen(true);
  };

  const handleExecuteAllocation = async () => {
    if (!selectedCandidate) return;

    try {
      setConfirming(true);
      setConflictError(null);

      const allocationPayload = {
        request_id: requestData.analysisResult?.request?.id || null,
        facility_id: selectedCandidate.facility_id,
        start_datetime: req.start_datetime,
        end_datetime: req.end_datetime
      };

      const result = await confirmAllocation(allocationPayload);
      setSuccessData({
        allocation: result.data,
        facility: selectedCandidate
      });
      setIsReviewOpen(false);
    } catch (err) {
      if (err.status === 409) {
        setConflictError(err.message || 'This facility slot was just booked by another process. Please select an alternative option.');
      } else {
        setConflictError(err.message || 'Failed to confirm allocation');
      }
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* 1. Request Summary Strip with Edit */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm">
          <div>
            <span className="text-slate-400 block text-[11px] font-semibold uppercase">Event</span>
            <span className="font-bold text-slate-900">{req.event_name}</span>
            <span className="ml-2 px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-xs font-semibold">{req.event_type}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px] font-semibold uppercase">Headcount</span>
            <span className="font-bold text-slate-900">{req.student_count} Students</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px] font-semibold uppercase">Requested Window</span>
            <span className="font-medium text-slate-700">{req.start_datetime} - {req.end_datetime?.slice(11, 16)}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px] font-semibold uppercase">Type Needed</span>
            <span className="font-bold text-slate-900">{req.facility_type}</span>
          </div>
        </div>

        <button
          id="btn-edit-request"
          onClick={onEditRequest}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Edit Request</span>
        </button>
      </div>

      {/* 2. Constraint Pass/Fail Audit Chips */}
      {audit && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Constraint Engine Audit:</span>
            <span className="text-xs text-slate-500">
              Evaluated {audit.total_facilities_evaluated || 12} venues
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Check className="w-3.5 h-3.5" /> Capacity Fit ({audit.passed_capacity || 0})
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Check className="w-3.5 h-3.5" /> Type Match ({audit.passed_type || 0})
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Check className="w-3.5 h-3.5" /> Equipment Match ({audit.passed_equipment || 0})
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Check className="w-3.5 h-3.5" /> No Time Conflicts ({audit.passed_availability || 0})
            </span>
          </div>
        </div>
      )}

      {/* Fallback Notice if AI engine offline */}
      {fallback && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>Notice: AI Engine scoring running in local capacity-priority mode.</span>
        </div>
      )}

      {/* 409 Conflict Banner */}
      {conflictError && (
        <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl text-rose-800 flex items-start gap-3 shadow-sm">
          <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold">Slot Allocation Conflict (409)</h4>
            <p className="text-xs mt-0.5 leading-relaxed">{conflictError}</p>
            <p className="text-xs font-semibold text-rose-700 mt-2">
              👉 Please review the alternative options below to confirm a non-conflicting venue.
            </p>
          </div>
        </div>
      )}

      {/* Success State */}
      {successData && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-200">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-emerald-950">Facility Allocation Confirmed!</h3>
            <p className="text-sm text-emerald-800 mt-1 max-w-md mx-auto">
              Your reservation for <strong className="font-semibold">{successData.facility.facility_name}</strong> has been saved with confirmed status.
            </p>
          </div>

          <div className="max-w-md mx-auto bg-white rounded-xl border border-emerald-200 p-4 text-left text-xs space-y-1.5 text-slate-700">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Allocation ID:</span>
              <span className="font-bold text-slate-900">#{successData.allocation.id}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Venue:</span>
              <span className="font-bold text-slate-900">{successData.facility.facility_name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Location:</span>
              <span>{successData.facility.building} ({successData.facility.floor})</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Time Slot:</span>
              <span className="font-semibold text-indigo-700">{req.start_datetime}</span>
            </div>
          </div>

          <button
            id="btn-success-dashboard"
            onClick={onAllocationSuccess}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-sm transition-all"
          >
            Return to Dashboard & Schedule
          </button>
        </div>
      )}

      {/* 3. Primary & Alternative Recommendations */}
      {!successData && (
        <div className="space-y-6">
          {/* Primary Recommendation Card */}
          {primary ? (
            <div className="bg-white rounded-2xl border-2 border-indigo-500/80 p-6 sm:p-8 shadow-card relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gradient-to-l from-indigo-600 to-indigo-700 text-white text-xs font-extrabold uppercase tracking-wider py-1.5 px-4 rounded-bl-xl shadow-sm flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Primary Recommendation • Best Match
              </div>

              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pt-2">
                <div className="space-y-4 flex-1">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                      {primary.facility_type}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">{primary.facility_name}</h3>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 mt-1">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span>{primary.building} • {primary.floor}</span>
                    </div>
                  </div>

                  {/* Factual Reason Box */}
                  <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl">
                    <div className="flex items-start gap-2.5">
                      <Cpu className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                        {primary.reason}
                      </p>
                    </div>
                  </div>

                  {/* Capacity Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-600">Capacity Fit ({req.student_count} / {primary.capacity} Seats)</span>
                      <span className="text-indigo-600">{Math.round((req.student_count / primary.capacity) * 100)}% Occupancy</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (req.student_count / primary.capacity) * 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Equipment Badges */}
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block mb-1.5">Matched Equipment:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {primary.equipment.map((eq, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800">
                          <Check className="w-3 h-3 text-emerald-600" />
                          {eq}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Score & Action Column */}
                <div className="lg:w-64 flex flex-col justify-between items-center lg:items-end bg-slate-50 lg:bg-transparent p-5 lg:p-0 rounded-xl border lg:border-0 border-slate-100">
                  <div className="text-center lg:text-right">
                    <span className="text-xs font-semibold text-slate-500 block uppercase">Confidence Score</span>
                    <div className="text-4xl font-black text-indigo-600 mt-0.5">{primary.score}<span className="text-lg text-slate-400 font-medium">/100</span></div>
                    {primary.breakdown && (
                      <div className="text-[11px] text-slate-500 space-y-0.5 mt-2 text-left lg:text-right">
                        <div>Cap Fit: <strong>{primary.breakdown.capacity_fit}</strong>/35</div>
                        <div>Equip: <strong>{primary.breakdown.equipment_match}</strong>/30</div>
                        <div>Type: <strong>{primary.breakdown.facility_type_match}</strong>/15</div>
                        <div>Util Balance: <strong>{primary.breakdown.utilization_balance}</strong>/20</div>
                      </div>
                    )}
                  </div>

                  <button
                    id="btn-confirm-primary"
                    onClick={() => handleOpenConfirm(primary)}
                    className="w-full mt-6 py-3 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    <span>Confirm Allocation</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
              <h4 className="text-base font-bold text-slate-800">No primary facility available</h4>
              <p className="text-xs text-slate-500 mt-1">Please try modifying your date, headcount, or equipment requirements.</p>
            </div>
          )}

          {/* Alternative Options Section */}
          {alternatives.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-slate-900 tracking-tight">Alternative Recommendations ({alternatives.length})</h4>
                <span className="text-xs text-slate-500">Evaluated backup candidates</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {alternatives.map((alt, i) => (
                  <div key={alt.facility_id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-indigo-300 transition-all flex flex-col justify-between shadow-sm">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <span className="text-[11px] font-semibold uppercase text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          Option {i + 1} • {alt.facility_type}
                        </span>
                        <span className="text-base font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">
                          {alt.score}<span className="text-xs text-slate-400">/100</span>
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-slate-900">{alt.facility_name}</h4>
                      <p className="text-xs text-slate-500">{alt.building} • {alt.floor}</p>
                      
                      <div className="flex items-center justify-between text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl">
                        <span>Capacity: <strong>{alt.capacity}</strong></span>
                        <span>Surplus: <strong>+{Math.max(0, alt.capacity - req.student_count)} seats</strong></span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        {alt.reason}
                      </p>

                      {alt.trade_off && (
                        <div className="p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 font-medium">
                          {alt.trade_off}
                        </div>
                      )}
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100">
                      <button
                        id={`btn-confirm-alt-${alt.facility_id}`}
                        onClick={() => handleOpenConfirm(alt)}
                        className="w-full py-2.5 px-3 bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 font-bold text-xs rounded-xl transition-all"
                      >
                        Select Alternative
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Review Dialog Modal */}
      {isReviewOpen && selectedCandidate && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 sm:p-8 shadow-elevated space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                Review & Confirm
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 mt-2">Confirm Facility Booking</h3>
              <p className="text-xs text-slate-500 mt-1">
                A transactional lock will verify real-time availability before saving this allocation.
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Event:</span>
                <span className="font-bold text-slate-900">{req.event_name} ({req.event_type})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Facility:</span>
                <span className="font-bold text-indigo-600">{selectedCandidate.facility_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Location:</span>
                <span className="font-medium text-slate-800">{selectedCandidate.building} • {selectedCandidate.floor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Capacity Fit:</span>
                <span className="font-medium text-slate-800">{req.student_count} attendees in {selectedCandidate.capacity}-seat venue</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Time Window:</span>
                <span className="font-semibold text-slate-900">{req.start_datetime} to {req.end_datetime}</span>
              </div>
            </div>

            {conflictError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                {conflictError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsReviewOpen(false)}
                disabled={confirming}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button
                id="btn-dialog-confirm"
                type="button"
                onClick={handleExecuteAllocation}
                disabled={confirming}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
              >
                {confirming ? 'Locking & Confirming...' : 'Confirm & Save Allocation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
