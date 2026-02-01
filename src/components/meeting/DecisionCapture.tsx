import { cn } from "@/lib/utils";
import { Decision, ActionItem } from "@/types/meeting";
import { CheckCircle2, AlertCircle, Clock, User } from "lucide-react";

interface DecisionCaptureProps {
  decisions: Decision[];
  actionItems: ActionItem[];
  className?: string;
}

export function DecisionCapture({ decisions, actionItems, className }: DecisionCaptureProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Decisions */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Decisions</span>
          <span className="text-xs text-muted-foreground ml-auto">
            {decisions.filter((d) => d.status === "confirmed").length} confirmed
          </span>
        </div>

        <div className="space-y-2">
          {decisions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No decisions yet
            </p>
          ) : (
            decisions.map((decision) => (
              <div
                key={decision.id}
                className={cn(
                  "p-3 rounded-xl bg-surface-1 border-l-2",
                  decision.status === "confirmed" && "border-l-primary",
                  decision.status === "proposed" && "border-l-aurora-cyan",
                  decision.status === "deferred" && "border-l-muted-foreground"
                )}
              >
                <p className="text-sm text-foreground mb-2">{decision.content}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <User className="w-3 h-3" />
                  <span>{decision.owner}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Action Items */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="w-4 h-4 text-secondary" />
          <span className="text-sm font-medium text-foreground">Actions</span>
          <span className="text-xs text-muted-foreground ml-auto">
            {actionItems.length} items
          </span>
        </div>

        <div className="space-y-2">
          {actionItems.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No action items
            </p>
          ) : (
            actionItems.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "p-3 rounded-xl bg-surface-1 border-l-2",
                  item.priority === "high" && "border-l-aurora-rose",
                  item.priority === "medium" && "border-l-secondary",
                  item.priority === "low" && "border-l-muted-foreground"
                )}
              >
                <p className="text-sm text-foreground mb-2">{item.task}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {item.assignee}
                  </span>
                  {item.deadline && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(item.deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
