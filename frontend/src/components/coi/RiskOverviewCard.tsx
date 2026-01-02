import { CheckCircle2, AlertTriangle, XCircle, TrendingUp, Link2, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RiskOverviewCardProps {
    level: 1 | 2;
    hasConflict: boolean;
    riskScore: number;
    relationships: string[];
    description: string;
}

const RiskOverviewCard = ({
    level,
    hasConflict,
    riskScore,
    relationships,
    description,
}: RiskOverviewCardProps) => {
    const getSeverity = (score: number) => {
        if (score <= 30) return { label: "Low", color: "bg-green-500/10 text-green-700 border-green-500/20" };
        if (score <= 60) return { label: "Medium", color: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20" };
        return { label: "High", color: "bg-destructive/10 text-destructive border-destructive/20" };
    };

    const severity = getSeverity(riskScore);

    const getStatusIcon = () => {
        if (!hasConflict) return <CheckCircle2 className="h-5 w-5 text-green-500" />;
        if (riskScore <= 60) return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
        return <XCircle className="h-5 w-5 text-destructive" />;
    };

    // Removed getCardVariant as Card doesn't support 'variant' prop.
    // Instead, applying classes directly.
    const getCardBorderClass = () => {
        if (!hasConflict) return "border-green-500/50";
        if (riskScore <= 60) return "border-yellow-500/50";
        return "border-destructive/50";
    };

    const getRiskBarColor = () => {
        if (riskScore <= 30) return "bg-green-500";
        if (riskScore <= 60) return "bg-yellow-500";
        return "bg-destructive";
    };

    return (
        <Card className={`animate-fade-in ${getCardBorderClass()}`}>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${level === 1 ? "bg-primary/10" : "bg-accent"
                            }`}>
                            {level === 1 ? (
                                <Link2 className="h-5 w-5 text-primary" />
                            ) : (
                                <Users className="h-5 w-5 text-accent-foreground" />
                            )}
                        </div>
                        <div>
                            <CardTitle className="text-base font-semibold">
                                Level {level}: {level === 1 ? "Direct Conflict" : "Indirect Conflict"}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                {level === 1 ? "Immediate relationships" : "Multi-hop connections via intermediaries"}
                            </p>
                        </div>
                    </div>

                    <Badge variant="outline" className={severity.color}>
                        {severity.label} Risk
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary">
                        {getStatusIcon()}
                        <span className="text-sm font-medium">
                            {hasConflict ? "Conflict Detected" : "No Conflict"}
                        </span>
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-muted-foreground">Risk Score</span>
                            <span className="text-sm font-semibold">{riskScore}/100</span>
                        </div>
                        <div className="h-2 rounded-full bg-secondary overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${getRiskBarColor()}`}
                                style={{ width: `${riskScore}%` }}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{description}</p>

                    {relationships.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                            {relationships.map((rel, i) => (
                                <Badge
                                    key={i}
                                    variant="secondary"
                                    className="text-xs font-normal"
                                >
                                    {rel}
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default RiskOverviewCard;
