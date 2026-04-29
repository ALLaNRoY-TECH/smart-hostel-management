import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageSquare, Key, Activity, ShieldCheck, Home, Shield } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { GlassCard } from '../components/ui/GlassCard';

export function Navbar() {
  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b-0 border-white/50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent p-0.5 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-background rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-primary" />
              </div>
            </div>
            <span className="font-bold text-xl tracking-tight text-text">
              SmartHostel
            </span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link to="/login/student">
              <Button variant="ghost" className="hidden sm:flex">Student Login</Button>
            </Link>
            <Link to="/login/admin">
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

const features = [
  { icon: MessageSquare, title: 'Complaint Management', desc: 'Raise and track issues in real-time.' },
  { icon: Activity, title: 'Real-time Updates', desc: 'Instant notifications on your requests.' },
  { icon: ShieldCheck, title: 'Admin Control', desc: 'Complete oversight with concurrency locks.' }
];

export function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col overflow-hidden bg-background">
      <Navbar />
      
      {/* Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-accent/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob" />
        <div className="absolute top-[20%] right-[-10%] w-[35vw] h-[35vw] bg-primary-light/10 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000" />
      </div>

      <main className="flex-grow pt-32 relative z-10">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8 max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-text">
              Digitizing Hostel Life with <br />
              <span className="text-gradient">Smart Automation</span>
            </h1>
            <p className="text-xl text-primary-light max-w-2xl mx-auto">
              A premium, concurrent, and highly responsive management system designed for modern student living.
            </p>
            <div className="flex items-center justify-center gap-4 pt-4">
              <Link to="/login/student">
                <Button variant="primary" className="text-lg px-8">Student Portal</Button>
              </Link>
              <Link to="/login/admin">
                <Button variant="outline" className="text-lg px-8">Admin Access</Button>
              </Link>
            </div>
          </motion.div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
          >
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <GlassCard className="h-full p-8 flex flex-col items-center text-center gap-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10">
                    <feature.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-text">{feature.title}</h3>
                  <p className="text-primary-light">{feature.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </section>
      </main>
    </div>
  );
}
