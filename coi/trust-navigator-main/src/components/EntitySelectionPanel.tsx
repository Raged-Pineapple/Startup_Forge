import { useState } from "react";
import { Search, Building2, Users, User, Target, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface EntitySelectionPanelProps {
  onRunCheck: () => void;
  isLoading?: boolean;
}

const EntitySelectionPanel = ({ onRunCheck, isLoading }: EntitySelectionPanelProps) => {
  const [entityType, setEntityType] = useState<string>("");
  const [selectedEntity, setSelectedEntity] = useState<string>("");
  const [targetCompany, setTargetCompany] = useState<string>("");

  const entityTypeIcons: Record<string, React.ReactNode> = {
    investor: <Users className="h-4 w-4" />,
    founder: <User className="h-4 w-4" />,
    company: <Building2 className="h-4 w-4" />,
  };

  const sampleEntities: Record<string, string[]> = {
    investor: ["Sequoia Capital", "Andreessen Horowitz", "Accel Partners", "Benchmark Capital"],
    founder: ["John Smith", "Emily Johnson", "Michael Chen", "Sarah Williams"],
    company: ["TechCorp Inc.", "StartupXYZ", "InnovateCo", "DataDriven LLC"],
  };

  const targetCompanies = ["Acme Technologies", "GlobalFinance Corp", "HealthTech Solutions", "EduPlatform Inc."];

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Search className="h-4 w-4 text-primary" />
          </div>
          Entity Selection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Entity Type
            </label>
            <Select value={entityType} onValueChange={setEntityType}>
              <SelectTrigger className="h-11 bg-background">
                <SelectValue placeholder="Select type..." />
              </SelectTrigger>
              <SelectContent className="bg-card">
                <SelectItem value="investor">
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-node-investor" />
                    Investor
                  </span>
                </SelectItem>
                <SelectItem value="founder">
                  <span className="flex items-center gap-2">
                    <User className="h-4 w-4 text-node-founder" />
                    Founder
                  </span>
                </SelectItem>
                <SelectItem value="company">
                  <span className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-node-company" />
                    Company
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Select Entity
            </label>
            <Select 
              value={selectedEntity} 
              onValueChange={setSelectedEntity}
              disabled={!entityType}
            >
              <SelectTrigger className="h-11 bg-background">
                <SelectValue placeholder={entityType ? "Search entities..." : "Select type first"} />
              </SelectTrigger>
              <SelectContent className="bg-card">
                {entityType && sampleEntities[entityType]?.map((entity) => (
                  <SelectItem key={entity} value={entity}>
                    <span className="flex items-center gap-2">
                      {entityTypeIcons[entityType]}
                      {entity}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Target Company <span className="text-muted-foreground">(Optional)</span>
            </label>
            <Select value={targetCompany} onValueChange={setTargetCompany}>
              <SelectTrigger className="h-11 bg-background">
                <SelectValue placeholder="Select target..." />
              </SelectTrigger>
              <SelectContent className="bg-card">
                {targetCompanies.map((company) => (
                  <SelectItem key={company} value={company}>
                    <span className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-node-target" />
                      {company}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button 
            variant="primaryGradient"
            size="lg"
            onClick={onRunCheck}
            disabled={!entityType || !selectedEntity || isLoading}
            className="min-w-[180px]"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Run Conflict Check
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EntitySelectionPanel;
