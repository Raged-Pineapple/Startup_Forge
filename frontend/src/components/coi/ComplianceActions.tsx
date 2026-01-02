import { Download, Share2, Database, FileJson } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface ComplianceActionsProps {
  reportData: any;
  fileNamePrefix: string;
}

const ComplianceActions = ({ reportData, fileNamePrefix }: ComplianceActionsProps) => {
  const handleDownloadPDF = () => {
    toast.success("Preparing PDF View...", {
      description: "Opening print dialog. Please select 'Save as PDF'.",
    });
    setTimeout(() => window.print(), 500);
  };

  const handleExportGraph = () => {
    const svgElement = document.getElementById("relationship-graph-svg");
    if (!svgElement) {
      toast.error("Graph not found");
      return;
    }

    // Serialize SVG
    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(svgElement);

    // Add namespace if missing
    if (!svgString.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
      svgString = svgString.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }

    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileNamePrefix}_graph.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Exporting Relationship Graph...", {
      description: "Graph downloaded as SVG.",
    });
  };

  const handleViewRawData = () => {
    const jsonString = JSON.stringify(reportData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileNamePrefix}_data.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.info("Downloading Raw Data", {
      description: "Relationship data exported as JSON.",
    });
  };

  return (
    <Card className="animate-fade-in print:hidden">
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
