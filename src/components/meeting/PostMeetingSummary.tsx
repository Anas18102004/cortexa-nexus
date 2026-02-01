import { cn } from "@/lib/utils";
import { Meeting } from "@/types/meeting";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Clock,
  Users,
  Download,
  Share2,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  Target,
} from "lucide-react";

interface PostMeetingSummaryProps {
  meeting: Meeting;
  duration: number;
  onClose: () => void;
  className?: string;
}

export function PostMeetingSummary({
  meeting,
  duration,
  onClose,
  className,
}: PostMeetingSummaryProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const hrs = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    if (hrs > 0) return `${hrs}h ${remainingMins}m`;
    return `${mins}m`;
  };

  const confirmedDecisions = meeting.decisions.filter((d) => d.status === "confirmed");
  const highPriorityActions = meeting.actionItems.filter((a) => a.priority === "high");

  return (
    <div className={cn("min-h-screen bg-background flex items-center justify-center p-6", className)}>
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8 fade-in">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-1">Meeting Complete</h1>
          <p className="text-muted-foreground">{meeting.title}</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { icon: Clock, label: "Duration", value: formatDuration(duration) },
            { icon: Users, label: "Participants", value: meeting.participants.length },
            { icon: Target, label: "Decisions", value: confirmedDecisions.length },
          ].map((stat) => (
            <div key={stat.label} className="glass-panel rounded-xl p-4 text-center fade-in">
              <stat.icon className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
              <p className="text-xl font-semibold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* AI Summary */}
        <div className="glass-panel rounded-2xl p-5 mb-6 fade-in">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">AI Summary</span>
          </div>
          <p className="text-sm text-foreground/90 leading-relaxed mb-4">
            The team aligned on Q1 priorities with a focus on API integration and 
            dashboard improvements. Key decisions were made regarding resource allocation.
          </p>

          {/* Key Points */}
          <div className="space-y-2">
            {confirmedDecisions.slice(0, 2).map((decision) => (
              <div key={decision.id} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <p className="text-sm text-foreground">{decision.content}</p>
              </div>
            ))}
            {highPriorityActions.length > 0 && (
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-aurora-rose mt-0.5 shrink-0" />
                <p className="text-sm text-foreground">
                  {highPriorityActions.length} high-priority action{highPriorityActions.length > 1 ? "s" : ""} assigned
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Items */}
        {meeting.actionItems.length > 0 && (
          <div className="glass-panel rounded-2xl p-5 mb-6 fade-in">
            <span className="text-sm font-medium text-foreground mb-3 block">
              Action Items ({meeting.actionItems.length})
            </span>
            <div className="space-y-2">
              {meeting.actionItems.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg bg-surface-1 border-l-2",
                    item.priority === "high" && "border-aurora-rose",
                    item.priority === "medium" && "border-aurora-violet",
                    item.priority === "low" && "border-muted-foreground"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{item.task}</p>
                    <p className="text-xs text-muted-foreground">{item.assignee}</p>
                  </div>
                  {item.deadline && (
                    <span className="text-xs text-muted-foreground ml-3">
                      {new Date(item.deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-center gap-3 fade-in">
          <Button variant="outline" size="default">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" size="default">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="aurora" size="default" onClick={onClose}>
            Done
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
