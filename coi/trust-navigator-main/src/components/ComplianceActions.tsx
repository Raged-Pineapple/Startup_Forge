import { Download, Share2, Database, FileJson } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const ComplianceActions = () => {
  const handleDownloadPDF = () => {
    toast.success("Generating PDF Report...", {
      description: "Your COI report will be ready for download shortly.",
    });
  };

  const handleExportGraph = () => {
    toast.success("Exporting Relationship Graph...", {
      description: "Graph data exported in PNG and SVG formats.",
    });
  };

  const handleViewRawData = () => {
    toast.info("Opening Raw Data View", {
      description: "Relationship data displayed in JSON format.",
    });
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Share2 className="h-4 w-4 text-primary" />
          </div>
          Compliance Actions
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex flex-wrap gap-3">
          <Button 
            variant="default" 
            onClick={handleDownloadPDF}
            className="flex-1 min-w-[180px]"
          >
            <Download className="h-4 w-4" />
            Download COI Report (PDF)
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleExportGraph}
            className="flex-1 min-w-[180px]"
          >
            <Share2 className="h-4 w-4" />
            Export Relationship Graph
          </Button>
          
          <Button 
            variant="secondary" 
            onClick={handleViewRawData}
            className="flex-1 min-w-[180px]"
          >
            <FileJson className="h-4 w-4" />
            View Raw Relationship Data
          </Button>
        </div>

        <div className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-secondary/50 border border-border">
          <Database className="h-4 w-4 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            All reports are timestamped and logged for audit compliance. Data retention: 7 years.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComplianceActions;
