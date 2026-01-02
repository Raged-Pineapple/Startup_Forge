import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Network, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Node {
  id: string;
  label: string;
  type: "investor" | "founder" | "company" | "target";
  x: number;
  y: number;
}

interface Edge {
  from: string;
  to: string;
  type: "direct" | "indirect";
  label?: string;
}

interface RelationshipGraphProps {
  investorName: string;
  targetCompany: string;
  conflictLevel: number; // 0, 1, or 2
  conflicts?: any[]; // Level 2 details
  level1Companies?: string[]; // Level 1 company names
}

const RelationshipGraph = ({
  investorName,
  targetCompany,
  conflictLevel,
  conflicts = [],
  level1Companies = []
}: RelationshipGraphProps) => {
  const [zoom, setZoom] = useState(1);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  useEffect(() => {
    // Dynamic Graph Generation Logic
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    // Helper positions
    const startX = 100;
    const endX = 660;
    const midX = (startX + endX) / 2;
    const centerY = 150;

    // 1. Always add Investor and Target
    newNodes.push({ id: "inv", label: investorName || "Investor", type: "investor", x: startX, y: centerY });
    newNodes.push({ id: "tgt", label: targetCompany || "Target", type: "target", x: endX, y: centerY });

    if (conflictLevel === 2) {
      // --- Level 2: Indirect Conflict (Ownership) ---
      // Pattern: Investor -> Parent -> Subsidiary -> Target
      // For demo simplicity, we visualize the FIRST conflict path if multiple exist
      const conflict = conflicts[0] || {};
      const parentName = conflict.investedParent || "Parent Co";
      const subName = conflict.competingSubsidiary || "Subsidiary";

      // Parent Node
      newNodes.push({ id: "parent", label: parentName, type: "company", x: startX + 180, y: centerY - 50 });
      // Subsidiary Node
      newNodes.push({ id: "sub", label: subName, type: "company", x: endX - 180, y: centerY + 50 });

      // Edges
      newEdges.push({ from: "inv", to: "parent", type: "direct", label: "Invested In" });
      newEdges.push({ from: "parent", to: "sub", type: "direct", label: "Owns" });
      newEdges.push({ from: "sub", to: "tgt", type: "indirect", label: "Competes With" });

    } else if (conflictLevel === 1) {
      // --- Level 1: Direct/Sector Conflict ---
      // Pattern: Investor -> Portfolio Co -> Target (via Sector)
      const portCoName = level1Companies[0] || "Portfolio Co";

      // Portfolio Node
      newNodes.push({ id: "port", label: portCoName, type: "company", x: midX, y: centerY });

      // Edges
      newEdges.push({ from: "inv", to: "port", type: "direct", label: "Invested In" });
      newEdges.push({ from: "port", to: "tgt", type: "indirect", label: "Same Sector" });

    } else {
      // --- No Conflict ---
      // Just showing they are disconnected or checking
      // Optional: Add a '?' link or just leave blank
      newEdges.push({ from: "inv", to: "tgt", type: "indirect", label: "No Conflict Found" });
    }

    setNodes(newNodes);
    setEdges(newEdges);

  }, [investorName, targetCompany, conflictLevel, conflicts, level1Companies]);

  const getNodeColor = (type: string) => {
    const colors: Record<string, string> = {
      investor: "#4F46E5",
      founder: "#9333EA",
      company: "#0EA5E9",
      target: "#EF4444",
    };
    return colors[type] || "#6B7280";
  };

  const getNodeBgColor = (type: string) => {
    const colors: Record<string, string> = {
      investor: "#EEF2FF",
      founder: "#FAF5FF",
      company: "#F0F9FF",
      target: "#FEF2F2",
    };
    return colors[type] || "#F9FAFB";
  };

  const getEdgePath = (from: Node, to: Node) => {
    const dx = to.x - from.x;
    // Curvature logic
    const cx1 = from.x + dx * 0.4;
    const cy1 = from.y;
    const cx2 = from.x + dx * 0.6;
    const cy2 = to.y;
    return `M ${from.x} ${from.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${to.x} ${to.y}`;
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Network className="h-4 w-4 text-primary" />
            </div>
            Relationship Graph
          </CardTitle>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setZoom(Math.min(1.5, zoom + 0.1))}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="relative border-t border-border bg-secondary/30 overflow-hidden" style={{ height: 320 }}>
          <svg
            id="relationship-graph-svg"
            width="100%"
            height="100%"
            viewBox="0 0 760 300"
            style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}
            className="transition-transform duration-200"
          >
            <defs>
              <marker
                id="arrowhead"
                markerWidth="8"
                markerHeight="6"
                refX="8"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="#9CA3AF" />
              </marker>
              <marker
                id="arrowhead-dashed"
                markerWidth="8"
                markerHeight="6"
                refX="8"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="#D1D5DB" />
              </marker>
            </defs>

            {/* Edges */}
            {edges.map((edge, i) => {
              const fromNode = nodes.find(n => n.id === edge.from);
              const toNode = nodes.find(n => n.id === edge.to);
              if (!fromNode || !toNode) return null;

              const midX = (fromNode.x + toNode.x) / 2;
              const midY = (fromNode.y + toNode.y) / 2 - 10;

              return (
                <g key={i}>
                  <path
                    d={getEdgePath(fromNode, toNode)}
                    fill="none"
                    stroke={edge.type === "direct" ? "#9CA3AF" : "#D1D5DB"}
                    strokeWidth={edge.type === "direct" ? 2 : 1.5}
                    strokeDasharray={edge.type === "indirect" ? "6,4" : "none"}
                    markerEnd={edge.type === "direct" ? "url(#arrowhead)" : "url(#arrowhead-dashed)"}
                    className="transition-all duration-200"
                  />
                  {edge.label && (
                    <text
                      x={midX}
                      y={midY}
                      textAnchor="middle"
                      className="fill-muted-foreground text-[10px]"
                    >
                      {edge.label}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map((node) => (
              <g
                key={node.id}
                className="cursor-pointer transition-transform duration-200"
                style={{
                  transform: hoveredNode === node.id ? "scale(1.05)" : "scale(1)",
                  transformOrigin: `${node.x}px ${node.y}px`,
                }}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={hoveredNode === node.id ? 34 : 30}
                  fill={getNodeBgColor(node.type)}
                  stroke={getNodeColor(node.type)}
                  strokeWidth={2}
                  className="transition-all duration-200"
                />
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={12}
                  fill={getNodeColor(node.type)}
                />
                <text
                  x={node.x}
                  y={node.y + 50}
                  textAnchor="middle"
                  className="fill-foreground text-xs font-medium"
                >
                  {node.label}
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 p-4 border-t border-border bg-card">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: "#4F46E5" }} />
            <span className="text-xs text-muted-foreground">Investor</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: "#0EA5E9" }} />
            <span className="text-xs text-muted-foreground">Company</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: "#EF4444" }} />
            <span className="text-xs text-muted-foreground">Target</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <div className="h-0.5 w-6 bg-muted-foreground" />
            <span className="text-xs text-muted-foreground">Direct</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-0.5 w-6 border-t-2 border-dashed border-muted-foreground/50" />
            <span className="text-xs text-muted-foreground">Indirect</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RelationshipGraph;
