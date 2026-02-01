import { cn } from "@/lib/utils";
import { Decision, ActionItem } from "@/types/meeting";
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Plus,
  ChevronDown,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface DecisionCaptureProps {
  decisions: Decision[];
  actionItems: ActionItem[];
  className?: string;
}

const statusColors = {
  proposed: "text-aurora-cyan border-aurora-cyan/30 bg-aurora-cyan/10",
  confirmed: "text-aurora-teal border-aurora-teal/30 bg-aurora-teal/10",
  deferred: "text-muted-foreground border-border bg-surface-2",
};

const priorityColors = {
  high: "bg-aurora-rose/20 text-aurora-rose border-aurora-rose/30",
  medium: "bg-aurora-violet/20 text-aurora-violet border-aurora-violet/30",
  low: "bg-muted text-muted-foreground border-border",
};

export function DecisionCapture({ decisions, actionItems, className }: DecisionCaptureProps) {
  const [showActions, setShowActions] = useState(true);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Decisions Section */}
      <div className="glass-panel rounded-2xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-aurora-teal" />
            Decisions
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-surface-2 text-muted-foreground">
            {decisions.filter(d => d.status === 'confirmed').length} confirmed
          </span>
        </div>

        <div className="space-y-2">
          {decisions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No decisions captured yet
            </p>
          ) : (
            decisions.map((decision, index) => (
              <div
                key={decision.id}
                className={cn(
                  "p-3 rounded-xl bg-surface-1 border border-border/50",
                  "decision-captured"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "px-2 py-0.5 rounded-md text-[10px] font-medium border shrink-0 mt-0.5",
                      statusColors[decision.status]
                    )}
                  >
                    {decision.status}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground leading-relaxed">
                      {decision.content}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <User className="w-3 h-3" />
                      <span>{decision.owner}</span>
                      <span>•</span>
                      <Clock className="w-3 h-3" />
                      <span>
                        {new Date(decision.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <Button variant="ghost" size="sm" className="w-full mt-3">
          <Plus className="w-4 h-4 mr-2" />
          Capture Decision
        </Button>
      </div>

      {/* Action Items Section */}
      <div className="glass-panel rounded-2xl p-4">
        <button
          onClick={() => setShowActions(!showActions)}
          className="w-full flex items-center justify-between mb-4"
        >
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-aurora-violet" />
            Action Items
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-surface-2 text-muted-foreground">
              {actionItems.length}
            </span>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-muted-foreground transition-transform",
                showActions && "rotate-180"
              )}
            />
          </div>
        </button>

        {showActions && (
          <div className="space-y-2 fade-in">
            {actionItems.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No action items yet
              </p>
            ) : (
              actionItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-3 rounded-xl bg-surface-1 border border-border/50"
                >
                  <div
                    className={cn(
                      "px-2 py-0.5 rounded-md text-[10px] font-medium border shrink-0 mt-0.5",
                      priorityColors[item.priority]
                    )}
                  >
                    {item.priority}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{item.task}</p>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                      <User className="w-3 h-3" />
                      <span>{item.assignee}</span>
                      {item.deadline && (
                        <>
                          <span>•</span>
                          <Clock className="w-3 h-3" />
                          <span>
                            Due {new Date(item.deadline).toLocaleDateString()}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <Button variant="ghost" size="sm" className="w-full mt-3">
          <Plus className="w-4 h-4 mr-2" />
          Add Action Item
        </Button>
      </div>
    </div>
  );
}
