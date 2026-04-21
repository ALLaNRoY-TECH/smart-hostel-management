import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  User as UserIcon, 
  Send, 
  LayoutDashboard, 
  History,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

import { useAppContext } from '../context/AppContext';

const API_URL = 'http://localhost:5000/api';

export function StudentDashboard() {
  const { user, logout } = useAppContext();
  const [complaints, setComplaints] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({ title: '', desc: '' });
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'raise', 'history'

  const fetchComplaints = useCallback(async (studentId) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/complaints?studentId=${studentId}`);
      if (!res.ok) throw new Error('Failed to fetch complaints');
      const data = await res.json();
      setComplaints(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError('Could not load your complaints. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchComplaints(user.id);
    } else if (user === null) {
      setIsLoading(false);
    }
  }, [user, fetchComplaints]);

  const stats = [
    { label: 'Total', value: complaints.length, icon: AlertCircle, color: 'text-primary' },
    { label: 'Pending', value: complaints.filter(c => c.status === 'Pending').length, icon: Clock, color: 'text-amber-600' },
    { label: 'Resolved', value: complaints.filter(c => c.status === 'Resolved').length, icon: CheckCircle2, color: 'text-green-600' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.desc) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/complaints`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: user.id,
          title: formData.title,
          description: formData.desc
        })
      });

      if (!res.ok) throw new Error('Submission failed');
      const data = await res.json();

      if (data.success) {
        setFormData({ title: '', desc: '' });
        await fetchComplaints(user.id);
        setActiveTab('overview');
      }
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
            onClick={() => setActiveTab('overview')}
            variant={activeTab === 'overview' ? 'default' : 'outline'}
            className="rounded-full px-6"
          >
            Overview
          </Button>
          <Button 
            onClick={() => setActiveTab('history')}
            variant={activeTab === 'history' ? 'default' : 'outline'}
            className="rounded-full px-6"
          >
            My Requests
          </Button>
          <Button 
            onClick={() => setActiveTab('raise')}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stats.map((stat, i) => (
                <GlassCard key={i} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-primary/5 ${stat.color}`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <Badge variant="outline" className="opacity-50">This Month</Badge>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-4xl font-bold text-primary">{stat.value}</h3>
                    <p className="text-sm font-medium text-primary/60 uppercase tracking-wider">{stat.label}</p>
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
                    onClick={() => setActiveTab('history')}
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
                    complaints.slice(0, 3).map((c) => (
                      <div key={c.id} className="p-4 rounded-xl bg-white/40 border border-primary/5 hover:border-primary/20 transition-all group">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-primary group-hover:text-accent transition-colors">{c.title}</h4>
                          <Badge variant={c.status === 'Resolved' ? 'success' : 'warning'}>
                            {c.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-primary/70 line-clamp-2">{c.description}</p>
                        <div className="mt-3 text-[10px] text-primary/40 font-medium">
                          REF: #{c.id?.toString().padStart(4, '0')}
                        </div>
                      </div>
                    ))
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
                complaints.map((c) => (
                  <GlassCard key={c.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h4 className="text-lg font-bold text-primary">{c.title}</h4>
                        <Badge variant={c.status === 'Resolved' ? 'success' : 'warning'}>
                          {c.status}
                        </Badge>
                      </div>
                      <p className="text-primary/70 max-w-2xl">{c.description}</p>
                      <div className="flex items-center gap-4 text-xs font-medium text-primary/40">
                        <span>REF: #{c.id?.toString().padStart(4, '0')}</span>
                        <span>•</span>
                        <span>{new Date().toLocaleDateString()}</span> {/* Ideally from DB */}
                      </div>
                    </div>
                    {c.status === 'Resolved' && (
                      <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-full text-sm font-bold">
                        <CheckCircle2 className="w-4 h-4" /> Fixed
                      </div>
                    )}
                  </GlassCard>
                ))
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
                    onClick={() => setActiveTab('overview')}
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
      </AnimatePresence>
    </div>
  );
}