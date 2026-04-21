import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { useAppContext } from '../context/AppContext';

export function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAppContext();
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/api/student/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await res.json();

      if (data.success) {
        alert("Registration Successful! Please login. 🔥");
        navigate('/login/student');
      } else {
        setError(data.message || data.error || "Registration failed ❌");
      }
    } catch (err) {
      console.error(err);
      setError(`Network or Server error: ${err.message} ❌`);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-md p-8">
        <div className="text-center mb-6">
          <UserPlus className="w-12 h-12 mx-auto text-primary mb-2" />
          <h2 className="text-2xl font-bold text-primary">Student Registration</h2>
          <p className="text-primary/60 text-sm">Join the SmartHostel community</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 text-red-500 p-3 rounded-lg text-sm text-center border border-red-100"
            >
              {error}
            </motion.div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-primary/80">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
              <input
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full bg-white/50 border border-primary/20 pl-10 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-primary/80">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
              <input
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full bg-white/50 border border-primary/20 pl-10 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-primary/80">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
              <input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                required
                className="w-full bg-white/50 border border-primary/20 pl-10 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full py-4 rounded-xl text-lg font-semibold shadow-lg shadow-primary/20"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </Button>

          <p className="text-center text-sm text-primary/60 mt-4">
            Already have an account?{' '}
            <Link to="/login/student" className="text-primary font-bold hover:underline">
              Login here
            </Link>
          </p>
        </form>
      </GlassCard>
    </div>
  );
}
