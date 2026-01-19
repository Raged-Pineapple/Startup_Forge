import { useState, useEffect } from "react";
import { User } from '../App';
import { SearchResultsDropdown } from './SearchResultsDropdown';
// New Components
import EntitySelectionPanel from "@/components/coi/EntitySelectionPanel";
import RiskOverviewCard from "@/components/coi/RiskOverviewCard";
import RelationshipGraph from "@/components/coi/RelationshipGraph";
import ConflictExplanationPanel from "@/components/coi/ConflictExplanationPanel";
import ComplianceActions from "@/components/coi/ComplianceActions";

// UI Components
import { Users, Bell, MessageSquare, X, BrainCircuit, Sparkles, ShieldCheck, Clock, Target, CheckCircle2, Building2, Home } from 'lucide-react';
import { Toaster, toast } from "sonner";

interface ConflictReportPageProps {
    currentUser: User;
    onNavigate: (page: string, userId?: string) => void;
    onSearch: (query: string) => void;
    onQueryChange?: (query: string) => void;
    ragResults?: {
        founders: any[];
        investors: any[];
    };
    isSearching?: boolean;
    onBack: () => void;
    currentInvestorName?: string;
    targetCompanyName?: string;
}

const ConflictReportPage = ({
    currentUser,
    onNavigate,
    onSearch,
    onQueryChange,
    ragResults,
    isSearching,
    onBack,
    currentInvestorName,
    targetCompanyName
}: ConflictReportPageProps) => {
    // --- Header State (for consistency with HomePage) ---
    const [searchQuery, setSearchQuery] = useState('');
    const [showProfileModal, setShowProfileModal] = useState(false);

    // --- COI Logic State ---
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [conflictData, setConflictData] = useState<any>(null);
    const [hasResults, setHasResults] = useState(false);
    const [selectedInvestor, setSelectedInvestor] = useState(currentInvestorName || "");
    const [selectedTarget, setSelectedTarget] = useState(targetCompanyName || "");

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(searchQuery);
    };

    const handleRunCheck = async (investor: string, target: string) => {
        setIsAnalyzing(true);
        setHasResults(false);
        setSelectedInvestor(investor);
        setSelectedTarget(target);

        try {
            const res = await fetch('/api/coi/check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    investorName: investor,
                    targetCompany: target
                })
            });
            const data = await res.json();
            setConflictData(data);
            setHasResults(true);
            toast.success("Analysis Complete", { description: "Conflict detection finished successfully." });
        } catch (err) {
            console.error("COI Analysis Failed", err);
            toast.error("Analysis Failed", { description: "Could not connect to the analysis engine." });
            setConflictData(null);
        } finally {
            // Minimum loading time for UX
            setTimeout(() => setIsAnalyzing(false), 1200);
        }
    };

    // Auto-run analysis if investor is pre-selected
    useEffect(() => {
        if (currentInvestorName && targetCompanyName) {
            handleRunCheck(currentInvestorName, targetCompanyName);
        }
    }, [currentInvestorName, targetCompanyName]);

    // Helpers to extract display data
    const currentLevel = conflictData?.conflictLevel || 0;
    const hasConflict = conflictData?.hasConflict || false;

    // --- Level 1 Data (Sector Overlap) ---
    const isLevel1 = currentLevel === 1;
    const level1Companies = isLevel1 ? (conflictData.conflictingCompanies || []) : [];
    const level1Tags = isLevel1 ? level1Companies : [];

    // --- Level 2 Data (Subsidiary/Competitor) ---
    const isLevel2 = currentLevel === 2;
    const level2Details = isLevel2 ? (conflictData.conflicts || []) : [];
    const level2Tags = isLevel2 ? level2Details.map((c: any) => c.investedParent) : [];

    // --- Calculate Score ---
    const riskScore = hasConflict ? (isLevel2 ? 85 : 45) : 10;

    // --- Normalize Data for Explanation Panel ---
    let explanationConflicts: any[] = [];
    if (isLevel2) {
        explanationConflicts = level2Details.map((c: any) => ({
            level: 2,
            path: [selectedInvestor, c.investedParent, c.competingSubsidiary, selectedTarget],
            reason: `Parent entity '${c.investedParent}' owns subsidiary '${c.competingSubsidiary}' which competes with the target.`
        }));
    } else if (isLevel1) {
        explanationConflicts = level1Companies.map((name: string) => ({
            level: 1,
            path: [selectedInvestor, name, selectedTarget],
            reason: `Portfolio company '${name}' operates in the same domain as the target.`
        }));
    }

    return (
        <div className="h-screen bg-slate-50 flex flex-col font-sans overflow-hidden text-slate-900">
            {/* --- Fixed Header (From HomePage) --- */}
            <div className="bg-white px-8 py-6 shadow-sm border-b border-slate-100 z-50 flex-shrink-0">
                <div className="flex items-center justify-between gap-6 w-full h-24">

                    {/* Profile */}
                    <button
                        onClick={() => setShowProfileModal(true)}
                        className="flex items-center gap-4 hover:bg-slate-50 p-2 rounded-xl transition-all group flex-shrink-0 min-w-52"
                    >
                        <div className="relative">
                            <img
                                src={currentUser.avatar}
                                alt={currentUser.name}
                                className="w-14 h-14 rounded-full border-2 border-gray-100 group-hover:border-slate-300 transition-colors object-cover"
                            />
                            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div className="flex flex-col items-start">
                            <span className="text-lg font-bold text-gray-900 leading-tight group-hover:text-slate-800">{currentUser.name}</span>
                            <span className="text-xs text-gray-500 font-medium">View Profile</span>
                        </div>
                    </button>

                    {/* Search */}
                    <div className="flex-1 flex justify-center max-w-3xl px-8 relative">
                        <form onSubmit={handleSearchSubmit} className="relative w-full group !z-50">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                                <div className="bg-slate-800 p-2 rounded-xl">
                                    <Sparkles className="h-5 w-5 text-white animate-pulse" />
                                </div>
                            </div>
                            <input
                                type="text"
                                className="w-full pl-20 pr-20 py-4 bg-slate-900 border border-slate-700 focus:border-slate-500 focus:ring-4 focus:ring-slate-800 rounded-2xl text-base transition-all placeholder-white font-medium outline-none shadow-sm text-white hover:shadow-md hover:border-slate-600 relative z-50"
                                placeholder="Ask anything..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    if (onQueryChange) onQueryChange(e.target.value);
                                }}
                            />
                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none z-50">
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-300 text-xs">|</span>
                                    <kbd className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 border border-slate-600 border-b-2 rounded-lg text-[10px] font-bold text-slate-300 tracking-wider">
                                        ⌘ K
                                    </kbd>
                                </div>
                            </div>
                        </form>

                        {/* RAG Search Results Dropdown */}
                        {searchQuery.length >= 2 && ragResults && (
                            <div className="absolute top-full left-8 right-8 z-[100] shadow-2xl rounded-xl">
                                <SearchResultsDropdown
                                    results={ragResults}
                                    isVisible={true}
                                    isLoading={isSearching || false}
                                    onSelectResult={(id) => onNavigate('profile', id)}
                                />
                            </div>
                        )}
                    </div>

                    {/* Icons */}
                    <div className="flex items-center gap-8 flex-shrink-0">
                        <ActionItem icon={<Home className="w-7 h-7" />} label="Home" onClick={() => onNavigate('home')} />
                        <ActionItem icon={<Users className="w-7 h-7" />} label="Network" onClick={() => onNavigate('network')} />
                        <ActionItem icon={<Bell className="w-7 h-7" />} label="Alerts" badge={true} onClick={() => onNavigate('notifications')} />
                        <ActionItem icon={<MessageSquare className="w-7 h-7" />} label="Inbox" onClick={() => onNavigate('messages')} />
                        <ActionItem icon={<BrainCircuit className="w-7 h-7 text-indigo-600" />} label="Deep Analysis" onClick={() => onNavigate('conflict-report')} />
                    </div>
                </div>
            </div>

            {/* --- Main Content Area --- */}
            <main className="flex-1 w-full overflow-hidden bg-slate-50/50 p-6">
                <div className="w-full max-w-[1800px] mx-auto h-full flex flex-col gap-6">

                    {/* Header Row */}
                    <div className="w-full flex items-center justify-between flex-shrink-0">
                        <div>
                            <h2 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                                <ShieldCheck className="w-6 h-6 text-indigo-600" />
                                Institutional Conflict Check
                            </h2>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-slate-200 shadow-sm text-slate-500 font-medium text-xs">
                                <Clock className="w-3.5 h-3.5" />
                                {new Date().toLocaleDateString()}
                            </div>
                        </div>
                    </div>

                    {/* Dashboard Layout: Stacked Rows with Internal Splits */}
                    <div className="flex flex-col gap-8 pb-20 max-w-[1600px] mx-auto w-full">

                        {/* ROW 1: Selection & Details */}
                        {/* ROW 1: Selection & Details */}
                        <div className="grid grid-cols-2 gap-8">
                            {/* Left: Entity Selection */}
                            <div className="bg-white shadow-sm border border-slate-200 p-10 h-full" style={{ borderRadius: '50px' }}>
                                <EntitySelectionPanel
                                    onRunCheck={handleRunCheck}
                                    isLoading={isAnalyzing}
                                    preselectedInvestor={currentInvestorName}
                                    preselectedTarget={targetCompanyName}
                                    compact={true}
                                />
                            </div>

                            {/* Right: Current Analysis Details */}
                            <div className="bg-white shadow-sm border border-slate-200 p-10 flex flex-col h-full" style={{ borderRadius: '50px' }}>
                                <div className="flex items-center gap-3 mb-8 px-1">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 shadow-md shadow-slate-900/20">
                                        <Building2 className="h-5 w-5 text-white" />
                                    </div>
                                    <h3 className="text-xl font-extrabold text-slate-900">Analysis Details</h3>
                                </div>

                                <div className="flex-1 flex flex-col gap-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        {/* Fixed height cards instead of filling space */}
                                        <div className="min-h-[160px] p-6 bg-slate-50 rounded-[2rem] border border-slate-200 flex flex-col justify-center transition-all hover:bg-slate-100/50 hover:border-slate-300 group relative overflow-hidden">
                                            {/* Decorative background element */}
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-100/50 rounded-bl-[4rem] -mr-8 -mt-8 transition-transform group-hover:scale-110" />

                                            <span className="relative z-10 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2 group-hover:text-slate-500 transition-colors">
                                                <div className="p-1.5 bg-white rounded-lg border border-slate-100 shadow-sm">
                                                    <Users className="w-3.5 h-3.5 text-indigo-500" />
                                                </div>
                                                Primary Investor
                                            </span>
                                            <div className="relative z-10 font-extrabold text-slate-900 text-2xl leading-tight line-clamp-3">
                                                {selectedInvestor || "Not Selected"}
                                            </div>
                                        </div>

                                        <div className="min-h-[160px] p-6 bg-slate-50 rounded-[2rem] border border-slate-200 flex flex-col justify-center transition-all hover:bg-slate-100/50 hover:border-slate-300 group relative overflow-hidden">
                                            {/* Decorative background element */}
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-100/50 rounded-bl-[4rem] -mr-8 -mt-8 transition-transform group-hover:scale-110" />

                                            <span className="relative z-10 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2 group-hover:text-slate-500 transition-colors">
                                                <div className="p-1.5 bg-white rounded-lg border border-slate-100 shadow-sm">
                                                    <Target className="w-3.5 h-3.5 text-emerald-500" />
                                                </div>
                                                Target Company
                                            </span>
                                            <div className="relative z-10 font-extrabold text-slate-900 text-2xl leading-tight line-clamp-3">
                                                {selectedTarget || "Not Selected"}
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        {hasResults ? (
                                            <div className="flex items-center gap-4 px-6 py-5 bg-emerald-50 rounded-[1.5rem] border border-emerald-100 text-emerald-700 shadow-sm">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white border border-emerald-200 shadow-sm">
                                                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-base font-bold text-emerald-900">Analysis Complete</span>
                                                    <span className="text-xs font-medium text-emerald-600/80">
                                                        Conflict check finalized on {new Date().toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-4 px-6 py-5 bg-white rounded-[1.5rem] border border-slate-200 shadow-sm text-slate-400">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100">
                                                    <Clock className="h-5 w-5 text-slate-300" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-base font-bold text-slate-500">Ready to Analyze</span>
                                                    <span className="text-xs font-medium opacity-60">
                                                        Select entities to begin conflict check
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ROW 2: Relationship Graph (Full Width) */}
                        <div className="mt-10 bg-white shadow-sm border border-slate-200 p-6 flex flex-col min-h-[600px] relative overflow-hidden" style={{ borderRadius: '50px' }}>

                            <div className="absolute top-8 left-8 z-10 bg-white/90 backdrop-blur-md px-5 py-2 rounded-full border border-slate-200 shadow-sm pointer-events-none flex items-center gap-2">
                                <BrainCircuit className="w-4 h-4 text-indigo-500" />
                                <span className="text-sm font-bold text-slate-700">Relationship Analysis</span>
                            </div>
                            {hasResults ? (
                                <div className="flex-1 w-full h-full">
                                    <RelationshipGraph
                                        investorName={selectedInvestor}
                                        targetCompany={selectedTarget}
                                        conflictLevel={currentLevel}
                                        conflicts={level2Details}
                                        level1Companies={level1Companies}
                                    />
                                </div>
                            ) : (
                                <div className="flex-1 flex items-center justify-center flex-col text-slate-400 bg-slate-50/50 rounded-xl m-1 border border-dashed border-slate-200">
                                    <BrainCircuit className="w-16 h-16 mb-4 opacity-30" />
                                    <p className="text-sm font-medium">Run analysis to generate graph</p>
                                </div>
                            )}
                        </div>

                        {/* ROW 3: Risk Summary Section */}
                        {/* ROW 3: Risk Summary Section */}
                        <div className="mt-10 flex flex-col gap-6">
                            <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-3 px-1">
                                <div className="p-2 bg-slate-900 rounded-lg shadow-md shadow-slate-900/20">
                                    <ShieldCheck className="w-5 h-5 text-white" />
                                </div>
                                Conflict Risk Assessment
                            </h3>

                            {/* Inner Grid for Risk Levels */}
                            <div className="grid grid-cols-2 gap-6 ">
                                <div className="flex flex-col h-full w-full ">
                                    {hasResults ? (
                                        <RiskOverviewCard
                                            level={1}
                                            hasConflict={isLevel1}
                                            riskScore={isLevel1 ? 45 : 0}
                                            relationships={level1Tags}
                                            description={isLevel1 ? "Direct portfolio overlap." : "No direct conflict."}
                                            className="h-full border border-slate-200 shadow-sm"
                                        />
                                    ) : (
                                        <div className="h-full min-h-[300px] bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-400 gap-4 transition-all hover:border-slate-300 hover:bg-slate-100/50">
                                            <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                                                <Users className="w-8 h-8 text-slate-300" />
                                            </div>
                                            <div className="text-center">
                                                <span className="text-sm font-bold uppercase tracking-wider text-slate-500 block mb-1">Conflict Level 1</span>
                                                <span className="text-xs font-medium opacity-70">Analysis pending...</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col h-full w-full">
                                    {hasResults ? (
                                        <RiskOverviewCard
                                            level={2}
                                            hasConflict={isLevel2}
                                            riskScore={isLevel2 ? 85 : 0}
                                            relationships={level2Tags}
                                            description={isLevel2 ? "Indirect subsidiary/competitor." : "No indirect conflict."}
                                            className="h-full border border-slate-200 shadow-sm"
                                        />
                                    ) : (
                                        <div className="h-full min-h-[300px] bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-400 gap-4 transition-all hover:border-slate-300 hover:bg-slate-100/50">
                                            <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                                                <BrainCircuit className="w-8 h-8 text-slate-300" />
                                            </div>
                                            <div className="text-center">
                                                <span className="text-sm font-bold uppercase tracking-wider text-slate-500 block mb-1">Conflict Level 2</span>
                                                <span className="text-xs font-medium opacity-70">Analysis pending...</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ROW 4: Conflict Explanation (Separate Card) */}
                        <div className="mt-10 flex flex-col gap-6">
                            <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-3 px-1">
                                <div className="p-2 bg-slate-900 rounded-lg shadow-md shadow-slate-900/20">
                                    <MessageSquare className="w-5 h-5 text-white" />
                                </div>
                                Detailed Conflict Explanation
                            </h3>
                            {hasResults ? (
                                <ConflictExplanationPanel
                                    conflicts={explanationConflicts}
                                    hideHeader={true}
                                    className="border border-slate-200 shadow-sm"
                                />
                            ) : (
                                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] min-h-[300px] flex flex-col items-center justify-center text-slate-400 gap-4 transition-all hover:border-slate-300 hover:bg-slate-100/50">
                                    <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                                        <MessageSquare className="w-8 h-8 text-slate-300" />
                                    </div>
                                    <div className="text-center">
                                        <span className="text-sm font-bold uppercase tracking-wider text-slate-500 block mb-1">Explanation Pending</span>
                                        <span className="text-xs font-medium opacity-70">Run analysis to view plain-english explanation</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ROW 5: Compliance Actions (Separate Card) */}
                        <div className="mt-10 flex flex-col gap-6">
                            <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-3 px-1">
                                <div className="p-2 bg-slate-900 rounded-lg shadow-md shadow-slate-900/20">
                                    <ShieldCheck className="w-5 h-5 text-white" />
                                </div>
                                Recommended Compliance Actions
                            </h3>
                            {hasResults ? (
                                <ComplianceActions
                                    reportData={conflictData}
                                    fileNamePrefix={`COI_${selectedInvestor}_${selectedTarget}`}
                                    hideHeader={true}
                                    className="border border-slate-200 shadow-sm"
                                />
                            ) : (
                                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] min-h-[250px] flex flex-col items-center justify-center text-slate-400 gap-4 transition-all hover:border-slate-300 hover:bg-slate-100/50">
                                    <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                                        <ShieldCheck className="w-8 h-8 text-slate-300" />
                                    </div>
                                    <div className="text-center">
                                        <span className="text-sm font-bold uppercase tracking-wider text-slate-500 block mb-1">Actions Unavailable</span>
                                        <span className="text-xs font-medium opacity-70">Run analysis to generate compliance recommendations</span>
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </main>

            {/* --- Profile Modal --- */}
            {showProfileModal && (
                <ProfileModal
                    currentUser={currentUser}
                    onClose={() => setShowProfileModal(false)}
                    onNavigate={onNavigate}
                />
            )}
        </div>
    );
};

// Sub-components (Copied from HomePage for consistency)
function ActionItem({ icon, label, onClick, badge }: { icon: React.ReactNode, label: string, onClick: () => void, badge?: boolean }) {
    return (
        <button
            onClick={onClick}
            className="flex flex-col items-center justify-center text-slate-600 hover:text-white hover:bg-slate-900 p-2 rounded-xl transition-all group min-w-20 relative"
        >
            <div className="relative mb-0.5 transform group-hover:scale-105 transition-transform duration-200">
                {icon}
                {badge && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
            </div>
            <span className="text-xs font-medium tracking-wide group-hover:text-white">{label}</span>
        </button>
    );
}

function ProfileModal({ currentUser, onClose, onNavigate }: { currentUser: User, onClose: () => void, onNavigate: (p: string) => void }) {
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 relative">
                <button onClick={onClose} className="absolute top-3 right-3 p-2 bg-black/10 hover:bg-black/20 text-white rounded-full transition-colors z-10 backdrop-blur-md">
                    <X className="w-4 h-4" />
                </button>
                <div className="h-28 bg-gradient-to-r from-gray-800 to-gray-900"></div>
                <div className="px-6 pb-6 -mt-12 text-center">
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-24 h-24 rounded-full border-4 border-white shadow-md mx-auto object-cover bg-white" />
                    <h2 className="mt-3 text-xl font-bold text-gray-900">{currentUser.name}</h2>
                    <p className="text-sm text-gray-500 mb-4">{currentUser.headline}</p>
                    <button onClick={() => { onClose(); onNavigate('profile'); }} className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold transition-all shadow-lg">
                        View Full Profile
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConflictReportPage;
