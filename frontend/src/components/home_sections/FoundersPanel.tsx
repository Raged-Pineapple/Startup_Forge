import React from 'react';
import { Users, TrendingUp, ShieldCheck } from 'lucide-react';

interface FoundersPanelProps {
    topFounders: any[];
    onNavigate: (page: string, userId?: string) => void;
}

export const FoundersPanel = ({ topFounders, onNavigate }: FoundersPanelProps) => {
    return (
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-0">
            <div className="px-5 py-3 border-b border-gray-100 flex justify-between items-center bg-white flex-shrink-0">
                <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-700" />
                    <h3 className="text-xl font-black tracking-tight text-slate-800">
                        <b>Top Rising Founders</b>
                    </h3>
                </div>
                <button className="text-[10px] font-semibold text-slate-500 hover:text-slate-800 hover:underline">View | </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 h-full bg-gray-50/20 grid grid-cols-1 sm:grid-cols-2 gap-3 content-start">
                {topFounders.map((founder, i) => (
                    <div key={i} onClick={() => onNavigate('profile', founder.id)} className="flex flex-col sm:flex-row gap-4 p-4 bg-white hover:bg-slate-50 rounded-2xl border border-gray-100 hover:border-slate-200 shadow-sm hover:shadow-soft transition-all cursor-pointer group">
                        {/* Avatar & Basic Info */}
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                            <img src={`https://i.pravatar.cc/150?u=${i + 50}`} className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-sm" />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-bold text-gray-900 text-base truncate pr-2">{founder.name}</h4>
                                    <span className="shrink-0 text-[10px] font-bold text-white bg-green-500 px-2 py-0.5 rounded-full shadow-sm">
                                        ${(founder.valuation / 1000000).toFixed(0)}M
                                    </span>
                                </div>
                                <p className="text-sm font-semibold text-teal-700">{founder.company}</p>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-gray-500">
                                    <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-md">
                                        <TrendingUp className="w-3 h-3 text-gray-400" />
                                        {founder.round} • {founder.year}
                                    </span>
                                    {founder.umbrella && (
                                        <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-md truncate max-w-[150px]">
                                            <ShieldCheck className="w-3 h-3 text-gray-400" />
                                            {founder.umbrella}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
