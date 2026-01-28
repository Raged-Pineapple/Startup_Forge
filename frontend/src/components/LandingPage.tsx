import React, { useState } from 'react';
import {
    ArrowRight,
    CheckCircle2,
    Layout,
    Target,
    Zap,
    ShieldCheck,
    Check
} from 'lucide-react';

interface LandingPageProps {
    onLogin: (id: string, role: string, name: string) => void;
}

export const LandingPage = ({ onLogin }: LandingPageProps) => {
    const [name, setName] = useState('');
    const [role, setRole] = useState('investor');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!name) {
            setError("Please enter your name");
            return;
        }
        setLoading(true);
        setError('');

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000';
            const res = await fetch(`${apiUrl}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, role })
            });

            const data = await res.json();

            if (res.ok && data.success && data.userId != null) {
                onLogin(data.userId.toString(), role, data.name);
            } else {
                setError(data.error || "Login failed. Please check your spelling.");
            }
        } catch (err) {
            console.error("Login Check Failed", err);
            setError("Server connection failed. Ensure Backend is running.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900" style={{ fontFamily: "'Inter', sans-serif" }}>

            {/* --- Navbar --- */}
            <nav className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center relative z-20">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                        <Zap className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">StartupForge</span>
                </div>

                <div className="flex items-center gap-4">
                    <button className="text-sm font-bold text-slate-900 hover:opacity-70">Log In</button>
                    <button className="px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-full hover:shadow-lg hover:-translate-y-0.5 transition-all">
                        Get Started
                    </button>
                </div>
            </nav>

            {/* --- Hero Section --- */}
            <header className="max-w-7xl mx-auto px-6 pt-12 pb-32 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">

                {/* Left: Copy */}
                <div className="max-w-xl">
                    <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15] mb-8">
                        Get funded early,<br />
                        scale automatically<br />
                        <span className="text-indigo-600">all your deals.</span>
                    </h1>
                    <p className="text-lg text-slate-500 mb-10 leading-relaxed">
                        Connect with world-class investors, perform instant due diligence, and secure your next round with the most advanced matching engine in the industry.
                    </p>

                    <div className="flex items-center gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* Fake Logos for Social Proof */}
                        <span className="font-bold text-xl">Klarna.</span>
                        <span className="font-bold text-xl">coinbase</span>
                        <span className="font-bold text-xl">instacart</span>
                    </div>
                </div>

                {/* Right: Interactive Login Card (Floating Visual) */}
                <div className="relative w-full">
                    {/* Background Blob */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-indigo-100 rounded-full blur-[80px] -z-10 opacity-60"></div>

                    {/* Main Floating Card (Login) */}
                    <div className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-100 relative backdrop-blur-sm">

                        {/* Decoration: Credit Card style float */}
                        <div className="absolute -right-8 -top-8 bg-slate-900 text-white p-6 rounded-3xl shadow-2xl w-48 hidden md:block animate-in slide-in-from-bottom-4 duration-1000">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md">
                                    <Target className="w-4 h-4 text-white" />
                                </div>
                                <div className="text-xs font-mono opacity-50">**** 4242</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-xs opacity-70">Match Confidence</div>
                                <div className="text-2xl font-bold tracking-tight">98.4%</div>
                            </div>
                        </div>

                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
                            <p className="text-slate-500 mt-1">Access your deal flow dashboard.</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Full Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:bg-white transition-all shadow-sm"
                                    placeholder="e.g. Mark Suster"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setRole('investor')}
                                    className={`py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 border-2 transition-all font-bold text-sm ${role === 'investor'
                                        ? 'border-slate-900 bg-slate-900 text-white shadow-lg'
                                        : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'
                                        }`}
                                >
                                    Investor
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole('founder')}
                                    className={`py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 border-2 transition-all font-bold text-sm ${role === 'founder'
                                        ? 'border-slate-900 bg-slate-900 text-white shadow-lg'
                                        : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'
                                        }`}
                                >
                                    Founder
                                </button>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4" /> {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? 'Authenticating...' : 'Enter Dashboard'}
                                {!loading && <ArrowRight className="w-5 h-5" />}
                            </button>
                        </form>

                        <div className="mt-6 text-center text-xs text-slate-400">
                            Try: <span className="text-indigo-600 font-bold cursor-pointer hover:underline" onClick={() => { setName('Mark Suster'); setRole('investor'); }}>Mark Suster</span> or <span className="text-emerald-600 font-bold cursor-pointer hover:underline" onClick={() => { setName('1upHealth'); setRole('founder'); }}>1upHealth</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* --- Features Section --- */}
            <section className="bg-white py-24 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="mb-20 max-w-2xl">
                        <span className="text-indigo-600 font-bold tracking-wider text-sm uppercase">Future Proof</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mt-3 mb-6">Experience that grows<br /> with your scale.</h2>
                        <p className="text-lg text-slate-500">Design a friendship-based ecosystem that works for your business and streamlines cash flow management.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <Feature
                            icon={<Zap className="w-6 h-6 text-indigo-600" />}
                            title="Instant Transfers"
                            desc="Create efficient experiences and optimize rapid productivity scheduling requirements."
                        />
                        <Feature
                            icon={<Layout className="w-6 h-6 text-indigo-600" />}
                            title="Multiple Accounts"
                            desc="Run your operations with cash from new revenue and premier yielded validations in your account."
                        />
                        <Feature
                            icon={<ShieldCheck className="w-6 h-6 text-indigo-600" />}
                            title="Unmatched Security"
                            desc="Securely manage new finances with organization-wide MFA, user locking, and account level controls."
                        />
                    </div>
                </div>
            </section>

            {/* --- Dark CTA Section --- */}
            <section className="py-24 px-6">
                <div className="max-w-7xl mx-auto bg-slate-900 rounded-[3rem] p-12 md:p-20 relative overflow-hidden text-white">
                    {/* Abstract decorative circles */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>

                    <div className="relative z-10 max-w-2xl">
                        <span className="text-indigo-400 font-bold tracking-wider text-sm uppercase mb-4 block">Ready to start?</span>
                        <h2 className="text-4xl md:text-5xl font-bold mb-8">
                            Maximize your returns with a Forge account that generates.
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-12 border-t border-white/10 pt-8">
                            <div>
                                <div className="text-3xl font-bold text-indigo-400 mb-1">24%</div>
                                <div className="text-sm text-slate-400">Revenue Business</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-indigo-400 mb-1">180K</div>
                                <div className="text-sm text-slate-400">In annual revenue</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-indigo-400 mb-1">10+</div>
                                <div className="text-sm text-slate-400">Months of runway</div>
                            </div>
                        </div>

                        <button
                            onClick={() => document.documentElement.scrollTop = 0}
                            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all flex items-center gap-3 group"
                        >
                            Get Started Now
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </section>

            {/* --- Footer --- */}
            <footer className="bg-slate-50 py-16 border-t border-slate-200">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start gap-12">
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-6 h-6 bg-slate-900 rounded flex items-center justify-center">
                                <Zap className="w-3 h-3 text-white" />
                            </div>
                            <span className="text-lg font-bold text-slate-900">StartupForge</span>
                        </div>
                        <p className="text-slate-500 text-sm max-w-xs">
                            © {new Date().getFullYear()} Startup Forge Inc.<br />
                            All rights reserved.
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-16">
                        <div>
                            <h4 className="font-bold text-slate-900 mb-4">Solutions</h4>
                            <ul className="space-y-3 text-sm text-slate-500">
                                <li><a href="#" className="hover:text-slate-900">Small Business</a></li>
                                <li><a href="#" className="hover:text-slate-900">Freelancers</a></li>
                                <li><a href="#" className="hover:text-slate-900">Customers</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 mb-4">Company</h4>
                            <ul className="space-y-3 text-sm text-slate-500">
                                <li><a href="#" className="hover:text-slate-900">About Us</a></li>
                                <li><a href="#" className="hover:text-slate-900">Career</a></li>
                                <li><a href="#" className="hover:text-slate-900">Contact</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 mb-4">Learn</h4>
                            <ul className="space-y-3 text-sm text-slate-500">
                                <li><a href="#" className="hover:text-slate-900">Blog</a></li>
                                <li><a href="#" className="hover:text-slate-900">Ebooks</a></li>
                                <li><a href="#" className="hover:text-slate-900">Guides</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </footer>

        </div>
    );
};

function Feature({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div>
            <div className="mb-6 w-12 h-12 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center justify-center">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
            <p className="text-slate-500 leading-relaxed text-sm">
                {desc}
            </p>
        </div>
    )
}
