import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function AuthPage({ setToken, setUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const { data } = await axios.post(endpoint, formData);
      
      localStorage.setItem('rentbridge_token', data.token);
      localStorage.setItem('rentbridge_user', JSON.stringify(data.user));
      
      setToken(data.token);
      setUser(data.user);
      
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm card-high-density p-8 md:p-10"
      >
        <div className="text-center mb-10">
          <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl">RB</div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">
            {isLogin ? 'Network Login' : 'Register Node'}
          </h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            {isLogin ? 'Authorized Personnel Only' : 'NBFC Compliance Verification'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded text-[10px] font-bold uppercase tracking-widest">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="stat-label">Full Legal Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="stat-label">Work Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="email"
                placeholder="name@company.com"
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="stat-label">Secure Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 bg-slate-900 text-white rounded font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50 active:scale-[0.98] shadow-sm"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : (isLogin ? 'Identify & Access' : 'Initialize Account')}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-100 text-center">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            {isLogin ? "New to the network?" : "Previously registered?"}{' '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 hover:text-blue-700 underline underline-offset-4"
            >
              {isLogin ? 'Register Node' : 'Access Node'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
