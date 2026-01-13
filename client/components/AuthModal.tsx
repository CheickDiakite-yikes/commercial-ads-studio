import React, { useState } from 'react';
import { X, Mail, Lock, Building, Briefcase, Globe, ArrowRight, Loader2 } from 'lucide-react';
import * as ApiService from '../services/api';

interface AuthModalProps {
    mode: 'login' | 'signup';
    onClose: () => void;
    onSuccess: (user: any, token: string) => void;
    switchToLogin: () => void;
    switchToSignup: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ mode, onClose, onSuccess, switchToLogin, switchToSignup }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [company, setCompany] = useState('');
    const [role, setRole] = useState('');
    const [source, setSource] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (mode === 'signup') {
                if (password !== passwordConfirm) {
                    throw new Error("Passwords don't match");
                }
                const { token, user } = await ApiService.register({ email, password, company, role, source });
                onSuccess(user, token);
            } else {
                const { token, user } = await ApiService.login(email, password);
                onSuccess(user, token);
            }
        } catch (err: any) {
            setError(err.message || 'Authentication failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl relative overflow-hidden">
                <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors">
                    <X size={20} />
                </button>

                <div className="p-8">
                    <div className="mb-8 text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 shadow-[0_0_20px_rgba(236,72,153,0.5)] mb-4">
                            <span className="font-display font-bold text-white text-xl">A</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
                        <p className="text-white/40 text-sm">
                            {mode === 'login' ? 'Enter your credentials to access the studio.' : 'Join hundreds of creators building the future of ads.'}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-4">
                            <div className="relative">
                                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            {mode === 'signup' && (
                                <>
                                    <div className="relative">
                                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                                        <input
                                            type="password"
                                            placeholder="Confirm Password"
                                            className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all"
                                            value={passwordConfirm}
                                            onChange={e => setPasswordConfirm(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="relative">
                                        <Building size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                                        <input
                                            type="text"
                                            placeholder="Company (Optional)"
                                            className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all"
                                            value={company}
                                            onChange={e => setCompany(e.target.value)}
                                        />
                                    </div>
                                    <div className="relative">
                                        <Briefcase size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                                        <input
                                            type="text"
                                            placeholder="Role (e.g. Creative Director)"
                                            className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all"
                                            value={role}
                                            onChange={e => setRole(e.target.value)}
                                        />
                                    </div>
                                    <div className="relative">
                                        <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                                        <select
                                            className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white/70 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all appearance-none"
                                            value={source}
                                            onChange={e => setSource(e.target.value)}
                                        >
                                            <option value="" disabled>How did you find us?</option>
                                            <option value="linkedin">LinkedIn</option>
                                            <option value="twitter">Twitter / X</option>
                                            <option value="google">Google Search</option>
                                            <option value="referral">Friend / Colleague</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full mt-6 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-3 rounded-lg hover:shadow-[0_0_20px_rgba(236,72,153,0.4)] transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? <Loader2 size={18} className="animate-spin" /> : (mode === 'login' ? 'Sign In' : 'Create Account')}
                            {!isLoading && <ArrowRight size={18} />}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-white/40 text-sm">
                            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                            <button
                                onClick={mode === 'login' ? switchToSignup : switchToLogin}
                                className="text-pink-400 hover:text-pink-300 font-medium transition-colors"
                            >
                                {mode === 'login' ? 'Sign up' : 'Log in'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
