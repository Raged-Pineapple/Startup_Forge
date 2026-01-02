import { useState } from 'react';
import { AlertTriangle, CheckCircle, ChevronDown, ChevronUp, AlertOctagon } from 'lucide-react';

interface Conflict {
    level: number;
    company: string;
    reason: string;
}

interface ConflictResult {
    hasConflict: boolean;
    conflictLevel: number;
    conflicts: Conflict[];
}

interface ConflictBadgeProps {
    result: ConflictResult | null;
    isLoading: boolean;
}

export function ConflictBadge({ result, isLoading }: ConflictBadgeProps) {
    const [expanded, setExpanded] = useState(false);

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg animate-pulse">
                <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                <span className="text-sm font-medium text-gray-500">Checking for conflicts...</span>
            </div>
        );
    }

    if (!result) return null;

    if (!result.hasConflict) {
        return (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-green-700">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">No Conflict Detected</span>
            </div>
        );
    }

    const isHighSeverity = result.conflictLevel >= 2;
    const badgeColor = isHighSeverity
        ? "bg-red-50 border-red-200 text-red-700"
        : "bg-yellow-50 border-yellow-200 text-yellow-700";

    const Icon = isHighSeverity ? AlertOctagon : AlertTriangle;

    return (
        <div className={`border rounded-lg overflow-hidden transition-all duration-200 ${badgeColor} border`}>
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-black/5 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <div className="flex flex-col text-left">
                        <span className="font-bold text-sm uppercase tracking-wide">
                            Level {result.conflictLevel} Conflict Detected
                        </span>
                        <span className="text-xs opacity-90">
                            {result.conflicts.length} issue{result.conflicts.length !== 1 ? 's' : ''} found
                        </span>
                    </div>
                </div>
                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {expanded && (
                <div className="px-4 pb-4 space-y-3 bg-white/50 border-t border-black/5 pt-3">
                    {result.conflicts.map((conflict, idx) => (
                        <div key={idx} className="flex gap-3 text-sm">
                            <span className={`flex-shrink-0 font-mono text-xs px-1.5 py-0.5 rounded border ${isHighSeverity ? "border-red-300 bg-red-100" : "border-yellow-300 bg-yellow-100"}`}>
                                L{conflict.level}
                            </span>
                            <p className="leading-relaxed">
                                <span className="font-semibold">{conflict.company}:</span> {conflict.reason}
                            </p>
                        </div>
                    ))}
                    <p className="text-xs opacity-75 mt-2 italic">
                        * This checks strictly against Invested Portfolio, Subsidiaries, and Domain overlap.
                    </p>
                </div>
            )}
        </div>
    );
}
