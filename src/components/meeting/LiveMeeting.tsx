import { cn } from "@/lib/utils";
import { MeetingState, Participant, AIMode } from "@/types/meeting";
import { SpeakerView } from "./SpeakerView";
import { MeetingControls } from "./MeetingControls";
import { AIAgent } from "./AIAgent";
import { AgendaTimeline } from "./AgendaTimeline";
import { DecisionCapture } from "./DecisionCapture";
import { ChatPanel } from "./ChatPanel";
import { BreakoutRooms } from "./BreakoutRooms";
import { Whiteboard } from "./Whiteboard";
import { useMeetingChat } from "@/hooks/useMeetingChat";
import { useBreakoutRooms } from "@/hooks/useBreakoutRooms";
import { useWhiteboard } from "@/hooks/useWhiteboard";
import { useState } from "react";
import { Clock, MessageSquare, Users, PenTool } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LiveMeetingProps {
  state: MeetingState;
  currentUser: Participant;
  onEndMeeting: () => void;
  className?: string;
}

type SidePanel = "none" | "chat" | "breakout" | "whiteboard";

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
  const [activePanel, setActivePanel] = useState<SidePanel>("none");
  const [showWhiteboard, setShowWhiteboard] = useState(false);

  const { messages, sendMessage, addReaction } = useMeetingChat();
  const { rooms, unassignedParticipants, createRoom, deleteRoom, assignParticipant } = useBreakoutRooms();
  const { annotations, addAnnotation, undo, clear } = useWhiteboard();

  const activeSpeaker = state.meeting.participants.find((p) => p.isSpeaking) || 
    state.meeting.participants[0];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const togglePanel = (panel: SidePanel) => {
    setActivePanel((prev) => (prev === panel ? "none" : panel));
  };

  if (showWhiteboard) {
    return (
      <div className={cn("h-screen bg-background", className)}>
        <Whiteboard
          annotations={annotations}
          onAddAnnotation={addAnnotation}
          onClear={clear}
          onUndo={undo}
          onClose={() => setShowWhiteboard(false)}
        />
      </div>
    );
  }

  return (
    <div className={cn("h-screen bg-background flex flex-col", className)}>
      {/* Minimal Top Bar */}
      <div className="h-12 bg-surface-0/80 backdrop-blur-sm flex items-center justify-between px-6 border-b border-border/50">
        <div className="flex items-center gap-4">
          <h1 className="text-sm font-medium text-foreground">{state.meeting.title}</h1>
          <div className="flex items-center gap-1.5 text-xs text-aurora-rose">
            <div className="w-1.5 h-1.5 rounded-full bg-aurora-rose animate-pulse" />
            Live
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Timer */}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span className="font-mono">{formatTime(state.elapsedTime)}</span>
          </div>

          {/* Recording Badge */}
          {isRecording && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-xs">
              <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              REC
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex items-center gap-1 ml-2">
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
              variant={activePanel === "breakout" ? "secondary" : "ghost"}
              size="iconSm"
              onClick={() => togglePanel("breakout")}
            >
              <Users className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="iconSm"
              onClick={() => setShowWhiteboard(true)}
            >
              <PenTool className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Left Sidebar - Compact Agenda & AI */}
        <div className="hidden lg:flex w-72 flex-col border-r border-border/50 bg-surface-0/50">
          <div className="flex-1 overflow-y-auto p-4">
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
        </div>

        {/* Center - Main View */}
        <div className="flex-1 flex flex-col p-4 min-w-0">
          <SpeakerView
            activeSpeaker={activeSpeaker}
            participants={state.meeting.participants}
            className="flex-1"
          />

          {/* Captions */}
          {isCaptionsOn && (
            <div className="mt-3 bg-surface-1/80 backdrop-blur-sm rounded-xl p-3 text-center fade-in">
              <p className="text-sm text-foreground">
                <span className="text-primary font-medium">Sarah Chen: </span>
                "I think we should prioritize the API integration before moving to the new dashboard..."
              </p>
            </div>
          )}
        </div>

        {/* Right Sidebar - Decisions or Dynamic Panel */}
        {activePanel === "none" ? (
          <div className="hidden lg:block w-72 border-l border-border/50 bg-surface-0/50 overflow-y-auto p-4">
            <DecisionCapture
              decisions={state.meeting.decisions}
              actionItems={state.meeting.actionItems}
            />
          </div>
        ) : (
          <div className="w-80 border-l border-border/50 flex flex-col">
            {activePanel === "chat" && (
              <ChatPanel
                messages={messages}
                onSendMessage={sendMessage}
                onAddReaction={addReaction}
                onClose={() => setActivePanel("none")}
              />
            )}
            {activePanel === "breakout" && (
              <BreakoutRooms
                rooms={rooms}
                unassignedParticipants={unassignedParticipants}
                onCreateRoom={createRoom}
                onDeleteRoom={deleteRoom}
                onAssignParticipant={assignParticipant}
                onClose={() => setActivePanel("none")}
              />
            )}
          </div>
        )}
      </div>

      {/* Bottom Controls - Floating Style */}
      <div className="py-4 flex items-center justify-center">
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
          onOpenChat={() => togglePanel("chat")}
          onOpenParticipants={() => togglePanel("breakout")}
          onEndCall={onEndMeeting}
        />
      </div>
    </div>
  );
}
