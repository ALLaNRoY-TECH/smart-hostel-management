import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock,
  Unlock,
  Check,
  CheckCircle2,
  Clock,
  Users,
  AlertTriangle,
  List,
  Search,
  Wrench,
  UserCheck,
  Loader2,
  ChevronDown
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAppContext } from '../context/AppContext';
import { useLocation } from 'react-router-dom';

const WORKERS = ['Electrician', 'Plumber', 'Carpenter', 'Cleaner', 'Technician'];

function StatusBadge({ status }) {
  const map = {
    pending:     { label: 'Pending',     cls: 'bg-amber-100 text-amber-700 border-amber-200' },
    in_progress: { label: 'In Progress', cls: 'bg-blue-100 text-blue-700 border-blue-200' },
    resolved:    { label: 'Resolved',    cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  };
  const s = status?.toLowerCase() || 'pending';
  const cfg = map[s] || map.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${cfg.cls}`}>
      {s === 'pending'     && <Clock className="w-3 h-3" />}
      {s === 'in_progress' && <Wrench className="w-3 h-3" />}
      {s === 'resolved'    && <CheckCircle2 className="w-3 h-3" />}
      {cfg.label}
    </span>
  );
}

function ComplaintCard({ complaint, adminId, onUpdateComplaint }) {
  const status = (complaint.status || 'pending').toLowerCase();
  const isLockedByMe    = complaint.locked_by === adminId;
  const isLockedByOther = complaint.locked_by !== null && !isLockedByMe;

  const [selectedWorker, setSelectedWorker] = useState(complaint.assigned_worker || '');
  const [loadingAction, setLoadingAction] = useState(null); // 'accept' | 'assign' | 'resolve' | 'lock'
  const [errorMsg, setErrorMsg]           = useState('');

  // Sync worker dropdown when complaint updates externally
  useEffect(() => {
    setSelectedWorker(complaint.assigned_worker || '');
  }, [complaint.assigned_worker]);

  const run = async (actionKey, fields) => {
    setLoadingAction(actionKey);
    setErrorMsg('');
    try {
      await onUpdateComplaint(complaint.id, fields);
    } catch (err) {
      setErrorMsg(err.message || 'Action failed. Please try again.');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleAccept = () => {
    run('accept', {
      status: 'in_progress',
      locked_by: adminId
    });
  };

  const handleAssignWorker = () => {
    if (!selectedWorker) return;
    run('assign', { assigned_worker: selectedWorker });
  };

  const handleResolve = () => {
    run('resolve', {
      status: 'resolved',
      locked_by: null
    });
  };

  const handleToggleLock = () => {
    run('lock', { locked_by: isLockedByMe ? null : adminId });
  };

  const borderColor =
    isLockedByOther   ? 'border-l-gray-300' :
    status === 'resolved'    ? 'border-l-emerald-400' :
    status === 'in_progress' ? 'border-l-blue-400'    :
    'border-l-amber-400';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
    >
      <GlassCard
        className={`p-6 border-l-4 transition-all ${borderColor} ${isLockedByOther ? 'opacity-60 grayscale-[0.3]' : ''}`}
        hover={!isLockedByOther}
      >
        {/* ── Header row ── */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            {/* ID + Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold text-primary/40 tracking-widest uppercase">
                CMP-{complaint.id}
              </span>
              <StatusBadge status={complaint.status} />
              {isLockedByMe && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-600 border border-rose-200 uppercase">
                  <Lock className="w-2.5 h-2.5" /> My Lock
                </span>
              )}
              {isLockedByOther && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500 border border-gray-200 uppercase">
                  <Lock className="w-2.5 h-2.5" /> Locked
                </span>
              )}
            </div>

            {/* Title + description */}
            <div>
              <h4 className="text-xl font-bold text-primary mb-1">{complaint.title}</h4>
              <p className="text-primary/70 text-sm line-clamp-2">{complaint.description}</p>
            </div>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-primary/40">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {complaint.created_at
                  ? new Date(complaint.created_at).toLocaleDateString()
                  : new Date().toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {complaint.student_name
                  ? `${complaint.student_name} (ID: ${complaint.student_id})`
                  : `Student ID: ${complaint.student_id}`}
              </span>
              {complaint.assigned_worker && (
                <span className="flex items-center gap-1 text-blue-600 font-semibold">
                  <UserCheck className="w-3 h-3" />
                  {complaint.assigned_worker}
                </span>
              )}
            </div>

            {/* Error */}
            {errorMsg && (
              <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 border border-rose-200 px-3 py-2 rounded-xl">
                <AlertTriangle className="w-3 h-3 shrink-0" />
                {errorMsg}
              </div>
            )}
          </div>

          {/* ── Action column ── */}
          <div className="flex flex-col gap-3 items-end min-w-[200px]">

            {/* ---- PENDING: show lock button + Accept Issue ---- */}
            {status === 'pending' && (
              <div className="flex items-center gap-3">
                {/* Lock toggle */}
                <button
                  onClick={handleToggleLock}
                  disabled={isLockedByOther || loadingAction === 'lock'}
                  title={isLockedByMe ? "Release lock" : "Lock for processing"}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all border-2 ${
                    isLockedByOther
                      ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                      : isLockedByMe
                        ? 'bg-rose-50 border-rose-200 text-rose-500 hover:bg-rose-100 shadow-sm shadow-rose-100'
                        : 'bg-white border-primary/10 text-primary hover:border-primary/30'
                  }`}
                >
                  {loadingAction === 'lock'
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : isLockedByMe ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                </button>

                {/* Accept button */}
                <button
                  onClick={handleAccept}
                  disabled={isLockedByOther || loadingAction === 'accept'}
                  className={`h-11 px-6 rounded-xl text-sm font-bold transition-all shadow-md flex items-center gap-2 ${
                    isLockedByOther
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-[#6b4c2a] hover:bg-[#5a3d20] text-white shadow-[#6b4c2a]/20'
                  }`}
                >
                  {loadingAction === 'accept' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Accept Issue
                </button>
              </div>
            )}

            {/* ---- IN PROGRESS: worker dropdown + Mark Resolved ---- */}
            {status === 'in_progress' && (
              <div className="flex flex-col gap-3 w-full items-end">
                {/* Worker assignment row */}
                <div className="flex items-center gap-2 w-full">
                  <div className="relative flex-1">
                    <select
                      id={`worker-select-${complaint.id}`}
                      value={selectedWorker}
                      onChange={(e) => setSelectedWorker(e.target.value)}
                      disabled={loadingAction === 'assign'}
                      className="w-full appearance-none bg-white/70 border border-primary/20 rounded-xl px-3 py-2.5 pr-8 text-sm font-medium text-primary focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all"
                    >
                      <option value="">Assign Worker...</option>
                      {WORKERS.map(w => (
                        <option key={w} value={w}>{w}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                  </div>
                  <button
                    onClick={handleAssignWorker}
                    disabled={!selectedWorker || loadingAction === 'assign'}
                    className={`h-10 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                      !selectedWorker
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                    }`}
                  >
                    {loadingAction === 'assign'
                      ? <Loader2 className="w-3 h-3 animate-spin" />
                      : <UserCheck className="w-3 h-3" />}
                    {complaint.assigned_worker ? 'Update' : 'Assign'}
                  </button>
                </div>

                {/* Mark Resolved button */}
                <button
                  onClick={handleResolve}
                  disabled={loadingAction === 'resolve'}
                  className="h-11 w-full px-6 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200 flex items-center justify-center gap-2 transition-all"
                >
                  {loadingAction === 'resolve'
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <CheckCircle2 className="w-4 h-4" />}
                  Mark as Resolved
                </button>
              </div>
            )}

            {/* ---- RESOLVED: badge only ---- */}
            {status === 'resolved' && (
              <div className="flex flex-col items-end gap-2">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4" /> Resolved
                </span>
                {complaint.assigned_worker && (
                  <span className="text-xs text-primary/50 font-medium">
                    Handled by {complaint.assigned_worker}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

export function AdminDashboard() {
  const { complaints, updateComplaint, user, fetchComplaints } = useAppContext();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const adminId = user?.id;
  const location = useLocation();

  useEffect(() => {
    if (user) fetchComplaints();
  }, [user]);

  const filteredComplaints = (complaints || []).filter(c => {
    const status = (c.status || 'pending').toLowerCase();
    const title  = c.title || '';
    const id     = c.id || '';

    const matchesFilter =
      filter === 'all' ||
      (filter === 'progress' ? status === 'in_progress' : status === filter);
    const matchesSearch =
      title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      id.toString().includes(searchTerm);

    return matchesFilter && matchesSearch;
  });

  // Stats
  const pending    = complaints.filter(c => (c.status || 'pending').toLowerCase() === 'pending').length;
  const inProgress = complaints.filter(c => (c.status || '').toLowerCase() === 'in_progress').length;
  const resolved   = complaints.filter(c => (c.status || '').toLowerCase() === 'resolved').length;

  const renderComplaintsTable = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold text-primary">Service Requests</h2>
          <p className="text-primary/60">Manage hostel issues and maintenance tasks</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Search */}
          <div className="relative flex-1 lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
            <input
              type="text"
              placeholder="Search by ID or Title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/50 border border-primary/20 rounded-xl focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none text-sm transition-all"
            />
          </div>
          {/* Filter tabs */}
          <div className="flex bg-primary/5 p-1 rounded-xl border border-primary/10">
            {[
              { key: 'all',      label: 'ALL' },
              { key: 'pending',  label: 'PENDING' },
              { key: 'progress', label: 'PROGRESS' },
              { key: 'resolved', label: 'RESOLVED' },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  filter === f.key
                    ? 'bg-primary text-white shadow-lg'
                    : 'text-primary/60 hover:text-primary hover:bg-primary/5'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredComplaints.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center">
              <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-primary/20" />
              </div>
              <p className="text-primary/60 font-medium">No requests found matching your criteria</p>
            </motion.div>
          ) : (
            filteredComplaints.map((complaint) => (
              <ComplaintCard
                key={complaint.id}
                complaint={complaint}
                adminId={adminId}
                onUpdateComplaint={updateComplaint}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pending */}
        <GlassCard className="p-6 bg-amber-50/30 border-amber-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-amber-100 text-amber-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <Badge variant="warning">Pending</Badge>
          </div>
          <h3 className="text-amber-900 text-3xl font-bold">{pending}</h3>
          <p className="text-amber-700/60 text-sm mt-1">Awaiting action</p>
        </GlassCard>

        {/* In Progress */}
        <GlassCard className="p-6 bg-blue-50/30 border-blue-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
              <Wrench className="w-6 h-6" />
            </div>
            <Badge variant="default">Active</Badge>
          </div>
          <h3 className="text-blue-900 text-3xl font-bold">{inProgress}</h3>
          <p className="text-blue-700/60 text-sm mt-1">In Progress</p>
        </GlassCard>

        {/* Resolved */}
        <GlassCard className="p-6 bg-emerald-50/30 border-emerald-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-emerald-100 text-emerald-600">
              <Check className="w-6 h-6" />
            </div>
            <Badge variant="success">Done</Badge>
          </div>
          <h3 className="text-emerald-900 text-3xl font-bold">{resolved}</h3>
          <p className="text-emerald-700/60 text-sm mt-1">Resolved Issues</p>
        </GlassCard>
      </div>

      {renderComplaintsTable()}
    </div>
  );

  const currentPath = location.pathname;

  return (
    <div className="max-w-6xl mx-auto w-full pb-10">
      {currentPath === '/admin/complaints' ? renderComplaintsTable() :
       currentPath === '/admin/students' ? (
         <div className="py-20 text-center space-y-4">
           <Users className="w-16 h-16 text-primary/20 mx-auto" />
           <h2 className="text-2xl font-bold text-primary">Student Management</h2>
           <p className="text-primary/60 max-w-md mx-auto">
             This module is currently being optimized for large datasets.
           </p>
         </div>
       ) :
       renderDashboard()}
    </div>
  );
}
