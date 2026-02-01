import { cn } from "@/lib/utils";
import { Meeting } from "@/types/meeting";
import { Button } from "@/components/ui/button";
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Users,
  Brain,
  Download,
  Share2,
  ArrowRight,
  Sparkles,
  AlertTriangle,
} from "lucide-react";

interface PostMeetingSummaryProps {
  meeting: Meeting;
  duration: number; // in seconds
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
    if (hrs > 0) {
      return `${hrs}h ${remainingMins}m`;
    }
    return `${mins}m`;
  };

  const confirmedDecisions = meeting.decisions.filter(
    (d) => d.status === "confirmed"
  );
  const highPriorityActions = meeting.actionItems.filter(
    (a) => a.priority === "high"
  );

  return (
    <div className={cn("min-h-screen bg-background p-8", className)}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 fade-in">
          <div className="w-16 h-16 rounded-full bg-aurora-teal/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-aurora-teal" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Meeting Complete
          </h1>
          <p className="text-lg text-muted-foreground">{meeting.title}</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mb-10">
          {[
            {
              icon: Clock,
              label: "Duration",
              value: formatDuration(duration),
              color: "text-aurora-cyan",
            },
            {
              icon: Users,
              label: "Participants",
              value: meeting.participants.length.toString(),
              color: "text-aurora-violet",
            },
            {
              icon: CheckCircle2,
              label: "Decisions",
              value: confirmedDecisions.length.toString(),
              color: "text-aurora-teal",
            },
            {
              icon: AlertCircle,
              label: "Action Items",
              value: meeting.actionItems.length.toString(),
              color: "text-aurora-rose",
            },
          ].map((stat, index) => (
            <div
              key={stat.label}
              className="glass-panel rounded-2xl p-4 text-center fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <stat.icon className={cn("w-6 h-6 mx-auto mb-2", stat.color)} />
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* AI Executive Summary */}
        <div className="glass-panel rounded-2xl p-6 mb-8 gradient-border fade-in">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-aurora-teal" />
            <h2 className="text-lg font-semibold text-foreground">
              AI Executive Summary
            </h2>
          </div>
          <p className="text-foreground leading-relaxed mb-6">
            The team aligned on Q1 priorities with a focus on API integration and 
            dashboard improvements. Key decisions were made regarding resource 
            allocation and timeline adjustments. Three high-priority action items 
            were assigned with clear ownership and deadlines.
          </p>

          {/* Key Takeaways */}
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-1">
              <div className="w-6 h-6 rounded-full bg-aurora-teal/20 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-aurora-teal" />
              </div>
              <p className="text-sm text-foreground">
                API integration prioritized for February release
              </p>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-1">
              <div className="w-6 h-6 rounded-full bg-aurora-teal/20 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-aurora-teal" />
              </div>
              <p className="text-sm text-foreground">
                Two engineers allocated to Platform team support
              </p>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-1">
              <div className="w-6 h-6 rounded-full bg-aurora-rose/20 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-3.5 h-3.5 text-aurora-rose" />
              </div>
              <p className="text-sm text-foreground">
                Risk: Timeline dependency on external vendor delivery
              </p>
            </div>
          </div>
        </div>

        {/* Decisions & Actions Grid */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Decisions */}
          <div className="glass-panel rounded-2xl p-6 fade-in">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-5 h-5 text-aurora-teal" />
              <h2 className="text-lg font-semibold text-foreground">
                Decisions Made
              </h2>
            </div>
            <div className="space-y-3">
              {confirmedDecisions.map((decision) => (
                <div
                  key={decision.id}
                  className="p-3 rounded-xl bg-surface-1 border-l-2 border-aurora-teal"
                >
                  <p className="text-sm text-foreground">{decision.content}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Owned by {decision.owner}
                  </p>
                </div>
              ))}
              {confirmedDecisions.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No decisions were confirmed in this meeting.
                </p>
              )}
            </div>
          </div>

          {/* Action Items */}
          <div className="glass-panel rounded-2xl p-6 fade-in">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-aurora-violet" />
              <h2 className="text-lg font-semibold text-foreground">
                Action Items
              </h2>
            </div>
            <div className="space-y-3">
              {meeting.actionItems.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "p-3 rounded-xl bg-surface-1 border-l-2",
                    item.priority === "high" && "border-aurora-rose",
                    item.priority === "medium" && "border-aurora-violet",
                    item.priority === "low" && "border-muted-foreground"
                  )}
                >
                  <p className="text-sm text-foreground">{item.task}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span>{item.assignee}</span>
                    {item.deadline && (
                      <>
                        <span>•</span>
                        <span>Due {new Date(item.deadline).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
              {meeting.actionItems.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No action items were created in this meeting.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-4 fade-in">
          <Button variant="outline" size="lg">
            <Download className="w-4 h-4 mr-2" />
            Download Summary
          </Button>
          <Button variant="outline" size="lg">
            <Share2 className="w-4 h-4 mr-2" />
            Share with Team
          </Button>
          <Button variant="aurora" size="lg" onClick={onClose}>
            Close
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Knowledge Node */}
        <div className="mt-12 text-center">
          <div className="glass-panel rounded-xl p-4 inline-flex items-center gap-3">
            <Brain className="w-5 h-5 text-aurora-cyan" />
            <p className="text-sm text-muted-foreground">
              This meeting has been indexed to{" "}
              <span className="text-aurora-cyan font-medium">
                Cortexa Knowledge
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
