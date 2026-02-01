import { cn } from "@/lib/utils";
import { AIInsight, AIMode } from "@/types/meeting";
import { 
  Sparkles, 
  Lightbulb, 
  AlertTriangle, 
  CheckCircle2,
  Brain,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AIAgentProps {
  mode: AIMode;
  onModeChange: (mode: AIMode) => void;
  insights: AIInsight[];
  isThinking?: boolean;
  className?: string;
}

const modeLabels: Record<AIMode, string> = {
  assist: "Assist",
  "semi-auto": "Semi-Auto",
  auto: "Auto",
};

const insightIcons = {
  summary: Brain,
  suggestion: Lightbulb,
  question: Lightbulb,
  risk: AlertTriangle,
  decision: CheckCircle2,
};

export function AIAgent({ 
  mode, 
  onModeChange, 
  insights, 
  isThinking = false,
  className 
}: AIAgentProps) {
  const modes: AIMode[] = ["assist", "semi-auto", "auto"];

  return (
    <div className={cn("space-y-4", className)}>
      {/* AI Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Nexus AI</p>
          <p className="text-xs text-muted-foreground">
            {isThinking ? "Thinking..." : `${modeLabels[mode]} mode`}
          </p>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-1 p-1 rounded-lg bg-surface-1">
        {modes.map((m) => (
          <Button
            key={m}
            variant={mode === m ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onModeChange(m)}
            className="flex-1 text-xs h-7"
          >
            {modeLabels[m]}
          </Button>
        ))}
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs text-muted-foreground">Insights</span>
          {insights.slice(0, 3).map((insight) => {
            const Icon = insightIcons[insight.type];
            return (
              <div
                key={insight.id}
                className={cn(
                  "p-3 rounded-xl bg-surface-1 border-l-2",
                  insight.type === "risk" && "border-l-aurora-rose",
                  insight.type === "decision" && "border-l-primary",
                  insight.type === "suggestion" && "border-l-aurora-cyan",
                  insight.type === "summary" && "border-l-secondary",
                  insight.type === "question" && "border-l-secondary"
                )}
              >
                <div className="flex items-start gap-2">
                  <Icon className={cn(
                    "w-4 h-4 mt-0.5 shrink-0",
                    insight.type === "risk" && "text-aurora-rose",
                    insight.type === "decision" && "text-primary",
                    insight.type === "suggestion" && "text-aurora-cyan",
                    (insight.type === "summary" || insight.type === "question") && "text-secondary"
                  )} />
                  <p className="text-sm text-foreground leading-relaxed">
                    {insight.content}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
