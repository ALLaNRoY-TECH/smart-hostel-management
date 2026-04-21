import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, User } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { useAppContext } from '../context/AppContext';

export function Login({ role }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAppContext();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const success = await login(email, password, role);
    if (success) {
      navigate(`/${role}`);
    } else {
      setError('Invalid credentials or server not running.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-primary/10 rounded-full mix-blend-multiply filter blur-[100px] animate-blob" />
        <div className="absolute top-[20%] right-[-10%] w-[35vw] h-[35vw] bg-accent/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000" />
      </div>

      <GlassCard className="w-full max-w-md p-8 relative z-10 shadow-2xl border-primary/20">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-accent rounded-full p-1 mb-4">
            <div className="w-full h-full bg-background rounded-full flex items-center justify-center">
              {role === 'admin' ? <Shield className="w-8 h-8 text-primary" /> : <User className="w-8 h-8 text-primary" />}
            </div>
          </div>
          <h2 className="text-2xl font-bold text-text mb-2 capitalize">{role} Login</h2>
          <p className="text-primary-light">Welcome back! Please enter your details.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="p-3 rounded-lg bg-red-100 text-red-600 text-sm font-medium border border-red-200">{error}</div>}
          
          <div>
            <label className="block text-sm font-medium text-text mb-2">Email</label>
            <input 
              type="email" required
              value={email} onChange={e => setEmail(e.target.value)}
              className="w-full bg-white/50 border border-primary/20 rounded-xl px-4 py-3 text-text focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
              placeholder={`Enter ${role} email`}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text mb-2">Password</label>
            <input 
              type="password" required
              value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-white/50 border border-primary/20 rounded-xl px-4 py-3 text-text focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
              placeholder="Enter password"
            />
          </div>

          <Button type="submit" variant="primary" className="w-full py-3 rounded-xl" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </Button>

          <div className="text-center text-sm text-primary-light mt-4">
            Test Credentials:<br/>
            Student: student@test.com / password<br/>
            Admin: admin@test.com / password
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
