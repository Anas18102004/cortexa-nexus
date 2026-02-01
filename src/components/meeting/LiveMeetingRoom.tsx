import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useDailyMeeting, MeetingParticipant } from "@/hooks/useDailyMeeting";
import { useMeetingAI } from "@/hooks/useMeetingAI";
import { MeetingGrid } from "./MeetingGrid";
import { AIParticipantCard } from "./AIParticipantCard";
import { MeetingControlsReal } from "./MeetingControlsReal";
import { ChatPanel } from "./ChatPanel";
import { DecisionCapture } from "./DecisionCapture";
import { useMeetingChat } from "@/hooks/useMeetingChat";
import { Meeting, Decision, ActionItem, AgendaItem } from "@/types/meeting";
import { 
  Clock, 
  MessageSquare, 
  Target,
  X,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  User,
  Maximize2
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface LiveMeetingRoomProps {
  meeting: Meeting;
  userId: string;
  userName: string;
  isHost: boolean;
  onEndMeeting: () => void;
  className?: string;
}

type LayoutMode = "grid" | "speaker" | "sidebar";
type SidePanel = "none" | "chat" | "decisions";

export function LiveMeetingRoom({
  meeting,
  userId,
  userName,
  isHost,
  onEndMeeting,
  className,
}: LiveMeetingRoomProps) {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("speaker");
  const [activePanel, setActivePanel] = useState<SidePanel>("none");
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isAIEnabled, setIsAIEnabled] = useState(true);
  const [currentAgendaIndex, setCurrentAgendaIndex] = useState(0);

  // Daily.co meeting hook
  const {
    participants,
    localParticipant,
    activeSpeakerId,
    isJoined,
    error,
    leaveMeeting,
    toggleMicrophone,
    toggleCamera,
    startScreenShare,
    stopScreenShare,
  } = useDailyMeeting({
    meetingId: meeting.id,
    userId,
    userName,
    isHost,
    onMeetingJoined: () => console.log("Meeting joined!"),
    onMeetingLeft: () => {
      console.log("Meeting left");
      onEndMeeting();
    },
    onError: (err) => console.error("Meeting error:", err),
  });

  // AI Assistant hook
  const meetingAI = useMeetingAI({
    isEnabled: isAIEnabled,
    participants,
    onDecisionDetected: (decision) => {
      console.log("Decision detected:", decision);
    },
    onActionItemDetected: (action) => {
      console.log("Action detected:", action);
    },
  });

  // Chat hook
  const { messages, sendMessage, addReaction } = useMeetingChat();

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const togglePanel = (panel: SidePanel) => {
    setActivePanel((prev) => (prev === panel ? "none" : panel));
  };

  const handleEndCall = async () => {
    await leaveMeeting();
    onEndMeeting();
  };

  // Current agenda item
  const currentAgendaItem = meeting.agenda?.[currentAgendaIndex];

  return (
    <div className={cn("h-screen bg-background flex flex-col overflow-hidden", className)}>
      {/* Top Bar */}
      <div className="h-14 bg-surface-0/80 backdrop-blur-sm flex items-center justify-between px-6 border-b border-border/50 shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-sm font-medium text-foreground">{meeting.title}</h1>
          <div className="flex items-center gap-1.5 text-xs text-aurora-rose">
            <div className="w-1.5 h-1.5 rounded-full bg-aurora-rose animate-pulse" />
            Live
          </div>
          <span className="text-xs text-muted-foreground">
            {participants.length} participant{participants.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Now / Next Indicator */}
          {currentAgendaItem && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-1 text-xs">
              <span className="text-primary font-medium">Now:</span>
              <span className="text-foreground">{currentAgendaItem.title}</span>
              {meeting.agenda?.[currentAgendaIndex + 1] && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">
                    Next: {meeting.agenda[currentAgendaIndex + 1].title}
                  </span>
                </>
              )}
            </div>
          )}

          {/* Timer */}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span className="font-mono">{formatTime(elapsedTime)}</span>
          </div>

          {/* Layout Toggle */}
          <div className="hidden sm:flex items-center gap-1 border-l border-border/50 pl-3">
            <Button
              variant={layoutMode === "speaker" ? "secondary" : "ghost"}
              size="iconSm"
              onClick={() => setLayoutMode("speaker")}
              title="Speaker View"
            >
              <User className="w-4 h-4" />
            </Button>
            <Button
              variant={layoutMode === "grid" ? "secondary" : "ghost"}
              size="iconSm"
              onClick={() => setLayoutMode("grid")}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
          </div>

          {/* Panel Toggles */}
          <div className="flex items-center gap-1 border-l border-border/50 pl-3">
            <Button
              variant={activePanel === "chat" ? "secondary" : "ghost"}
              size="iconSm"
              onClick={() => togglePanel("chat")}
              className="relative"
            >
              <MessageSquare className="w-4 h-4" />
              {messages.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary" />
              )}
            </Button>
            <Button
              variant={activePanel === "decisions" ? "secondary" : "ghost"}
              size="iconSm"
              onClick={() => togglePanel("decisions")}
            >
              <Target className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Video Area */}
        <div className="flex-1 flex flex-col p-4 min-w-0">
          {/* Main Grid */}
          <div className="flex-1 min-h-0">
            <MeetingGrid
              participants={participants}
              activeSpeakerId={activeSpeakerId}
              layout={layoutMode}
              className="h-full"
            />
          </div>

          {/* AI Participant Card (if enabled) */}
          {isAIEnabled && (
            <div className="mt-3">
              <AIParticipantCard
                isListening={isJoined}
                isProcessing={meetingAI.isProcessing}
                lastInsight={meetingAI.insights[meetingAI.insights.length - 1]?.content}
              />
            </div>
          )}
        </div>

        {/* Side Panel */}
        {activePanel !== "none" && (
          <div className="w-80 border-l border-border/50 flex flex-col animate-slide-in-right">
            {activePanel === "chat" && (
              <ChatPanel
                messages={messages}
                onSendMessage={sendMessage}
                onAddReaction={addReaction}
                onClose={() => setActivePanel("none")}
              />
            )}
            {activePanel === "decisions" && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-border/50">
                  <span className="font-medium text-foreground">Decisions & Actions</span>
                  <Button variant="ghost" size="iconSm" onClick={() => setActivePanel("none")}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <DecisionCapture
                    decisions={meetingAI.decisions}
                    actionItems={meetingAI.actionItems}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="py-4 flex items-center justify-center shrink-0">
        <MeetingControlsReal
          isMuted={localParticipant?.isMuted ?? true}
          isVideoOn={localParticipant?.isVideoOn ?? false}
          isAIEnabled={isAIEnabled}
          participantCount={participants.length}
          onToggleMute={toggleMicrophone}
          onToggleVideo={toggleCamera}
          onToggleAI={() => setIsAIEnabled(!isAIEnabled)}
          onStartScreenShare={startScreenShare}
          onEndCall={handleEndCall}
        />
      </div>
    </div>
  );
}
