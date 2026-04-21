import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, 
  Unlock, 
  Check, 
  Clock, 
  Users, 
  AlertTriangle, 
  LayoutDashboard, 
  List, 
  Search,
  Filter,
  MoreHorizontal,
  ChevronRight
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAppContext } from '../context/AppContext';
import { useLocation } from 'react-router-dom';

export function AdminDashboard() {
  const { complaints, updateComplaintStatus, toggleLock, user, fetchComplaints } = useAppContext();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const adminId = user?.id;
  const location = useLocation();

  console.log("AdminDashboard User:", user);
  console.log("AdminDashboard Complaints:", complaints);

  useEffect(() => {
    if (user) fetchComplaints();
  }, [user]);

  const filteredComplaints = (complaints || []).filter(c => {
    const status = c.status || 'Pending';
    const title = c.title || '';
    const id = c.id || '';
    
    const matchesFilter = filter === 'all' || status.toLowerCase() === filter.toLowerCase();
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         id.toString().includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  const handleUpdateStatus = (id, currentStatus) => {
    const status = currentStatus || 'Pending';
    const nextStatus = status.toLowerCase() === 'pending' ? 'progress' : 
                      status.toLowerCase() === 'progress' ? 'resolved' : 'pending';
    updateComplaintStatus(id, nextStatus);
  };

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
              className="w-full pl-10 pr-4 py-2 bg-white/50 border border-primary/20 rounded-xl focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none text-sm transition-all"
            />
          </div>
          <div className="flex bg-primary/5 p-1 rounded-xl border border-primary/10">
            {['all', 'pending', 'progress', 'resolved'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  filter === f ? 'bg-primary text-white shadow-lg' : 'text-primary/60 hover:text-primary hover:bg-primary/5'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence>
          {filteredComplaints.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center">
              <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-primary/20" />
              </div>
              <p className="text-primary/60 font-medium">No requests found matching your criteria</p>
            </motion.div>
          ) : (
            filteredComplaints.map((complaint, i) => {
              const isLocked = complaint.locked_by !== null;
              const isLockedByMe = complaint.locked_by === adminId;
              const isLockedByOther = isLocked && !isLockedByMe;
              const status = (complaint.status || 'Pending').toLowerCase();

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={complaint.id}
                >
                  <GlassCard 
                    className={`p-6 border-l-4 transition-all ${
                      isLockedByOther ? 'opacity-60 grayscale-[0.5] border-l-primary/10' : 
                      status === 'resolved' ? 'border-l-green-500' :
                      status === 'progress' ? 'border-l-amber-500' : 'border-l-primary'
                    }`}
                    hover={!isLockedByOther}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold text-primary/40 tracking-widest uppercase">CMP-{complaint.id}</span>
                          <Badge variant={status === 'resolved' ? 'success' : status === 'progress' ? 'warning' : 'default'}>
                            {complaint.status}
                          </Badge>
                          {isLocked && (
                            <Badge variant="locked">
                              <Lock className="w-3 h-3 mr-1" /> {isLockedByMe ? 'My Lock' : 'Locked'}
                            </Badge>
                          )}
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-primary mb-1">{complaint.title}</h4>
                          <p className="text-primary/70 text-sm line-clamp-2">{complaint.description}</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-medium text-primary/40">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date().toLocaleDateString()}</span>
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" /> Student ID: {complaint.student_id}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end md:self-center">
                        <button 
                          onClick={() => toggleLock(complaint.id, adminId)}
                          disabled={isLockedByOther}
                          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all border-2 ${
                            isLockedByOther ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' :
                            isLockedByMe ? 'bg-rose-50 border-rose-200 text-rose-500 hover:bg-rose-100 shadow-lg shadow-rose-100' : 
                            'bg-white border-primary/10 text-primary hover:border-primary/30'
                          }`}
                          title={isLockedByMe ? "Release lock" : "Lock for processing"}
                        >
                          {isLockedByMe ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                        </button>
                        
                        <Button 
                          variant={status === 'resolved' ? 'outline' : 'accent'}
                          className="h-12 px-6 rounded-xl text-sm font-bold shadow-lg min-w-[140px]"
                          disabled={!isLockedByMe}
                          onClick={() => handleUpdateStatus(complaint.id, complaint.status)}
                        >
                          {status === 'pending' ? 'Accept Issue' : 
                           status === 'progress' ? 'Mark Resolved' : 'Reopen Request'}
                        </Button>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6 bg-emerald-50/30 border-emerald-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-emerald-100 text-emerald-600">
              <Check className="w-6 h-6" />
            </div>
            <Badge variant="success">Online</Badge>
          </div>
          <h3 className="text-emerald-900 text-xl font-bold">DB Status</h3>
          <p className="text-emerald-700/60 text-sm">System synchronized with MySQL</p>
        </GlassCard>

        <GlassCard className="p-6 bg-amber-50/30 border-amber-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-amber-100 text-amber-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <Badge variant="warning">Attention</Badge>
          </div>
          <h3 className="text-amber-900 text-xl font-bold">{(complaints || []).filter(c => (c.status || 'Pending').toLowerCase() === 'pending').length} Pending</h3>
          <p className="text-amber-700/60 text-sm">Requests awaiting review</p>
        </GlassCard>

        <GlassCard className="p-6 bg-primary/5 border-primary/10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              <List className="w-6 h-6" />
            </div>
            <Badge variant="default">Lifetime</Badge>
          </div>
          <h3 className="text-primary text-xl font-bold">{complaints.length} Total Issues</h3>
          <p className="text-primary/60 text-sm">Total complaints recorded</p>
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
           <p className="text-primary/60 max-w-md mx-auto">This module is currently being optimized for large datasets. Check back soon for student profile management.</p>
         </div>
       ) :
       renderDashboard()}
    </div>
  );
}
