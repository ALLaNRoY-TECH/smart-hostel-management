import { useState } from 'react';
import { motion } from 'framer-motion';
import { PlusCircle, Clock, CheckCircle2, AlertCircle, User as UserIcon } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAppContext } from '../context/AppContext';
import { useLocation } from 'react-router-dom';

export function StudentDashboard() {
  const { complaints, addComplaint, user } = useAppContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ title: '', category: 'Maintenance', desc: '' });
  const location = useLocation();

  const stats = [
    { label: 'Total Requests', value: complaints.length, icon: AlertCircle, color: 'text-primary' },
    { label: 'Pending', value: complaints.filter(c => c.status === 'pending').length, icon: Clock, color: 'text-amber-600' },
    { label: 'Resolved', value: complaints.filter(c => c.status === 'resolved').length, icon: CheckCircle2, color: 'text-emerald-600' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await addComplaint({ title: formData.title, category: formData.category, description: formData.desc });
    setFormData({ title: '', category: 'Maintenance', desc: '' });
    setIsSubmitting(false);
  };

  const currentPath = location.pathname;

  const renderRaiseComplaint = () => (
    <GlassCard className="p-6 max-w-2xl mx-auto w-full border-primary/20">
      <h3 className="text-xl font-bold text-text mb-6 flex items-center gap-2">
        <PlusCircle className="w-5 h-5 text-accent" /> New Complaint
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text mb-1">Title</label>
          <input 
            required
            type="text" 
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
            className="w-full bg-white/60 border border-primary/20 rounded-lg px-4 py-2.5 text-text focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
            placeholder="e.g., Fan not working"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-1">Category</label>
          <select 
            value={formData.category}
            onChange={e => setFormData({...formData, category: e.target.value})}
            className="w-full bg-white/60 border border-primary/20 rounded-lg px-4 py-2.5 text-text focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
          >
            <option>Maintenance</option>
            <option>IT Support</option>
            <option>Cleaning</option>
            <option>Admin</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-1">Description</label>
          <textarea 
            required
            rows="4"
            value={formData.desc}
            onChange={e => setFormData({...formData, desc: e.target.value})}
            className="w-full bg-white/60 border border-primary/20 rounded-lg px-4 py-2.5 text-text focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors resize-none"
            placeholder="Detail your issue..."
          />
        </div>
        <Button 
          type="submit" 
          variant="primary" 
          className="w-full mt-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Request'}
        </Button>
      </form>
    </GlassCard>
  );

  const renderComplaintList = () => (
    <div className="space-y-4 max-w-4xl mx-auto w-full">
      <h3 className="text-xl font-bold text-text mb-4">My Complaints</h3>
      {complaints.length === 0 && <p className="text-primary-light">No complaints found.</p>}
      {complaints.map((complaint, i) => (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          key={complaint.id}
        >
          <GlassCard hover={true} className="p-5 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center border-primary/10">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-sm font-medium text-primary-light">CMP-{complaint.id}</span>
                <Badge status={complaint.status} className="capitalize">{complaint.status}</Badge>
              </div>
              <h4 className="text-lg font-semibold text-text">{complaint.title}</h4>
              <div className="text-sm text-primary-light mt-1 flex items-center gap-4">
                <span>{complaint.category}</span>
                <span>•</span>
                <span>{new Date(complaint.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      ))}
    </div>
  );

  const renderProfile = () => (
    <div className="max-w-2xl mx-auto space-y-6 w-full">
      <GlassCard className="p-8 text-center flex flex-col items-center gap-4 border-primary/20">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent p-1">
           <div className="w-full h-full bg-background rounded-full flex items-center justify-center">
             <UserIcon className="w-10 h-10 text-primary" />
           </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-text">{user?.name}</h2>
          <p className="text-primary-light">{user?.email}</p>
        </div>
        <div className="w-full grid grid-cols-2 gap-4 mt-4">
          <div className="bg-white/50 p-4 rounded-lg border border-primary/10">
             <div className="text-sm text-primary-light mb-1">Student ID</div>
             <div className="text-text font-medium">STU-{user?.id}</div>
          </div>
          <div className="bg-white/50 p-4 rounded-lg border border-primary/10">
             <div className="text-sm text-primary-light mb-1">Role</div>
             <div className="text-text font-medium capitalize">Student</div>
          </div>
        </div>
      </GlassCard>
    </div>
  );

  const renderDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-full">
        {stats.map((stat, i) => (
          <GlassCard key={i} className="flex items-center p-6 gap-4 border-primary/10">
            <div className={`p-4 rounded-xl bg-white/80 border border-primary/5 ${stat.color}`}>
              <stat.icon className="w-8 h-8" />
            </div>
            <div>
              <p className="text-primary-light font-medium">{stat.label}</p>
              <h3 className="text-3xl font-bold text-text">{stat.value}</h3>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
        <div className="lg:col-span-1">
          {renderRaiseComplaint()}
        </div>
        <div className="lg:col-span-2 space-y-4">
          {renderComplaintList()}
        </div>
      </div>
    </>
  );

  return (
    <div className="max-w-6xl mx-auto flex flex-col items-center">
      {currentPath === '/student/raise' ? renderRaiseComplaint() :
       currentPath === '/student/list' ? renderComplaintList() :
       currentPath === '/student/profile' ? renderProfile() :
       renderDashboard()}
    </div>
  );
}
