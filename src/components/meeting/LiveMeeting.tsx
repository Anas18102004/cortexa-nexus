import { cn } from "@/lib/utils";
import { MeetingState, Participant, AIMode } from "@/types/meeting";
import { SpeakerView } from "./SpeakerView";
import { MeetingControls } from "./MeetingControls";
import { AIAgent } from "./AIAgent";
import { AgendaTimeline } from "./AgendaTimeline";
import { DecisionCapture } from "./DecisionCapture";
import { useState } from "react";
import { Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LiveMeetingProps {
  state: MeetingState;
  currentUser: Participant;
  onEndMeeting: () => void;
  className?: string;
}

export function LiveMeeting({
  state,
  currentUser,
  onEndMeeting,
  className,
}: LiveMeetingProps) {
  const [isMuted, setIsMuted] = useState(currentUser.isMuted);
  const [isVideoOn, setIsVideoOn] = useState(currentUser.isVideoOn);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isCaptionsOn, setIsCaptionsOn] = useState(state.isCaptionsEnabled);
  const [isRecording, setIsRecording] = useState(state.isRecording);
  const [aiMode, setAiMode] = useState<AIMode>(state.aiMode);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);

  const activeSpeaker = state.meeting.participants.find((p) => p.isSpeaking) || 
    state.meeting.participants[0];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className={cn("h-screen bg-background flex flex-col", className)}>
      {/* Top Bar */}
      <div className="h-14 border-b border-border bg-surface-0 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <h1 className="font-semibold text-foreground">{state.meeting.title}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-aurora-rose animate-pulse" />
            <span>Live</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Timer */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="font-mono text-sm text-foreground">
              {formatTime(state.elapsedTime)}
            </span>
          </div>

          {/* Recording Indicator */}
          {isRecording && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive">
              <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
              <span className="text-sm font-medium">Recording</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Left Panel - Agenda & AI (Collapsible on mobile) */}
        <div className="hidden lg:block w-80 border-r border-border bg-surface-0 p-4 overflow-y-auto">
          <AgendaTimeline
            items={state.meeting.agenda}
            currentIndex={state.currentAgendaIndex}
            className="mb-6"
          />
          <AIAgent
            mode={aiMode}
            onModeChange={setAiMode}
            insights={state.meeting.aiInsights}
            isThinking={false}
          />
        </div>

        {/* Center - Speaker View */}
        <div className="flex-1 flex flex-col p-4 min-w-0">
          <SpeakerView
            activeSpeaker={activeSpeaker}
            participants={state.meeting.participants}
            className="flex-1"
          />

          {/* Captions Area */}
          {isCaptionsOn && (
            <div className="mt-4 glass-panel rounded-xl p-4 text-center fade-in">
              <p className="text-foreground">
                <span className="text-aurora-teal font-medium">Sarah Chen: </span>
                "I think we should prioritize the API integration before moving to the new dashboard..."
              </p>
            </div>
          )}
        </div>

        {/* Right Panel - Decisions & Actions */}
        <div
          className={cn(
            "border-l border-border bg-surface-0 transition-all duration-300 overflow-hidden",
            rightPanelCollapsed ? "w-0" : "w-80"
          )}
        >
          <div className="w-80 h-full p-4 overflow-y-auto">
            <DecisionCapture
              decisions={state.meeting.decisions}
              actionItems={state.meeting.actionItems}
            />
          </div>
        </div>

        {/* Panel Toggle */}
        <Button
          variant="ghost"
          size="iconSm"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden lg:flex"
          onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
        >
          {rightPanelCollapsed ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Bottom Controls */}
      <div className="h-20 border-t border-border bg-surface-0 flex items-center justify-center px-4">
        <MeetingControls
          isMuted={isMuted}
          isVideoOn={isVideoOn}
          isScreenSharing={isScreenSharing}
          isHandRaised={isHandRaised}
          isCaptionsOn={isCaptionsOn}
          isRecording={isRecording}
          participantCount={state.meeting.participants.length}
          onToggleMute={() => setIsMuted(!isMuted)}
          onToggleVideo={() => setIsVideoOn(!isVideoOn)}
          onToggleScreenShare={() => setIsScreenSharing(!isScreenSharing)}
          onToggleHand={() => setIsHandRaised(!isHandRaised)}
          onToggleCaptions={() => setIsCaptionsOn(!isCaptionsOn)}
          onToggleRecording={() => setIsRecording(!isRecording)}
          onOpenChat={() => {}}
          onOpenParticipants={() => {}}
          onEndCall={onEndMeeting}
        />
      </div>
    </div>
  );
}
