import { ChevronRight, FileText, AlertCircle, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export interface ConflictPath {
  id: string;
  path: string[];
  severity: "low" | "medium" | "high";
  explanation: string;
}

interface ConflictExplanationPanelProps {
  conflicts: any[];
}

const ConflictExplanationPanel = ({ conflicts = [] }: ConflictExplanationPanelProps) => {
  // Map API conflicts to UI ConflictPaths
  const conflictPaths: ConflictPath[] = conflicts.map((c, idx) => ({
    id: idx.toString(),
    // Fallback path logic since API returns flat descriptions currently
    path: c.company ? [c.company, "Target Company"] : ["Unknown Entity"],
    severity: c.level === 2 ? "high" : "medium",
    explanation: c.reason
  }));

  // Render mock data if no real conflicts (or if API returns empty during pure UI demo without backend data)
  const displayPaths = conflictPaths.length > 0 ? conflictPaths : [
    {
      id: "demo-1",
      path: ["No Conflicts Detected"],
      severity: "low",
      explanation: "No direct or indirect conflicts were found between the selected investor and the target company."
    } as ConflictPath
  ];

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case "high":
        return {
          badge: "bg-destructive/10 text-destructive border-destructive/20",
          dot: "bg-destructive",
        };
      case "medium":
        return {
          badge: "bg-warning/10 text-warning border-warning/20",
          dot: "bg-warning",
        };
      default:
        return {
          badge: "bg-success/10 text-success border-success/20",
          dot: "bg-success",
        };
    }
  };

  const [selectedPath, setSelectedPath] = useState<string>(displayPaths[0]?.id || "0");

  const selectedConflict = displayPaths.find(p => p.id === selectedPath);

  return (
    <Card className="animate-fade-in h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <FileText className="h-4 w-4 text-primary" />
          </div>
          Conflict Explanation
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
          {/* Left: Conflict Paths */}
          <div className="p-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">
              Detected Conflict Paths
            </h4>
            <ScrollArea className="h-[240px] pr-2">
              <div className="space-y-2">
                {displayPaths.map((conflict) => {
                  const styles = getSeverityStyles(conflict.severity);
                  const isSelected = selectedPath === conflict.id;

                  return (
                    <button
                      key={conflict.id}
                      onClick={() => setSelectedPath(conflict.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${isSelected
                        ? "border-primary bg-accent shadow-sm"
                        : "border-border hover:border-primary/30 hover:bg-secondary/50"
                        }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className={styles.badge}>
                          {conflict.severity.charAt(0).toUpperCase() + conflict.severity.slice(1)}
                        </Badge>
                        <ChevronRight className={`h-4 w-4 transition-transform ${isSelected ? "text-primary rotate-90" : "text-muted-foreground"
                          }`} />
                      </div>
                      <div className="flex flex-wrap items-center gap-1">
                        {conflict.path.map((node, i) => (
                          <span key={i} className="flex items-center text-xs">
                            <span className={`${i === 0 ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                              {node}
                            </span>
                            {i < conflict.path.length - 1 && (
                              <ChevronRight className="h-3 w-3 text-muted-foreground mx-0.5" />
                            )}
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Right: Explanation */}
          <div className="p-4 bg-secondary/20">
            <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Info className="h-4 w-4" />
              Plain-English Explanation
            </h4>

            {selectedConflict && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex flex-wrap items-center gap-1.5 p-3 rounded-lg bg-card border border-border">
                  {selectedConflict.path.map((node, i) => (
                    <span key={i} className="flex items-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${i === 0
                        ? "bg-[#4F46E5]/10 text-[#4F46E5]"
                        : i === selectedConflict.path.length - 1
                          ? "bg-[#EF4444]/10 text-[#EF4444]"
                          : "bg-secondary text-foreground"
                        }`}>
                        {node}
                      </span>
                      {i < selectedConflict.path.length - 1 && (
                        <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />
                      )}
                    </span>
                  ))}
                </div>

                <div className="p-4 rounded-lg bg-card border border-border">
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 h-2 w-2 rounded-full ${getSeverityStyles(selectedConflict.severity).dot}`} />
                    <p className="text-sm text-foreground leading-relaxed">
                      {selectedConflict.explanation}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 rounded-lg bg-accent/50 border border-primary/10">
                  <AlertCircle className="h-4 w-4 text-primary shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    This explanation is audit-ready and suitable for compliance documentation.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

import { useState } from "react";

export default ConflictExplanationPanel;
