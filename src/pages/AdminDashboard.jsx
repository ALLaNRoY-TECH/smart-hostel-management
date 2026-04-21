import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Unlock, Check, Clock, Edit2, Users, AlertTriangle } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAppContext } from '../context/AppContext';
import { useLocation } from 'react-router-dom';

export function AdminDashboard() {
  const { complaints, updateComplaintStatus, toggleLock, user } = useAppContext();
  const [filter, setFilter] = useState('all');
  const adminId = user?.id;
  const location = useLocation();

  const filteredComplaints = complaints.filter(c => {
    if (filter === 'all') return true;
    return c.status === filter;
  });

  const handleUpdateStatus = (id, currentStatus) => {
    const nextStatus = currentStatus === 'pending' ? 'progress' : currentStatus === 'progress' ? 'resolved' : 'pending';
    updateComplaintStatus(id, nextStatus);
  };

  const renderComplaintsTable = () => (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-text">Complaint Management</h2>
          <p className="text-primary-light">Handle student requests with concurrency control.</p>
        </div>
        <div className="flex bg-white/50 p-1 rounded-lg border border-primary/20">
          {['all', 'pending', 'progress', 'resolved'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${
                filter === f ? 'bg-primary text-white shadow-md' : 'text-primary hover:bg-primary/5'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <GlassCard className="p-0 overflow-hidden w-full border-primary/20">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-primary/5 text-primary-light text-sm border-b border-primary/20">
              <tr>
                <th className="px-6 py-4 font-medium">ID</th>
                <th className="px-6 py-4 font-medium">Title & Category</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Concurrency</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/10">
              {filteredComplaints.map((complaint, i) => {
                const isLocked = complaint.locked_by !== null;
                const isLockedByMe = complaint.locked_by === adminId;
                const isLockedByOther = isLocked && !isLockedByMe;

                return (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    key={complaint.id} 
                    className={`hover:bg-primary/5 transition-colors ${isLockedByOther ? 'opacity-60 bg-gray-50' : 'bg-white/40'}`}
                  >
                    <td className="px-6 py-4 text-text font-medium">CMP-{complaint.id}</td>
                    <td className="px-6 py-4">
                      <div className="text-text font-medium mb-1">{complaint.title}</div>
                      <div className="text-xs text-primary-light">{complaint.category}</div>
                    </td>
                    <td className="px-6 py-4 text-primary-light text-sm">{new Date(complaint.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <Badge status={complaint.status} className="capitalize">
                        {complaint.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {isLocked ? (
                        <Badge status="locked" className="border-rose-200">
                          <Lock className="w-3 h-3 mr-1" /> {isLockedByMe ? 'Locked by you' : `Locked by Admin ${complaint.locked_by}`}
                        </Badge>
                      ) : (
                        <span className="text-xs text-primary flex items-center gap-1">
                          <Unlock className="w-3 h-3" /> Available
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => toggleLock(complaint.id, adminId)}
                          disabled={isLockedByOther}
                          className={`p-2 rounded-lg transition-colors border ${
                            isLockedByOther ? 'text-gray-400 border-gray-200 cursor-not-allowed' :
                            isLockedByMe ? 'bg-rose-100 text-rose-600 border-rose-200 hover:bg-rose-200' : 
                            'bg-white text-primary border-primary/20 hover:bg-primary/5'
                          }`}
                          title={isLockedByMe ? "Unlock record" : "Lock for editing"}
                        >
                          {isLockedByMe ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        </button>
                        
                        <Button 
                          variant={complaint.status === 'resolved' ? 'outline' : 'accent'}
                          className="px-3 py-1.5 text-xs h-auto w-24 shadow-none"
                          disabled={!isLockedByMe}
                          onClick={() => handleUpdateStatus(complaint.id, complaint.status)}
                        >
                          {complaint.status === 'pending' ? 'Start Work' : complaint.status === 'progress' ? 'Resolve' : 'Reopen'}
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
          {filteredComplaints.length === 0 && (
            <div className="p-8 text-center text-primary-light">
              No complaints found matching this filter.
            </div>
          )}
        </div>
      </GlassCard>
    </>
  );

  const renderStudents = () => (
    <div className="space-y-6 max-w-4xl mx-auto w-full">
      <h2 className="text-2xl font-bold text-text mb-6">Manage Students</h2>
      <GlassCard className="p-8 text-center border-dashed border-primary/30 bg-primary/5">
         <Users className="w-12 h-12 text-primary mx-auto mb-4" />
         <h3 className="text-xl font-bold text-text">Student Directory</h3>
         <p className="text-primary-light mt-2">The student directory module will be integrated here.</p>
      </GlassCard>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-6 w-full">
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <GlassCard className="p-6 border-primary/10">
           <h3 className="text-primary-light text-sm font-medium mb-2">System Status</h3>
           <div className="text-emerald-600 text-xl font-bold flex items-center gap-2"><Check className="w-5 h-5"/> DB Connected</div>
         </GlassCard>
         <GlassCard className="p-6 border-primary/10">
           <h3 className="text-primary-light text-sm font-medium mb-2">Pending Actions</h3>
           <div className="text-amber-600 text-2xl font-bold flex items-center gap-2">{complaints.filter(c => c.status === 'pending').length} Needs Review</div>
         </GlassCard>
         <GlassCard className="p-6 border-primary/10">
           <h3 className="text-primary-light text-sm font-medium mb-2">Total Issues</h3>
           <div className="text-primary text-2xl font-bold flex items-center gap-2">{complaints.length} Recorded</div>
         </GlassCard>
       </div>
       {renderComplaintsTable()}
    </div>
  );

  const currentPath = location.pathname;

  return (
    <div className="max-w-6xl mx-auto w-full">
      {currentPath === '/admin/complaints' ? renderComplaintsTable() :
       currentPath === '/admin/students' ? renderStudents() :
       renderDashboard()}
    </div>
  );
}
