import { cn } from "@/lib/utils";
import { AgendaItem } from "@/types/meeting";
import { Check, Clock, Play, Sparkles } from "lucide-react";

interface AgendaTimelineProps {
  items: AgendaItem[];
  currentIndex: number;
  className?: string;
}

export function AgendaTimeline({ items, currentIndex, className }: AgendaTimelineProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between px-1 mb-3">
        <h3 className="text-sm font-medium text-foreground">Agenda</h3>
        <span className="text-xs text-muted-foreground">
          {currentIndex + 1}/{items.length}
        </span>
      </div>

      <div className="space-y-1">
        {items.map((item, index) => {
          const isActive = index === currentIndex;
          const isCompleted = item.status === "completed";
          const isPending = item.status === "pending";

          return (
            <div
              key={item.id}
              className={cn(
                "relative flex items-center gap-3 p-3 rounded-xl transition-all duration-300",
                isActive && "bg-primary/10 shadow-glow-sm",
                isCompleted && "opacity-60",
                !isActive && !isCompleted && "hover:bg-surface-2"
              )}
            >
              {/* Status Indicator */}
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all",
                  isCompleted && "bg-aurora-teal/20 text-aurora-teal",
                  isActive && "bg-primary text-primary-foreground",
                  isPending && "bg-surface-3 text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : isActive ? (
                  <Play className="w-4 h-4" />
                ) : (
                  <span className="text-xs font-medium">{index + 1}</span>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p
                    className={cn(
                      "text-sm font-medium truncate",
                      isActive && "text-primary",
                      isCompleted && "text-muted-foreground line-through",
                      isPending && "text-foreground"
                    )}
                  >
                    {item.title}
                  </p>
                  {item.aiSuggested && (
                    <Sparkles className="w-3 h-3 text-aurora-violet shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground">
                    {item.owner}
                  </span>
                  <span className="text-muted-foreground/50">•</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {item.duration}m
                  </span>
                </div>
              </div>

              {/* Active Indicator Line */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-8 bg-primary rounded-full" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
