import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { useAppContext } from '../context/AppContext';

export function Login({ role }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAppContext();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(email, password, role);
      if (success) {
        navigate(`/${role}/dashboard`);
      } else {
        setError("Invalid credentials ❌");
      }
    } catch (err) {
      console.error(err);
      setError("Server error ❌");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-md p-8">
        <div className="text-center mb-6">
          {role === 'admin' ? <Shield className="w-12 h-12 mx-auto text-primary mb-2" /> : <User className="w-12 h-12 mx-auto text-primary mb-2" />}
          <h2 className="text-2xl font-bold capitalize text-primary">{role} Login</h2>
          <p className="text-primary/60 text-sm">Welcome back to SmartHostel</p>
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
            <label className="text-sm font-medium text-primary/80">Email Address</label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full bg-white/50 border border-primary/20 p-3 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-primary/80">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full bg-white/50 border border-primary/20 p-3 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full py-4 rounded-xl text-lg font-semibold shadow-lg shadow-primary/20"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Signing in...</span>
              </div>
            ) : "Sign In"}
          </Button>

          {role === 'student' && (
            <p className="text-center text-sm text-primary/60 mt-4">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-bold hover:underline">
                Sign up here
              </Link>
            </p>
          )}
        </form>
      </GlassCard>
    </div>
  );
}
