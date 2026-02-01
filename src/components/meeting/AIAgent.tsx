import { cn } from "@/lib/utils";
import { AIInsight, AIMode } from "@/types/meeting";
import { 
  Sparkles, 
  Brain, 
  Lightbulb, 
  AlertTriangle, 
  CheckCircle2,
  MessageSquare,
  Settings2,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface AIAgentProps {
  mode: AIMode;
  onModeChange: (mode: AIMode) => void;
  insights: AIInsight[];
  isThinking?: boolean;
  className?: string;
}

const modeLabels = {
  assist: "Assist",
  "semi-auto": "Semi-Auto",
  auto: "Auto",
};

const modeDescriptions = {
  assist: "Silent observation, provides insights on request",
  "semi-auto": "Suggests actions and provides real-time insights",
  auto: "Actively participates and takes actions when needed",
};

const insightIcons = {
  summary: Brain,
  suggestion: Lightbulb,
  question: MessageSquare,
  risk: AlertTriangle,
  decision: CheckCircle2,
};

const insightColors = {
  summary: "text-aurora-cyan border-aurora-cyan/30 bg-aurora-cyan/10",
  suggestion: "text-aurora-teal border-aurora-teal/30 bg-aurora-teal/10",
  question: "text-aurora-violet border-aurora-violet/30 bg-aurora-violet/10",
  risk: "text-aurora-rose border-aurora-rose/30 bg-aurora-rose/10",
  decision: "text-aurora-teal border-aurora-teal/30 bg-aurora-teal/10",
};

export function AIAgent({ 
  mode, 
  onModeChange, 
  insights, 
  isThinking = false,
  className 
}: AIAgentProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={cn("space-y-4", className)}>
      {/* AI Agent Header */}
      <div className="glass-panel rounded-2xl p-4 gradient-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* AI Avatar */}
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-aurora-teal to-aurora-violet flex items-center justify-center ai-pulse">
                <Sparkles className="w-6 h-6 text-background" />
              </div>
              {isThinking && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-aurora-cyan animate-pulse" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Nexus AI</h3>
              <p className="text-xs text-muted-foreground">
                {isThinking ? "Processing..." : modeLabels[mode] + " Mode"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="iconSm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <Settings2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Mode Selector (Expanded) */}
        {isExpanded && (
          <div className="space-y-2 pt-3 border-t border-border/50 fade-in">
            {(Object.keys(modeLabels) as AIMode[]).map((m) => (
              <button
                key={m}
                onClick={() => onModeChange(m)}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-xl transition-all",
                  mode === m
                    ? "bg-primary/10 border border-primary/30"
                    : "hover:bg-surface-2"
                )}
              >
                <div className="text-left">
                  <p className={cn(
                    "text-sm font-medium",
                    mode === m ? "text-primary" : "text-foreground"
                  )}>
                    {modeLabels[m]}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {modeDescriptions[m]}
                  </p>
                </div>
                {mode === m && (
                  <div className="w-2 h-2 rounded-full bg-primary" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* AI Insights */}
      {insights.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground px-1">Live Insights</p>
          {insights.slice(0, 3).map((insight, index) => {
            const Icon = insightIcons[insight.type];
            return (
              <div
                key={insight.id}
                className={cn(
                  "glass-panel rounded-xl p-3 slide-in-right",
                  "border-l-2",
                  insight.type === "risk" && "border-l-aurora-rose",
                  insight.type === "decision" && "border-l-aurora-teal",
                  insight.type === "suggestion" && "border-l-aurora-cyan",
                  insight.type === "summary" && "border-l-aurora-violet",
                  insight.type === "question" && "border-l-aurora-violet"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-2">
                  <div className={cn(
                    "p-1.5 rounded-lg",
                    insightColors[insight.type]
                  )}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground leading-relaxed">
                      {insight.content}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {new Date(insight.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <Button variant="ghost" size="iconSm" className="shrink-0">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
