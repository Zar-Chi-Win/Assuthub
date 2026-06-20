import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider 
} from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { motion } from 'motion/react';
import { Package, Mail, Lock, LogIn, Chrome, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useToast } from '../ui/Toast';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
      toast('Welcome back!', 'success');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
      toast('Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/');
      toast('Successfully signed in with Google', 'success');
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Google sign-in failed');
        toast('Google login failed', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F8FB] flex items-center justify-center p-4">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/[0.03] rounded-full blur-[140px]" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[40%] h-[40%] bg-indigo-600/[0.03] rounded-full blur-[120px]" />
        <div className="absolute top-[20%] left-[-10%] w-[30%] h-[30%] bg-emerald-600/[0.02] rounded-full blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-[420px] relative z-10"
      >
        <div className="bg-white rounded-[32px] shadow-2xl shadow-blue-900/10 border border-[#E2E8F0] overflow-hidden">
          <div className="p-8 pb-10">
            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center mb-4 shadow-xl shadow-blue-200">
                <Package className="text-white w-8 h-8" />
              </div>
              <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">AssetHub</h1>
              <p className="text-sm font-medium text-[#64748B] mt-1">Specialist Asset Management</p>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <p className="text-xs font-bold text-rose-700 leading-relaxed">{error}</p>
              </motion.div>
            )}

            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.15em] ml-1">Email Terminal</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] group-focus-within:text-blue-500 transition-colors" />
                  <input 
                    required
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@assethub.com"
                    className="w-full pl-12 pr-4 py-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl outline-none text-sm font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.15em] ml-1">Secure Key</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] group-focus-within:text-blue-500 transition-colors" />
                  <input 
                    required
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl outline-none text-sm font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#0F172A] text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-[#1E293B] transition-all shadow-xl active:scale-[0.98] disabled:opacity-70"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Initialize Session
                  </>
                )}
              </button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E2E8F0]" />
              </div>
              <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-[0.15em]">
                <span className="bg-white px-4 text-[#94A3B8]">Relay Authentication</span>
              </div>
            </div>

            <button 
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-4 bg-white border-2 border-[#E2E8F0] text-[#0F172A] rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-[#F8FAFC] hover:border-[#CBD5E1] transition-all active:scale-[0.98] disabled:opacity-70"
            >
              <Chrome className="w-5 h-5" />
              Sync with Google
            </button>
          </div>
          
          <div className="px-8 py-5 bg-[#F8FAFC] border-t border-[#E2E8F0] flex justify-between items-center whitespace-nowrap">
            <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">Node Instance: 40.2.1</p>
            <div className="flex gap-4">
              <button className="text-[10px] font-bold text-[#64748B] hover:text-[#0F172A] uppercase tracking-wider">Help</button>
              <button className="text-[10px] font-bold text-[#64748B] hover:text-[#0F172A] uppercase tracking-wider">Privacy</button>
            </div>
          </div>
        </div>
        
        <p className="text-center text-[11px] font-medium text-[#94A3B8] mt-8 leading-relaxed">
          Proprietary System. All access is logged and monitored.<br />
          &copy; 2026 AssetHub Technologies.
        </p>
      </motion.div>
    </div>
  );
}
