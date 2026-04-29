import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  History,
  AlertTriangle,
  Loader2,
  Wrench,
  UserCheck,
  XCircle
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAppContext } from '../context/AppContext';
import { useLocation, useNavigate } from 'react-router-dom';

export function StudentDashboard() {
  const { user, logout, complaints, fetchComplaints, addComplaint } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({ title: '', desc: '' });

  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/student/raise')) return 'raise';
    if (path.includes('/student/list')) return 'history';
    if (path.includes('/student/profile')) return 'profile';
    return 'overview';
  };

  const activeTab = getActiveTab();

  useEffect(() => {
    const loadData = async () => {
      if (user?.id) {
        setIsLoading(true);
        try {
          await fetchComplaints();
        } catch (err) {
          setError('Could not load complaints.');
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadData();
  }, [user]);

  // Derived status logic
  const getDisplayStatus = (c) => {
    if (c.assigned_worker === 'REJECTED') return 'rejected';
    return (c.status || 'pending').toLowerCase();
  };

  const stats = [
    { label: 'Total',       value: complaints.length,                                             icon: AlertCircle,  color: 'text-gray-600',   bg: 'bg-gray-100' },
    { label: 'Pending',     value: complaints.filter(c => getDisplayStatus(c) === 'pending').length, icon: Clock,        color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { label: 'In Progress', value: complaints.filter(c => getDisplayStatus(c) === 'in_progress').length, icon: Wrench,       color: 'text-blue-600',   bg: 'bg-blue-100' },
    { label: 'Resolved',    value: complaints.filter(c => getDisplayStatus(c) === 'resolved').length, icon: CheckCircle2, color: 'text-green-600',  bg: 'bg-green-100' },
    { label: 'Rejected',    value: complaints.filter(c => getDisplayStatus(c) === 'rejected').length, icon: XCircle,      color: 'text-red-600',    bg: 'bg-red-100' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.desc) return;
    
    setIsSubmitting(true);
    try {
      await addComplaint({ title: formData.title, description: formData.desc });
      setFormData({ title: '', desc: '' });
      navigate('/student'); // Go back to overview
    } catch (err) {
      console.error(err);
      alert("Failed to submit complaint. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && complaints.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-primary/60 font-medium">Brewing your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Student Portal</h1>
          <p className="text-primary/60">Manage your hostel complaints and requests</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => navigate('/student')}
            variant={activeTab === 'overview' ? 'default' : 'outline'}
            className="rounded-full px-6"
          >
            Overview
          </Button>
          <Button 
            onClick={() => navigate('/student/list')}
            variant={activeTab === 'history' ? 'default' : 'outline'}
            className="rounded-full px-6"
          >
            My Requests
          </Button>
          <Button 
            onClick={() => navigate('/student/raise')}
            variant="accent"
            className="rounded-full px-6 shadow-lg shadow-accent/20"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            New Request
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}

      {/* Overview Tab */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {stats.map((stat, i) => (
                <GlassCard key={i} className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-3xl font-bold text-primary">{stat.value}</h3>
                    <p className="text-xs font-medium text-primary/60 uppercase tracking-wider">{stat.label}</p>
                  </div>
                </GlassCard>
              ))}
            </div>

            {/* Recent Complaints Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <GlassCard className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                    <History className="w-5 h-5" /> Recent Requests
                  </h3>
                  <button
                    onClick={() => navigate('/student/list')}
                    className="text-sm font-semibold text-accent hover:text-accent-dark transition-colors"
                  >
                    View All
                  </button>
                </div>

                <div className="space-y-4">
                  {complaints.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-primary/40 italic">No complaints raised yet</p>
                    </div>
                  ) : (
                    complaints.slice(0, 3).map((c) => {
                      const s = getDisplayStatus(c);
                      return (
                        <div key={c.id} className="p-4 rounded-xl bg-white/40 border border-primary/5 hover:border-primary/20 transition-all group">
                          <div className="flex justify-between items-start mb-2 gap-2">
                            <h4 className="font-bold text-primary group-hover:text-accent transition-colors">{c.title}</h4>
                            <span className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                              s === 'resolved'    ? 'bg-green-100 text-green-700 border-green-200' :
                              s === 'in_progress' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                              s === 'rejected'    ? 'bg-red-100 text-red-700 border-red-200' :
                              'bg-yellow-100 text-yellow-700 border-yellow-200'
                            }`}>
                              {s === 'resolved' && <CheckCircle2 className="w-2.5 h-2.5" />}
                              {s === 'in_progress' && <Wrench className="w-2.5 h-2.5" />}
                              {s === 'pending' && <Clock className="w-2.5 h-2.5" />}
                              {s === 'rejected' && <XCircle className="w-2.5 h-2.5" />}
                              {s === 'in_progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
                            </span>
                          </div>
                          
                          {s === 'rejected' ? (
                            <p className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-100 italic">
                              "This request was not approved by the admin as it did not meet hostel guidelines."
                            </p>
                          ) : (
                            <p className="text-sm text-primary/70 line-clamp-2">{c.description}</p>
                          )}
                          
                          <div className="mt-3 flex items-center justify-between text-[10px] text-primary/40 font-medium">
                            <span>REF: #{c.id?.toString().padStart(4, '0')}</span>
                            {c.assigned_worker && c.assigned_worker !== 'REJECTED' && (
                              <span className="flex items-center gap-1 text-blue-600">
                                <UserCheck className="w-3 h-3" /> {c.assigned_worker}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </GlassCard>

              {/* Quick Action: New Complaint */}
              <GlassCard className="p-8 bg-primary/5 border-primary/10">
                <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                  <Send className="w-5 h-5" /> Quick Submit
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-primary/60 uppercase">Problem Title</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g., Leaking Tap in Room 204"
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      className="w-full bg-white/60 border border-primary/10 p-3 rounded-xl focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-primary/60 uppercase">Detailed Description</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Describe the issue in detail..."
                      value={formData.desc}
                      onChange={e => setFormData({ ...formData, desc: e.target.value })}
                      className="w-full bg-white/60 border border-primary/10 p-3 rounded-xl focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all resize-none"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full py-4 rounded-xl shadow-lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting...</span>
                      </div>
                    ) : "Submit Complaint"}
                  </Button>
                </form>
              </GlassCard>
            </div>
          </motion.div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-primary">Complaint History</h2>
              <Badge variant="outline" className="text-primary">{complaints.length} Records</Badge>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {complaints.length === 0 ? (
                <GlassCard className="p-12 text-center">
                  <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <History className="w-8 h-8 text-primary/20" />
                  </div>
                  <p className="text-primary/60 font-medium">No complaints found in your history.</p>
                </GlassCard>
              ) : (
                complaints.map((c) => {
                  const s = getDisplayStatus(c);
                  return (
                    <GlassCard
                      key={c.id}
                      className={`p-6 border-l-4 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                        s === 'resolved'    ? 'border-l-green-400' :
                        s === 'in_progress' ? 'border-l-blue-400'  :
                        s === 'rejected'    ? 'border-l-red-400'   :
                        'border-l-yellow-400'
                      }`}
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h4 className="text-lg font-bold text-primary">{c.title}</h4>
                          <span className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold border uppercase ${
                            s === 'resolved'    ? 'bg-green-100 text-green-700 border-green-200' :
                            s === 'in_progress' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                            s === 'rejected'    ? 'bg-red-100 text-red-700 border-red-200' :
                            'bg-yellow-100 text-yellow-700 border-yellow-200'
                          }`}>
                            {s === 'resolved'    && <CheckCircle2 className="w-3 h-3" />}
                            {s === 'in_progress' && <Wrench className="w-3 h-3" />}
                            {s === 'pending'     && <Clock className="w-3 h-3" />}
                            {s === 'rejected'    && <XCircle className="w-3 h-3" />}
                            {s === 'in_progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
                          </span>
                        </div>
                        
                        {s === 'rejected' ? (
                          <p className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-100 italic">
                            "This request was not approved by the admin as it did not meet hostel guidelines."
                          </p>
                        ) : (
                          <p className="text-primary/70 max-w-2xl text-sm">{c.description}</p>
                        )}
                        
                        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-primary/40">
                          <span>REF: #{c.id?.toString().padStart(4, '0')}</span>
                          <span>•</span>
                          <span>{c.created_at ? new Date(c.created_at).toLocaleDateString() : new Date().toLocaleDateString()}</span>
                          {c.assigned_worker && c.assigned_worker !== 'REJECTED' && (
                            <span className="flex items-center gap-1 text-blue-600 font-semibold">
                              <UserCheck className="w-3 h-3" /> {c.assigned_worker}
                            </span>
                          )}
                        </div>
                      </div>
                    </GlassCard>
                  );
                })
              )}
            </div>
          </motion.div>
        )}

        {/* Raise Tab (Full Form) */}
        {activeTab === 'raise' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-2xl mx-auto"
          >
            <GlassCard className="p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PlusCircle className="w-8 h-8 text-accent" />
                </div>
                <h2 className="text-2xl font-bold text-primary">New Service Request</h2>
                <p className="text-primary/60">Fill in the details below to alert our staff</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-primary/80">Issue Category / Title</label>
                  <input
                    required
                    type="text"
                    placeholder="Brief summary of the problem"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-white/50 border border-primary/20 p-4 rounded-xl focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-primary/80">Description</label>
                  <textarea
                    required
                    rows={6}
                    placeholder="Please provide details like room number, urgency, etc."
                    value={formData.desc}
                    onChange={e => setFormData({ ...formData, desc: e.target.value })}
                    className="w-full bg-white/50 border border-primary/20 p-4 rounded-xl focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all resize-none"
                  />
                </div>
                <div className="flex gap-4 pt-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1 py-4"
                    onClick={() => navigate('/student')}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-[2] py-4 shadow-xl"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Sending..." : "Submit Request"}
                  </Button>
                </div>
              </form>
            </GlassCard>
          </motion.div>
        )}

        {activeTab === 'profile' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto py-10">
            <GlassCard className="p-10 text-center space-y-6">
              <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-full mx-auto flex items-center justify-center text-white text-3xl font-bold shadow-xl">
                {user?.name?.[0] || 'S'}
              </div>
              <div>
                <h2 className="text-3xl font-bold text-primary">{user?.name}</h2>
                <p className="text-primary/60 font-medium">{user?.email}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-left">
                <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                  <span className="text-[10px] uppercase tracking-widest text-primary/40 font-bold">User Role</span>
                  <p className="text-primary font-bold">Student</p>
                </div>
                <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                  <span className="text-[10px] uppercase tracking-widest text-primary/40 font-bold">Student ID</span>
                  <p className="text-primary font-bold">#{user?.id}</p>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4" onClick={logout}>Sign Out</Button>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}