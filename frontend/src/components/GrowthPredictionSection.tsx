import { useState, useEffect } from 'react';
import { User } from '../App';
import { Sparkles, TrendingUp, Activity, BarChart3, ArrowUpRight } from 'lucide-react';

type PredictionResponse = {
    growth_rate: number;
    growth_class: string;
    valuation_projection: {
        "3_months": number;
        "6_months": number;
        "1_year": number;
        "5_years": number;
    };
    acquisition_probability: number;
};

export const GrowthPredictionSection = ({ user }: { user: User }) => {
    const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Only fetch for founders with company info
        if ((user.role !== 'founder' && !user.company)) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const payload = {
                    company: user.company || user.name,
                    domain: user.primaryDomain || user.website || 'unknown.com',
                    // Heuristics for demo if missing
                    funding_amount: user.valuation ? user.valuation / 4 : 2500000,
                    valuation: user.valuation || 10000000,
                    funding_year: user.fundingYear || 2023,
                    competitors: user.competitors || ['Generic Comp A', 'Generic Comp B'],
                    umbrella_companies: user.umbrella || []
                };

                const predictionUrl = import.meta.env.VITE_PREDICTION_URL || 'http://localhost:8002';
                const res = await fetch(`${predictionUrl}/predict`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (res.ok) {
                    const data = await res.json();
                    setPrediction(data);
                }
            } catch (e) {
                console.error("Prediction failed", e);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    if (!prediction && !loading) return null;

    if (loading) return (
        <div className="mt-6 p-6 rounded-2xl bg-white border border-slate-100 shadow-sm animate-pulse">
            <div className="h-6 w-48 bg-slate-200 rounded mb-4"></div>
            <div className="grid grid-cols-4 gap-4">
                <div className="h-24 bg-slate-100 rounded-xl"></div>
                <div className="h-24 bg-slate-100 rounded-xl"></div>
                <div className="h-24 bg-slate-100 rounded-xl"></div>
                <div className="h-24 bg-slate-100 rounded-xl"></div>
            </div>
        </div>
    );

    const formatCurrency = (val: number) => {
        if (val >= 1000000000) return `$${(val / 1000000000).toFixed(1)}B`;
        if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
        return `$${val.toLocaleString()}`;
    };

    return (
        <div className="mt-8 bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl border border-slate-800 animate-in fade-in slide-in-from-bottom-4">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -ml-20 -mb-20"></div>

            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start justify-between">

                {/* Left: Headline Metrics */}
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
                            <Sparkles className="w-5 h-5 text-indigo-400" />
                        </div>
                        <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                            AI Growth Prediction
                        </h3>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500 text-white">BETA</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                            <div className="flex items-center gap-2 mb-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                                <TrendingUp className="w-4 h-4" /> Growth Rate
                            </div>
                            <div className="text-3xl font-extrabold text-emerald-400">
                                {(prediction!.growth_rate * 100).toFixed(1)}%
                            </div>
                            <div className="text-xs text-white/60 mt-1">Projected Annual</div>
                        </div>

                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                            <div className="flex items-center gap-2 mb-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                                <Activity className="w-4 h-4" /> Class
                            </div>
                            <div className={`text-3xl font-extrabold ${prediction!.growth_class === 'High' ? 'text-indigo-400' : 'text-amber-400'}`}>
                                {prediction!.growth_class}
                            </div>
                            <div className="text-xs text-white/60 mt-1">Velocity Tier</div>
                        </div>
                    </div>

                    <div className="mt-4 p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                            <ArrowUpRight className="w-4 h-4" /> Acquisition Prob.
                        </div>
                        <div className="text-2xl font-bold text-white">
                            {(prediction!.acquisition_probability * 100).toFixed(0)}%
                        </div>
                    </div>
                </div>

                {/* Right: Valuation Projection */}
                <div className="flex-1 w-full bg-black/20 rounded-2xl p-6 border border-white/5">
                    <div className="flex items-center gap-2 mb-6 text-slate-400 text-xs font-bold uppercase tracking-wider">
                        <BarChart3 className="w-4 h-4" /> Valuation Forecast
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center group">
                            <span className="text-sm text-slate-400 group-hover:text-white transition-colors">3 Months</span>
                            <div className="flex-1 mx-4 h-px bg-white/10 group-hover:bg-white/30 transition-colors"></div>
                            <span className="font-mono font-bold text-emerald-400">{formatCurrency(prediction!.valuation_projection["3_months"])}</span>
                        </div>
                        <div className="flex justify-between items-center group">
                            <span className="text-sm text-slate-400 group-hover:text-white transition-colors">6 Months</span>
                            <div className="flex-1 mx-4 h-px bg-white/10 group-hover:bg-white/30 transition-colors"></div>
                            <span className="font-mono font-bold text-emerald-400">{formatCurrency(prediction!.valuation_projection["6_months"])}</span>
                        </div>
                        <div className="flex justify-between items-center group">
                            <span className="text-sm text-slate-400 group-hover:text-white transition-colors">1 Year</span>
                            <div className="flex-1 mx-4 h-px bg-white/10 group-hover:bg-white/30 transition-colors"></div>
                            <span className="font-mono font-bold text-emerald-400">{formatCurrency(prediction!.valuation_projection["1_year"])}</span>
                        </div>
                        <div className="flex justify-between items-center group">
                            <span className="text-sm text-slate-400 group-hover:text-white transition-colors">5 Years</span>
                            <div className="flex-1 mx-4 h-px bg-white/10 group-hover:bg-white/30 transition-colors"></div>
                            <span className="font-mono font-bold text-indigo-400">{formatCurrency(prediction!.valuation_projection["5_years"])}</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
