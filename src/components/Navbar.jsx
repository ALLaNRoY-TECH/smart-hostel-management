import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home, Shield } from 'lucide-react';
import { Button } from './ui/Button';

export function Navbar() {
  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b-0 border-slate-800/50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent p-0.5 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-900 rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-accent" />
              </div>
            </div>
            <span className="font-bold text-xl tracking-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-accent group-hover:to-primary-light transition-all duration-300">
              SmartHostel
            </span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link to="/student">
              <Button variant="ghost" className="hidden sm:flex">Student Portal</Button>
            </Link>
            <Link to="/admin">
              <Button variant="primary" className="gap-2">
                <Shield className="w-4 h-4" /> Admin Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
