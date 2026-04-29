import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  Clock,
  Users,
  AlertTriangle,
  Search,
  Wrench,
  UserCheck,
  Loader2,
  ChevronDown,
  ListFilter,
  MoreVertical,
  Trash2,
  Check,
  XCircle,
  FileText
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { useAppContext } from '../context/AppContext';
import { useLocation } from 'react-router-dom';

const WORKERS = ['Electrician', 'Plumber', 'Carpenter', 'Cleaner', 'Technician'];

function StatusBadge({ status }) {
  const map = {
    pending:     { label: 'Pending',     cls: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    in_progress: { label: 'In Progress', cls: 'bg-blue-100 text-blue-700 border-blue-200' },
    resolved:    { label: 'Resolved',    cls: 'bg-green-100 text-green-700 border-green-200' },
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

function ComplaintCard({ complaint, onUpdateComplaint }) {
  const status = (complaint.status || 'pending').toLowerCase();
  const [selectedWorker, setSelectedWorker] = useState(complaint.assigned_worker || '');
  const [loadingAction, setLoadingAction] = useState(null); 
  const [errorMsg, setErrorMsg] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setSelectedWorker(complaint.assigned_worker || '');
  }, [complaint.assigned_worker]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const run = async (actionKey, fields) => {
    setLoadingAction(actionKey);
    setErrorMsg('');
    try {
      await onUpdateComplaint(complaint.id, fields);
      setShowDropdown(false);
    } catch (err) {
      setErrorMsg(err.message || 'Action failed. Please try again.');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleAccept = () => {
    run('accept', { status: 'in_progress' });
  };

  const handleAssignWorker = () => {
    if (!selectedWorker) return;
    run('assign', { assigned_worker: selectedWorker });
  };

  const handleResolve = () => {
    run('resolve', { status: 'resolved' });
  };

  const handleReject = () => {
    run('reject', { status: 'resolved', assigned_worker: 'REJECTED' });
  };

  const borderColor =
    status === 'resolved'    ? 'border-l-green-400' :
    status === 'in_progress' ? 'border-l-blue-400'    :
    'border-l-yellow-400';

  return (
    <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className={showDropdown ? 'relative z-50' : 'relative z-0'}>
      <GlassCard className={`p-6 border-l-4 transition-all ${borderColor}`} hover>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold text-primary/40 tracking-widest uppercase">
                CMP-{complaint.id}
              </span>
              <StatusBadge status={complaint.status} />
            </div>

            <div>
              <h4 className="text-xl font-bold text-primary mb-1">{complaint.title}</h4>
              <p className="text-primary/70 text-sm line-clamp-2">{complaint.description}</p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-primary/40">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {complaint.created_at ? new Date(complaint.created_at).toLocaleDateString() : new Date().toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {complaint.student_name ? `${complaint.student_name} (ID: ${complaint.student_id})` : `Student ID: ${complaint.student_id}`}
              </span>
              {complaint.assigned_worker && complaint.assigned_worker !== 'REJECTED' && (
                <span className="flex items-center gap-1 text-blue-600 font-semibold">
                  <UserCheck className="w-3 h-3" />
                  {complaint.assigned_worker}
                </span>
              )}
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-xl">
                <AlertTriangle className="w-3 h-3 shrink-0" />
                {errorMsg}
              </div>
            )}

            {/* Worker Assignment if In Progress */}
            {status === 'in_progress' && (
              <div className="flex items-center gap-2 mt-4 max-w-sm">
                <div className="relative flex-1">
                  <select
                    value={selectedWorker}
                    onChange={(e) => setSelectedWorker(e.target.value)}
                    disabled={loadingAction === 'assign'}
                    className="w-full appearance-none bg-white/70 border border-primary/20 rounded-xl px-3 py-2.5 pr-8 text-sm font-medium text-primary focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
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
                    !selectedWorker ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                  }`}
                >
                  {loadingAction === 'assign' ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserCheck className="w-3 h-3" />}
                  {complaint.assigned_worker ? 'Update' : 'Assign'}
                </button>
              </div>
            )}
          </div>

          {/* Action column */}
          <div className="flex flex-col items-end min-w-[180px]">
            {loadingAction && loadingAction !== 'assign' ? (
               <div className="flex items-center gap-2 text-sm font-medium text-primary/60 px-4 py-2">
                 <Loader2 className="w-5 h-5 animate-spin" /> Processing...
               </div>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="h-11 px-5 rounded-xl text-sm font-bold transition-all shadow-md flex items-center gap-2 bg-[#6b4c2a] hover:bg-[#5a3d20] text-white shadow-[#6b4c2a]/20"
                >
                  Take Action <ChevronDown className="w-4 h-4" />
                </button>
                
                <AnimatePresence>
                  {showDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-full mr-2 top-0 w-52 bg-[#FAF7F2] rounded-xl shadow-2xl border border-primary/20 py-2 z-[100]"
                    >
                      {status === 'pending' && (
                        <button
                          onClick={handleAccept}
                          className="w-full text-left px-4 py-2.5 text-sm font-bold text-primary hover:bg-primary/10 hover:text-accent flex items-center gap-3 transition-colors"
                        >
                          <Check className="w-4 h-4" /> Accept Issue
                        </button>
                      )}
                      
                      {(status === 'pending' || status === 'in_progress') && (
                        <button
                          onClick={handleResolve}
                          className="w-full text-left px-4 py-2.5 text-sm font-bold text-primary hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-3 transition-colors"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Mark as Resolved
                        </button>
                      )}
                      
                      <button
                        onClick={handleReject}
                        className="w-full text-left px-4 py-2.5 text-sm font-bold text-primary hover:bg-rose-50 hover:text-rose-700 flex items-center gap-3 transition-colors border-t border-primary/10"
                      >
                        <XCircle className="w-4 h-4" /> Reject Request
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
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
  const location = useLocation();

  useEffect(() => {
    if (user) fetchComplaints();
  }, [user]);

  // Filter out rejected complaints from the dashboard entirely
  const validComplaints = (complaints || []).filter(c => c.assigned_worker !== 'REJECTED');

  const filteredComplaints = validComplaints.filter(c => {
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

  const total      = validComplaints.length;
  const pending    = validComplaints.filter(c => (c.status || 'pending').toLowerCase() === 'pending').length;
  const inProgress = validComplaints.filter(c => (c.status || '').toLowerCase() === 'in_progress').length;
  const resolved   = validComplaints.filter(c => (c.status || '').toLowerCase() === 'resolved').length;

  const renderComplaintsTable = () => (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold text-primary">Service Requests</h2>
          <p className="text-primary/60">Manage hostel issues and maintenance tasks</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
            <input
              type="text"
              placeholder="Search by ID or Title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/50 border border-primary/20 rounded-xl focus:ring-2 focus:ring-[#6b4c2a]/20 focus:border-[#6b4c2a] outline-none text-sm transition-all"
            />
          </div>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <GlassCard className="p-6 bg-white/40 border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gray-100 text-gray-600">
              <FileText className="w-6 h-6" />
            </div>
            <Badge variant="outline">Total</Badge>
          </div>
          <h3 className="text-gray-900 text-3xl font-bold">{total}</h3>
          <p className="text-gray-600 text-sm mt-1">Total Complaints</p>
        </GlassCard>

        <GlassCard className="p-6 bg-yellow-50/30 border-yellow-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-yellow-100 text-yellow-600">
              <Clock className="w-6 h-6" />
            </div>
            <Badge variant="warning">Pending</Badge>
          </div>
          <h3 className="text-yellow-900 text-3xl font-bold">{pending}</h3>
          <p className="text-yellow-700/60 text-sm mt-1">Awaiting action</p>
        </GlassCard>

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

        <GlassCard className="p-6 bg-green-50/30 border-green-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-green-100 text-green-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <Badge variant="success">Done</Badge>
          </div>
          <h3 className="text-green-900 text-3xl font-bold">{resolved}</h3>
          <p className="text-green-700/60 text-sm mt-1">Resolved Issues</p>
        </GlassCard>
      </div>

      {renderComplaintsTable()}
    </div>
  );

  const renderStudentsTable = () => {
    const studentStats = complaints.reduce((acc, c) => {
      if (!acc[c.student_id]) {
        acc[c.student_id] = {
          id: c.student_id,
          name: c.student_name || `Student ${c.student_id}`,
          total: 0,
          pending: 0,
          in_progress: 0,
          resolved: 0,
          rejected: 0
        };
      }
      const stat = acc[c.student_id];
      stat.total++;
      
      if (c.assigned_worker === 'REJECTED') {
        stat.rejected++;
      } else {
        const status = (c.status || 'pending').toLowerCase();
        if (status === 'resolved') stat.resolved++;
        else if (status === 'in_progress') stat.in_progress++;
        else stat.pending++;
      }
      return acc;
    }, {});

    const studentList = Object.values(studentStats).sort((a, b) => b.total - a.total);

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-primary">Student Management</h2>
          <p className="text-primary/60">Overview of student requests and statistics</p>
        </div>

        <GlassCard className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-primary/5 border-b border-primary/10">
                  <th className="px-6 py-4 text-xs font-bold text-primary/60 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-4 text-xs font-bold text-primary/60 uppercase tracking-wider text-center">Total Requests</th>
                  <th className="px-6 py-4 text-xs font-bold text-primary/60 uppercase tracking-wider text-center">Pending</th>
                  <th className="px-6 py-4 text-xs font-bold text-primary/60 uppercase tracking-wider text-center">In Progress</th>
                  <th className="px-6 py-4 text-xs font-bold text-primary/60 uppercase tracking-wider text-center">Resolved</th>
                  <th className="px-6 py-4 text-xs font-bold text-primary/60 uppercase tracking-wider text-center">Rejected</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {studentList.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-primary/40 font-medium">No student data available</td>
                  </tr>
                ) : (
                  studentList.map(student => (
                    <tr key={student.id} className="hover:bg-primary/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary font-bold">
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-primary">{student.name}</div>
                            <div className="text-xs text-primary/40 font-medium">ID: #{student.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-700 font-bold text-sm">
                          {student.total}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {student.pending > 0 ? <span className="text-yellow-600 font-bold">{student.pending}</span> : <span className="text-gray-300">-</span>}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {student.in_progress > 0 ? <span className="text-blue-600 font-bold">{student.in_progress}</span> : <span className="text-gray-300">-</span>}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {student.resolved > 0 ? <span className="text-green-600 font-bold">{student.resolved}</span> : <span className="text-gray-300">-</span>}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {student.rejected > 0 ? <span className="text-red-600 font-bold">{student.rejected}</span> : <span className="text-gray-300">-</span>}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    );
  };

  const currentPath = location.pathname;

  return (
    <div className="max-w-6xl mx-auto w-full pb-10">
      {currentPath === '/admin/complaints' ? renderComplaintsTable() :
       currentPath === '/admin/students' ? renderStudentsTable() :
       renderDashboard()}
    </div>
  );
}
