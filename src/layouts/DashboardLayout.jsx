import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, MessageSquarePlus, List, User, Users, Shield, Bell, LogOut } from 'lucide-react';
import { cn } from '../components/ui/Button';
import { useAppContext } from '../context/AppContext';

export function DashboardLayout({ children, role = 'student' }) {
  const location = useLocation();
  const { user, logout } = useAppContext();

  const studentLinks = [
    { name: 'Dashboard', path: '/student', icon: LayoutDashboard },
    { name: 'Raise Complaint', path: '/student/raise', icon: MessageSquarePlus },
    { name: 'My Complaints', path: '/student/list', icon: List },
    { name: 'Profile', path: '/student/profile', icon: User },
  ];

  const adminLinks = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'All Complaints', path: '/admin/complaints', icon: List },
    { name: 'Manage Students', path: '/admin/students', icon: Users },
  ];

  const links = role === 'admin' ? adminLinks : studentLinks;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="w-64 glass border-r border-white/50 flex flex-col fixed h-full z-40"
      >
        <div className="h-20 flex items-center px-6 border-b border-white/50">
          <Link to="/" className="font-bold text-xl text-primary flex items-center gap-2">
            <Shield className="w-6 h-6 text-accent" /> SmartHostel
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link key={link.path} to={link.path}>
                <div className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium",
                  isActive 
                    ? "bg-primary text-white shadow-md" 
                    : "text-primary hover:bg-primary/5"
                )}>
                  <link.icon className={cn("w-5 h-5", isActive ? "text-accent" : "text-primary-light")} />
                  <span>{link.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/50">
          <button onClick={logout} className="w-full">
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-primary hover:bg-primary/5 transition-all cursor-pointer font-medium">
              <LogOut className="w-5 h-5 text-primary-light" />
              <span>Logout</span>
            </div>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 flex flex-col min-h-screen relative">
        <header className="h-20 glass border-b border-white/50 sticky top-0 z-30 px-8 flex items-center justify-between">
          <h2 className="text-xl font-bold text-text capitalize">{location.pathname.split('/').pop() || 'Dashboard'}</h2>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-bold text-text">{user?.name}</div>
              <div className="text-xs text-primary-light capitalize">{role}</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent p-0.5">
              <div className="w-full h-full bg-background rounded-full flex items-center justify-center text-sm font-bold text-primary">
                {role === 'admin' ? 'A' : 'S'}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 p-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
