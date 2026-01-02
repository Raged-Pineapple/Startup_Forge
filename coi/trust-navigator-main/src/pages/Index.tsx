import { useState } from "react";
import NavBar from "@/components/NavBar";
import EntitySelectionPanel from "@/components/EntitySelectionPanel";
import RiskOverviewCard from "@/components/RiskOverviewCard";
import RelationshipGraph from "@/components/RelationshipGraph";
import ConflictExplanationPanel from "@/components/ConflictExplanationPanel";
import ComplianceActions from "@/components/ComplianceActions";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, RefreshCw } from "lucide-react";

const Index = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasResults, setHasResults] = useState(true);

  const handleRunCheck = () => {
    setIsAnalyzing(true);
    setHasResults(false);
    
    setTimeout(() => {
      setIsAnalyzing(false);
      setHasResults(true);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <main className="container py-8">
        {/* Page Header */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                Conflict of Interest Analysis
              </h1>
              <p className="text-muted-foreground mt-1">
                Analyze direct and indirect relationships to detect potential conflicts
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Last updated: Dec 31, 2024</span>
              </div>
              <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                <div className="h-1.5 w-1.5 rounded-full bg-success mr-1.5 animate-pulse" />
                System Active
              </Badge>
            </div>
          </div>
        </header>

        {/* Entity Selection */}
        <section className="mb-8">
          <EntitySelectionPanel onRunCheck={handleRunCheck} isLoading={isAnalyzing} />
        </section>

        {hasResults && (
          <>
            {/* Risk Overview Cards */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Risk Assessment</h2>
                <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <RefreshCw className="h-4 w-4" />
                  Refresh Analysis
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <RiskOverviewCard
                  level={1}
                  hasConflict={true}
                  riskScore={72}
                  relationships={["Investment", "Board Seat", "Employment"]}
                  description="Direct relationships detected between the selected entity and target company through investment and governance connections."
                />
                <RiskOverviewCard
                  level={2}
                  hasConflict={true}
                  riskScore={45}
                  relationships={["Advisory", "Former Employment", "Shared Investor"]}
                  description="Indirect connections identified via intermediary entities. These multi-hop relationships may influence decision-making."
                />
              </div>
            </section>

            {/* Relationship Graph */}
            <section className="mb-8">
              <RelationshipGraph />
            </section>

            {/* Conflict Explanation */}
            <section className="mb-8">
              <ConflictExplanationPanel />
            </section>

            {/* Compliance Actions */}
            <section className="mb-8">
              <ComplianceActions />
            </section>
          </>
        )}

        {/* Footer */}
        <footer className="border-t border-border pt-6 mt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© 2024 ComplianceAI. Enterprise Risk & Compliance Platform.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-foreground transition-colors">Documentation</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;
