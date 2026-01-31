import React, { useState } from 'react';
import { User } from '../../App';
import { ShieldCheck, Users, PieChart, ArrowUpRight } from 'lucide-react';

interface StatsPanelProps {
    currentUser: User;
    coiCompanyName: string;
    setCoiCompanyName: (val: string) => void;
    coiDomain: string;
    setCoiDomain: (val: string) => void;
    coiSuggestions: any[];
    showCoiSuggestions: boolean;
    setShowCoiSuggestions: (val: boolean) => void;
    onCheckConflict?: (investor: string, company: string) => void;
    // Find Investors
    isFindingInvestors: boolean;
    handleFindInvestors: () => void;
    // Invested Companies
    investedCompanies: any[];
    hoveredCompanyId: string | null;
    setHoveredCompanyId: (val: string | null) => void;
}

export const StatsPanel = ({
    currentUser,
    coiCompanyName,
    setCoiCompanyName,
    coiDomain,
    setCoiDomain,
    coiSuggestions,
    showCoiSuggestions,
    setShowCoiSuggestions,
    onCheckConflict,
    isFindingInvestors,
    handleFindInvestors,
    investedCompanies,
    hoveredCompanyId,
    setHoveredCompanyId
}: StatsPanelProps) => {

    return (
        <div className="flex flex-col gap-4 lg:gap-6 flex-shrink-0 min-w-0 w-full h-auto lg:h-full lg:overflow-y-auto custom-scrollbar lg:pr-1 lg:flex-[20]">
            {/* Conflict (Flex 3 -> ~30%) to fit inputs */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex-shrink-0 flex flex-col relative z-40">
                <div className="flex items-center gap-2 mb-3">
                    <ShieldCheck className="w-4 h-4 text-green-600" />
                    <h3 className="font-bold text-gray-800 text-base"><b>Conflict of Interest</b></h3>
                </div>

                <div className="flex flex-col gap-3 flex-1 justify-center pt-2">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Company Name"
                            value={coiCompanyName}
                            onChange={(e) => {
                                setCoiCompanyName(e.target.value);
                                setShowCoiSuggestions(true);
                            }}
                            onFocus={() => setShowCoiSuggestions(true)}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-1 focus:ring-slate-400 outline-none transition-all placeholder:text-gray-400"
                        />
                        {showCoiSuggestions && coiSuggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-100 rounded-xl shadow-lg z-[60] overflow-hidden">
                                {coiSuggestions.map((s, idx) => (
                                    <div
                                        key={idx}
                                        className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-sm text-slate-700 truncate"
                                        onClick={() => {
                                            setCoiCompanyName(s.name.replace('...', '')); // Remove truncation dots if any
                                            setCoiDomain(s.domain || "tech.com");
                                            setShowCoiSuggestions(false);
                                        }}
                                    >
                                        {s.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <input
                        type="text"
                        placeholder="Domain (e.g. tech.com)"
                        value={coiDomain}
                        onChange={(e) => setCoiDomain(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-1 focus:ring-slate-400 outline-none transition-all placeholder:text-gray-400"
                    />
                    <button
                        onClick={() => onCheckConflict?.(currentUser.name, coiCompanyName)}
                        className="w-full mt-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold py-3 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
                    >
                        Check Conflict <ShieldCheck className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Find Investors (Flex 3.5 -> ~35%) */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 lg:p-6 flex flex-col relative overflow-hidden group z-10 flex-shrink-0">
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-100 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-slate-200 transition-colors"></div>

                <div className="relative flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-4">
                        <Users className="w-5 h-5 text-slate-800" />
                        <h3 className="font-bold text-gray-900 text-lg"><b>Find Investors Like Me</b></h3>
                    </div>

                    <div className="flex-1 flex flex-col justify-center items-center text-center">
                        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                            Match with the perfect investors for your startup's stage and industry.
                        </p>

                        <button
                            onClick={handleFindInvestors}
                            disabled={isFindingInvestors}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group-hover:scale-[1.02] disabled:opacity-70 disabled:cursor-wait"
                        >
                            {isFindingInvestors ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    Finding...
                                </>
                            ) : (
                                <>
                                    Find Investors <ArrowUpRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Invested Companies (Flex 3.5 -> ~35%) */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 flex flex-col relative z-50 flex-shrink-0">
                <div className="flex items-center gap-2 mb-3">
                    <PieChart className="w-4 h-4 text-slate-800" />
                    <h3 className="font-bold text-gray-800 text-base"><b>My Invested Company Stats</b></h3>
                </div>

                <div className="flex flex-col h-full justify-center gap-4 px-1">
                    {(() => {
                        const defaultInvestments = [
                            { id: 'd1', company: "Nebula AI", round: "Series A", amount: "$5M", year: "2024", img: 88, stock: '45.0M', growth: 120 },
                            { id: 'd2', company: "Zephyr", round: "Seed", amount: "$2M", year: "2023", img: 52, stock: '12.0M', growth: 85 },
                            { id: 'd3', company: "Flux Sys", round: "Seed", amount: "$1.2M", year: "2023", img: 33, stock: '15.5M', growth: 90 },
                            { id: 'd4', company: "Apex Bio", round: "Series B", amount: "$15M", year: "2022", img: 11, stock: '60.0M', growth: 45 },
                            { id: 'd5', company: "Vortex", round: "Series A", amount: "$8M", year: "2022", img: 95, stock: '32.0M', growth: 60 },
                            { id: 'd6', company: "Horizon", round: "Seed", amount: "$500K", year: "2021", img: 61, stock: '8.0M', growth: 30 },
                            { id: 'd7', company: "Pulse", round: "Pre-Seed", amount: "$200K", year: "2021", img: 72, stock: '2.5M', growth: 40 },
                            { id: 'd8', company: "Echo Lab", round: "Series A", amount: "$10M", year: "2020", img: 48, stock: '50.0M', growth: 55 }
                        ];

                        // Combine API data with defaults to ensure we have a full grid if needed
                        const uiInvestments = investedCompanies.map(c => ({
                            id: c.founder_id,
                            company: c.company,
                            round: c.round,
                            amount: typeof c.amount === 'number' ? `$${(c.amount / 1000000).toFixed(1)}M` : c.amount,
                            year: c.year,
                            img: c.founder_id,
                            stock: c.valuation ? (c.valuation / 1000000).toFixed(1) + 'M' : 'N/A',
                            growth: Math.floor(Math.random() * 40) + 10 // Mock growth if not in API
                        }));

                        // Deduplicate by ID
                        const uniqueInvestments = Array.from(new Map(uiInvestments.map(item => [item.id, item])).values());

                        let displayList = [...uniqueInvestments];

                        // Fill the rest with defaults if we have space
                        if (displayList.length < 8) {
                            const remaining = defaultInvestments.slice(0, 8 - displayList.length);
                            displayList = [...displayList, ...remaining];
                        } else {
                            displayList = displayList.slice(0, 8);
                        }

                        const renderItem = (company: any, i: number) => {
                            const uniqueId = company.id || `default-${i}`;
                            const isRightSide = (i % 4) >= 2;
                            const tooltipClass = isRightSide ? "right-0 translate-x-4" : "left-0 -translate-x-4";
                            const arrowClass = isRightSide ? "right-8" : "left-8";

                            return (
                                <div
                                    key={i}
                                    className="relative group flex justify-center"
                                    onMouseEnter={() => setHoveredCompanyId(uniqueId)}
                                    onMouseLeave={() => setHoveredCompanyId(null)}
                                >
                                    {hoveredCompanyId === uniqueId && (
                                        <div
                                            className={`absolute bottom-full mb-3 w-64 text-sm rounded-xl p-4 animate-in fade-in zoom-in-95 duration-200 pointer-events-none z-[100] shadow-2xl border border-white/20 flex flex-col gap-3 ${tooltipClass}`}
                                            style={{ backgroundColor: '#0f172a', color: 'white' }}
                                        >
                                            <div className="font-bold text-base border-b border-white/20 pb-2 mb-1 tracking-wide text-white">
                                                {company.company || company.name}
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-slate-400">Round</span>
                                                    <span className="font-semibold text-white">{company.round}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-slate-400">Amount</span>
                                                    <span className="font-semibold text-white">{company.amount}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-slate-400">Year</span>
                                                    <span className="font-semibold text-white">{company.year}</span>
                                                </div>
                                                <div className="flex justify-between items-center border-t border-white/10 pt-2 mt-1">
                                                    <span className="text-slate-400">Growth Prediction</span>
                                                    <span className="font-semibold text-green-400">+{company.growth || Math.floor(Math.random() * 150) + 20}%</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-slate-400">Stock Value</span>
                                                    <span className="font-semibold text-white">${company.stock || (Math.random() * 200 + 10).toFixed(2)}</span>
                                                </div>
                                            </div>
                                            {/* Arrow */}
                                            <div
                                                className={`absolute -bottom-1.5 w-3 h-3 rotate-45 border-r border-b border-white/20 ${arrowClass}`}
                                                style={{ backgroundColor: '#0f172a' }}
                                            ></div>
                                        </div>
                                    )}

                                    <div className="relative transform transition-transform duration-300 hover:scale-110">
                                        <img
                                            src={`https://i.pravatar.cc/150?u=${company.id || company.img || i}`}
                                            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm cursor-pointer bg-white"
                                            alt={company.company}
                                        />
                                    </div>
                                </div>
                            );
                        };

                        return (
                            <div className="grid grid-cols-4 gap-y-4 gap-x-2">
                                {displayList.map((c, i) => renderItem(c, i))}
                            </div>
                        );
                    })()}
                </div>
            </div>
        </div>
    );
};
