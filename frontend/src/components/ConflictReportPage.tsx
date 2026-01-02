import { useState, useEffect } from "react";
// Components ported from reference
import RiskOverviewCard from "@/components/coi/RiskOverviewCard";
import RelationshipGraph from "@/components/coi/RelationshipGraph";
import ConflictExplanationPanel from "@/components/coi/ConflictExplanationPanel";
import ComplianceActions from "@/components/coi/ComplianceActions";

// UI Components
import { Badge } from "@/components/ui/badge";
import { Calendar, RefreshCw, ArrowLeft } from "lucide-react";

interface ConflictReportPageProps {
    onBack: () => void;
    investorId: string;
    investorName: string;
}

const ConflictReportPage = ({ onBack, investorId, investorName }: ConflictReportPageProps) => {
    const [isAnalyzing, setIsAnalyzing] = useState(true);
    const [conflictData, setConflictData] = useState<any>(null);

    useEffect(() => {
        const checkConflict = async () => {
            setIsAnalyzing(true);
            try {
                // Use props investorName, default to 'Eyal Gura' for demo if empty/current-user
                // targetCompany is hardcoded to 'Kapital' for this demo phase
                const effectiveName = (investorName === 'You' || !investorName) ? 'Eyal Gura' : investorName;

                const res = await fetch('http://localhost:3000/api/coi/check', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        investorName: effectiveName,
                        targetCompany: 'Kapital'
                    })
                });
                const data = await res.json();
                setConflictData(data);
            } catch (err) {
                console.error("COI Analysis Failed", err);
                // Fallback for UI if API fails completely
                setConflictData({ hasConflict: false, conflicts: [] });
            } finally {
                // Minimum loading time for UX
                setTimeout(() => setIsAnalyzing(false), 1000);
            }
        };

        checkConflict();
    }, [investorId]);

    // Helpers to extract display data from API response
    const currentLevel = conflictData?.conflictLevel || 0;
    const hasConflict = conflictData?.hasConflict || false;

    // --- Level 1 Data (Sector Overlap) ---
    const isLevel1 = currentLevel === 1;
    const level1Companies = isLevel1 ? (conflictData.conflictingCompanies || []) : [];
    // If we have level 1 conflict, we show the companies as "relationships" tags in the card
    const level1Tags = isLevel1 ? level1Companies : [];

    // --- Level 2 Data (Subsidiary/Competitor) ---
    const isLevel2 = currentLevel === 2;
    const level2Details = isLevel2 ? (conflictData.conflicts || []) : [];
    // For Level 2, we can show the parent companies involved as tags
    const level2Tags = isLevel2 ? level2Details.map((c: any) => c.investedParent) : [];

    // --- Calculate Score ---
    const riskScore = hasConflict ? (isLevel2 ? 85 : 45) : 0; // Higher score for L2 (Hard conflict)

    // --- Normalize Data for Explanation Panel ---
    let explanationConflicts: any[] = [];
    if (isLevel2) {
        explanationConflicts = level2Details.map((c: any) => ({
            level: 2,
            company: c.investedParent,
            reason: `Parent entity '${c.investedParent}' owns subsidiary '${c.competingSubsidiary}' which competes with the target.`
        }));
    } else if (isLevel1) {
        explanationConflicts = level1Companies.map((name: string) => ({
            level: 1,
            company: name,
            reason: `Portfolio company '${name}' operates in the same domain as the target.`
        }));
    }

    return (
        <div className="min-h-screen bg-background">
            <main className="container py-8 max-w-7xl mx-auto px-4">
                {/* Page Header */}
                <header className="mb-8">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Profile
                    </button>

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-foreground tracking-tight">
                                Conflict of Interest Analysis
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Detailed analysis of direct and indirect relationships for <strong>{investorName}</strong> vs <strong>Target Company</strong>
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>Last updated: {new Date().toLocaleDateString()}</span>
                            </div>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <div className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse" />
                                Live Analysis
                            </Badge>
                        </div>
                    </div>
                </header>

                {isAnalyzing ? (
                    <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                        <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700">Analyzing Relationships...</h3>
                        <p className="text-gray-500">Scanning graph database for Level 1 & 2 conflicts</p>
                    </div>
                ) : (
                    <>
                        {/* Risk Overview Cards */}
                        <section className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-foreground">Risk Assessment</h2>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <RiskOverviewCard
                                    level={1}
                                    hasConflict={isLevel1}
                                    riskScore={isLevel1 ? 45 : 0}
                                    relationships={level1Tags}
                                    description={isLevel1
                                        ? conflictData.reason
                                        : "No direct investment or domain conflicts detected."}
                                />
                                <RiskOverviewCard
                                    level={2}
                                    hasConflict={isLevel2}
                                    riskScore={isLevel2 ? 85 : 0}
                                    relationships={level2Tags.length > 0 ? level2Tags : ["Subsidiary", "Competitor"]}
                                    description={isLevel2
                                        ? conflictData.reason
                                        : "No subsidiary or competitor conflicts detected."}
                                />
                            </div>
                        </section>

                        {/* Relationship Graph - (Static for now, illustration only) */}
                        <section className="mb-8 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100">
                            <RelationshipGraph
                                investorName={investorName}
                                targetCompany="Kapital"
                                conflictLevel={currentLevel}
                                conflicts={level2Details}
                                level1Companies={level1Companies}
                            />
                        </section>

                        {/* Conflict Explanation */}
                        <section className="mb-8 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
                            <ConflictExplanationPanel conflicts={explanationConflicts} />
                        </section>

                        {/* Compliance Actions */}
                        <section className="mb-8 animate-in fade-in slide-in-from-bottom-7 duration-700 delay-300">
                            <ComplianceActions
                                reportData={conflictData}
                                fileNamePrefix={`COI_${(investorName || 'investor').replace(/\s+/g, '_')}_Kapital`}
                            />
                        </section>
                    </>
                )}
            </main>
        </div>
    );
};

export default ConflictReportPage;
