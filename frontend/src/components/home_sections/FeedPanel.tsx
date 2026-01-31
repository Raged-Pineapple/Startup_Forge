import React from 'react';
import { UseProps } from 'react-markdown/lib/ast-to-react';
import { Users, TrendingUp, ShieldCheck, Newspaper } from 'lucide-react';

// Using 'any' for simplicity matching HomePage types, but ideally use interfaces
interface FeedPanelProps {
    topFounders: any[];
    onNavigate: (page: string, userId?: string) => void;
}

export const FeedPanel = ({ topFounders, onNavigate }: FeedPanelProps) => {
    return (
        <div style={{ flex: 54 }} className="flex flex-col gap-6 flex-shrink-0 min-w-0 h-full">
            {/* Top: Founders */}
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-0">
                <div className="px-5 py-3 border-b border-gray-100 flex justify-between items-center bg-white flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-700" />
                        <h3 className="text-xl font-black tracking-tight text-slate-800">
                            <b>  Top Rising Founders</b>
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

            {/* Bottom: News */}
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-0">
                <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <Newspaper className="w-5 h-5 text-slate-700" />
                        <h3 className="font-bold text-slate-900 text-lg"><b> Market Intelligence</b></h3>
                    </div>
                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-teal-50 text-[10px] font-bold text-teal-600 animate-pulse border border-teal-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                        LIVE
                    </span>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {[
                            {
                                source: "TechCrunch",
                                title: "Meta acquires AI agent platform Manus for $2B",
                                time: "2h",
                                image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=200&h=200",
                                link: "#"
                            },
                            {
                                source: "VentureBeat",
                                title: "Liquid AI receives $250M Series A boost",
                                time: "4h",
                                image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=200&h=200",
                                link: "#"
                            },
                            {
                                source: "The Verge",
                                title: "Global AI startup funding hits record $150B",
                                time: "8h",
                                image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=200&h=200",
                                link: "#"
                            },
                            {
                                source: "Reuters",
                                title: "Nvidia hits $4T market cap amid chip demand",
                                time: "10h",
                                image: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&q=80&w=200&h=200",
                                link: "#"
                            },
                            {
                                source: "Sifted",
                                title: "Mistral releases new large open model 'Large 2'",
                                time: "11h",
                                image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&q=80&w=200&h=200",
                                link: "#"
                            },
                            {
                                source: "Wired",
                                title: "Humane's AI Pin: The full hardware review",
                                time: "12h",
                                image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=200&h=200",
                                link: "#"
                            },
                            {
                                source: "The Information",
                                title: "Perplexity to raise new round at $3B val",
                                time: "14h",
                                image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=200&h=200",
                                link: "#"
                            },
                            {
                                source: "Forbes",
                                title: "Stability AI CEO steps down amid restructuring",
                                time: "1d",
                                image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=200&h=200",
                                link: "#"
                            },
                            {
                                source: "Bloomberg",
                                title: "Apple said to integrating Gemini into iPhone 16",
                                time: "1d",
                                image: "https://images.unsplash.com/photo-1592609931095-54a2168ae893?auto=format&fit=crop&q=80&w=200&h=200",
                                link: "#"
                            }
                        ].map((news, i) => (
                            <div key={i}>
                                <a href={news.link} className="group flex flex-col gap-2 p-2 bg-white hover:bg-slate-50 border border-gray-100 hover:border-indigo-100 rounded-lg transition-all hover:shadow-sm cursor-pointer h-full">
                                    <div className="flex items-start gap-2">
                                        <div className="w-10 h-10 relative overflow-hidden flex-shrink-0 rounded-md">
                                            <img
                                                src={news.image}
                                                alt="thumb"
                                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <h4 className="text-[10px] font-bold text-gray-800 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">
                                                {news.title}
                                            </h4>
                                            <div className="flex items-center gap-1 mt-1">
                                                <span className="text-[8px] font-bold text-indigo-600 uppercase tracking-wide leading-none">{news.source}</span>
                                                <span className="text-[8px] text-gray-400">• {news.time}</span>
                                            </div>
                                        </div>
                                    </div>
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
