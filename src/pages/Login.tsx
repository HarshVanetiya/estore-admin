import { useState } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import { Mail, KeyRound, ArrowRight, Lock, Sparkles } from 'lucide-react';

export default function Login() {
    const navigate = useNavigate();

    const [step, setStep] = useState<'email' | 'verify'>('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorModal, setErrorModal] = useState({ open: false, title: '', message: '' });

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.signInWithOtp({
            email: email,
            options: { shouldCreateUser: false }
        });
        if (error) { setErrorModal({ open: true, title: 'Authentication Error', message: error.message }); setLoading(false); }
        else { setStep('verify'); setLoading(false); }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.verifyOtp({
            email, token: otp, type: 'email',
        });
        if (error) { setErrorModal({ open: true, title: 'Invalid Code', message: error.message }); setLoading(false); }
        else { navigate('/'); }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-ink-black via-dark-teal to-air-force-blue relative overflow-hidden font-sans">

            <div className="absolute top-0 left-0 w-96 h-96 bg-air-force-blue rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-ash-grey rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-pulse delay-1000"></div>

            <div className="glass-card shimmer-effect relative overflow-hidden p-10 rounded-3xl w-full max-w-md text-center transition-all duration-500 hover:scale-[1.01] hover:shadow-2xl hover:shadow-ink-black/50">

                <div className="relative inline-block mb-8">
                    <div className="absolute inset-0 bg-ash-grey blur-lg rounded-full opacity-30 animate-pulse"></div>
                    <div className="relative bg-gradient-to-tr from-dark-teal to-ink-black text-beige w-20 h-20 rounded-2xl rotate-3 flex items-center justify-center shadow-lg border border-white/10 group hover:rotate-6 transition-transform duration-500">
                        {step === 'email' ? <Lock size={28} /> : <Sparkles size={28} className="animate-spin-slow" />}
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-beige mb-2 tracking-tight">
                    Admin Panel
                </h1>
                <p className="text-ash-grey/80 mb-10 text-sm font-medium tracking-wide">
                    {step === 'email' ? 'Please identify yourself' : `Code sent to ${email}`}
                </p>

                {step === 'email' && (
                    <form onSubmit={handleSendOtp} className="space-y-6 relative z-10">
                        <div className="group text-left">
                            <label className="block text-xs font-bold text-ash-grey mb-2 ml-1 uppercase tracking-widest opacity-70 group-focus-within:opacity-100 transition">Email</label>
                            <div className="relative transition-all duration-300 group-focus-within:-translate-y-1">
                                <Mail className="absolute left-4 top-4 text-ash-grey group-focus-within:text-beige transition-colors" size={20} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 p-4 bg-ink-black/40 border border-ash-grey/20 rounded-xl text-beige placeholder-ash-grey/30 focus:outline-none focus:border-ash-grey/50 focus:bg-ink-black/60 transition-all backdrop-blur-md shadow-inner"
                                    placeholder="admin@store.com"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-beige text-dark-teal rounded-xl font-bold shadow-lg hover:bg-white hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader size="sm" /> : <>Send Code <ArrowRight size={20} /></>}
                        </button>
                    </form>
                )}

                {step === 'verify' && (
                    <form onSubmit={handleVerifyOtp} className="space-y-6 relative z-10">
                        <div className="group text-left">
                            <label className="block text-xs font-bold text-ash-grey mb-2 ml-1 uppercase tracking-widest">Secure Token</label>
                            <div className="relative transition-all duration-300 group-focus-within:-translate-y-1">
                                <KeyRound className="absolute left-4 top-4 text-ash-grey group-focus-within:text-beige transition-colors" size={20} />
                                <input
                                    type="text"
                                    required
                                    autoFocus
                                    maxLength={8}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="w-full pl-12 p-4 bg-ink-black/40 border border-ash-grey/20 rounded-xl text-beige placeholder-ash-grey/30 focus:outline-none focus:border-ash-grey/50 focus:bg-ink-black/60 transition-all backdrop-blur-md tracking-[0.5em] font-mono text-xl text-center shadow-inner"
                                    placeholder="00000000"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-beige text-dark-teal rounded-xl font-bold shadow-lg hover:bg-white hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader size="sm" /> : 'Enter Dashboard'}
                        </button>

                        <button
                            type="button"
                            onClick={() => setStep('email')}
                            className="text-ash-grey/60 hover:text-beige underline text-sm transition-colors mt-4 block"
                        >
                            Wrong email address?
                        </button>
                    </form>
                )}

            </div>

            <div className="absolute bottom-6 text-ash-grey/30 text-xs tracking-widest uppercase">
                Protected System • Authorized Access Only
            </div>
            <Modal
                isOpen={errorModal.open}
                onClose={() => setErrorModal({ ...errorModal, open: false })}
                title={errorModal.title}
                message={errorModal.message}
            />
        </div>
    );
}