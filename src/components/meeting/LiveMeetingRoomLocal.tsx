import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useLocalMeeting, LocalParticipant } from "@/hooks/useLocalMeeting";
import { useMeetingAI } from "@/hooks/useMeetingAI";
import { useLiveTranscription } from "@/hooks/useLiveTranscription";
import { usePushToTalk } from "@/hooks/usePushToTalk";
import { AIParticipantCard } from "./AIParticipantCard";
import { MeetingControlsReal } from "./MeetingControlsReal";
import { ChatPanel } from "./ChatPanel";
import { DecisionCapture } from "./DecisionCapture";
import { ParticipantsList } from "./ParticipantsList";
import { InviteModal } from "./InviteModal";
import { LiveTranscript } from "./LiveTranscript";
import { AINudge } from "./AIInsightCard";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useMeetingChat } from "@/hooks/useMeetingChat";
import { Meeting } from "@/types/meeting";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Clock, 
  MessageSquare, 
  Target,
  X,
  LayoutGrid,
  User,
  Users,
  UserPlus,
  Mic,
  Radio
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface LiveMeetingRoomLocalProps {
  meeting: Meeting;
  userId: string;
  userName: string;
  isHost: boolean;
  localMeeting: ReturnType<typeof useLocalMeeting>;
  onEndMeeting: () => void;
  className?: string;
}

type LayoutMode = "grid" | "speaker" | "sidebar";
type SidePanel = "none" | "chat" | "decisions" | "participants" | "transcript";

export function LiveMeetingRoomLocal({
  meeting,
  userId,
  userName,
  isHost,
  localMeeting,
  onEndMeeting,
  className,
}: LiveMeetingRoomLocalProps) {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("speaker");
  const [activePanel, setActivePanel] = useState<SidePanel>("none");
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isAIEnabled, setIsAIEnabled] = useState(true);
  const [currentAgendaIndex, setCurrentAgendaIndex] = useState(0);
  const [showInvite, setShowInvite] = useState(false);
  const [aiNudge, setAiNudge] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(true);

  const localVideoRef = useRef<HTMLVideoElement>(null);

  const {
    participants,
    localParticipant,
    activeSpeakerId,
    isJoined,
    localStream,
    toggleMicrophone,
    toggleCamera,
    startScreenShare,
    leaveMeeting,
  } = localMeeting;

  // Attach local video stream
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // AI Assistant hook
  const meetingAI = useMeetingAI({
    isEnabled: isAIEnabled,
    participants,
    onDecisionDetected: (decision) => {
      console.log("Decision detected:", decision);
      setAiNudge(`Decision captured: "${decision.content.slice(0, 50)}..."`);
      setTimeout(() => setAiNudge(null), 5000);
    },
    onActionItemDetected: (action) => {
      console.log("Action detected:", action);
      setAiNudge(`Action item: ${action.task.slice(0, 50)}...`);
      setTimeout(() => setAiNudge(null), 5000);
    },
  });

  // Live transcription hook
  const transcription = useLiveTranscription({
    isEnabled: isTranscribing && isJoined,
    speakerName: userName,
    onTranscript: (entry) => {
      meetingAI.addToTranscript(entry.speaker, entry.text);
    },
  });

  // Push-to-talk hook
  const pushToTalk = usePushToTalk({
    isEnabled: isJoined,
    onActivate: () => {
      if (localParticipant?.isMuted) {
        toggleMicrophone();
        toast.info("Microphone activated", { duration: 1000 });
      }
    },
    onDeactivate: () => {
      if (localParticipant && !localParticipant.isMuted) {
        toggleMicrophone();
      }
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

  const currentAgendaItem = meeting.agenda?.[currentAgendaIndex];

  // Get active speaker
  const activeSpeaker = participants.find((p) => p.id === activeSpeakerId) || localParticipant;

  return (
    <div className={cn("h-screen bg-background flex flex-col overflow-hidden relative", className)}>
      {/* Ambient Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute -top-1/2 -left-1/4 w-[80%] h-[80%] rounded-full blur-[120px] bg-gradient-radial from-aurora-teal to-transparent opacity-[0.04]"
          style={{ animation: "ambient-float-1 25s ease-in-out infinite" }}
        />
        <div 
          className="absolute -bottom-1/4 -right-1/4 w-[70%] h-[70%] rounded-full blur-[100px] bg-gradient-radial from-aurora-violet to-transparent opacity-[0.04]"
          style={{ animation: "ambient-float-2 30s ease-in-out infinite" }}
        />
      </div>

      <style>{`
        @keyframes ambient-float-1 {
          0%, 100% { transform: translate(0%, 0%) rotate(0deg); }
          33% { transform: translate(5%, 3%) rotate(5deg); }
          66% { transform: translate(-3%, 5%) rotate(-3deg); }
        }
        @keyframes ambient-float-2 {
          0%, 100% { transform: translate(0%, 0%) rotate(0deg); }
          33% { transform: translate(-4%, -2%) rotate(-4deg); }
          66% { transform: translate(3%, -4%) rotate(3deg); }
        }
      `}</style>

      {/* Top Bar */}
      <div className="h-14 bg-surface-0/80 backdrop-blur-sm flex items-center justify-between px-6 border-b border-border/50 shrink-0 relative z-10">
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
          {currentAgendaItem && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-1 text-xs">
              <span className="text-primary font-medium">Now:</span>
              <span className="text-foreground">{currentAgendaItem.title}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span className="font-mono">{formatTime(elapsedTime)}</span>
          </div>

          <div className="hidden sm:flex items-center gap-1 border-l border-border/50 pl-3">
            <Button
              variant={layoutMode === "speaker" ? "secondary" : "ghost"}
              size="iconSm"
              onClick={() => setLayoutMode("speaker")}
            >
              <User className="w-4 h-4" />
            </Button>
            <Button
              variant={layoutMode === "grid" ? "secondary" : "ghost"}
              size="iconSm"
              onClick={() => setLayoutMode("grid")}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
          </div>

          <div className="border-l border-border/50 pl-3">
            <ThemeToggle />
          </div>

          <div className="flex items-center gap-1 border-l border-border/50 pl-3">
            <Button
              variant={activePanel === "participants" ? "secondary" : "ghost"}
              size="iconSm"
              onClick={() => togglePanel("participants")}
              className="relative"
            >
              <Users className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] rounded-full bg-surface-3 text-[10px] flex items-center justify-center text-foreground">
                {participants.length}
              </span>
            </Button>
            <Button
              variant={activePanel === "chat" ? "secondary" : "ghost"}
              size="iconSm"
              onClick={() => togglePanel("chat")}
            >
              <MessageSquare className="w-4 h-4" />
            </Button>
            <Button
              variant={activePanel === "decisions" ? "secondary" : "ghost"}
              size="iconSm"
              onClick={() => togglePanel("decisions")}
            >
              <Target className="w-4 h-4" />
            </Button>
            <Button
              variant={activePanel === "transcript" ? "secondary" : "ghost"}
              size="iconSm"
              onClick={() => togglePanel("transcript")}
              className="relative"
            >
              <Mic className="w-4 h-4" />
              {transcription.isListening && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-aurora-teal animate-pulse" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="iconSm"
              onClick={() => setShowInvite(true)}
            >
              <UserPlus className="w-4 h-4" />
            </Button>
            <Button
              variant={pushToTalk.isPTTMode ? "secondary" : "ghost"}
              size="iconSm"
              onClick={pushToTalk.togglePTTMode}
              title={pushToTalk.isPTTMode ? "Push-to-talk: ON" : "Push-to-talk: OFF"}
            >
              <Radio className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* AI Nudge */}
      <AnimatePresence>
        {aiNudge && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 z-20"
          >
            <AINudge 
              message={aiNudge} 
              type="decision" 
              onDismiss={() => setAiNudge(null)} 
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Push-to-talk indicator */}
      <AnimatePresence>
        {pushToTalk.isPTTMode && pushToTalk.isPressed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground shadow-glow-lg">
              <Mic className="w-5 h-5" />
              <span className="font-medium">Speaking...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Video Area */}
        <div className="flex-1 flex flex-col p-4 min-w-0">
          {/* Main Video Grid */}
          <div className="flex-1 min-h-0 grid gap-3" style={{
            gridTemplateColumns: layoutMode === "grid" 
              ? `repeat(${Math.min(Math.ceil(Math.sqrt(participants.length)), 3)}, 1fr)` 
              : "1fr",
            gridTemplateRows: layoutMode === "grid" 
              ? `repeat(${Math.ceil(participants.length / 3)}, 1fr)` 
              : "1fr",
          }}>
            {layoutMode === "speaker" ? (
              // Speaker view - show active speaker large
              <div className="relative rounded-2xl overflow-hidden bg-surface-1 border border-border/50">
                {localParticipant?.isVideoOn && localStream ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform -scale-x-100"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-surface-2 flex items-center justify-center">
                      <span className="text-4xl font-semibold text-foreground">
                        {userName.charAt(0)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Speaking indicator */}
                {localParticipant?.isSpeaking && (
                  <div className="absolute inset-0 border-2 border-primary rounded-2xl pointer-events-none animate-pulse" />
                )}

                {/* Name badge */}
                <div className="absolute bottom-4 left-4 glass-panel rounded-lg px-3 py-1.5">
                  <div className="flex items-center gap-2">
                    {localParticipant?.isMuted && <Mic className="w-3 h-3 text-destructive" />}
                    <span className="text-sm font-medium text-foreground">{userName}</span>
                    <span className="text-xs text-muted-foreground">(You)</span>
                  </div>
                </div>
              </div>
            ) : (
              // Grid view - show all participants
              participants.map((participant) => (
                <div 
                  key={participant.id}
                  className={cn(
                    "relative rounded-xl overflow-hidden bg-surface-1 border border-border/50",
                    participant.isSpeaking && "ring-2 ring-primary"
                  )}
                >
                  {participant.isLocal && participant.isVideoOn && localStream ? (
                    <video
                      ref={participant.isLocal ? localVideoRef : undefined}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover transform -scale-x-100"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-surface-1 to-surface-2">
                      <div className="w-16 h-16 rounded-full bg-surface-3 flex items-center justify-center">
                        <span className="text-2xl font-semibold text-foreground">
                          {participant.userName.charAt(0)}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="absolute bottom-2 left-2 glass-panel rounded-lg px-2 py-1">
                    <div className="flex items-center gap-1.5">
                      {participant.isMuted && <Mic className="w-3 h-3 text-destructive" />}
                      <span className="text-xs font-medium text-foreground">
                        {participant.userName}
                        {participant.isLocal && " (You)"}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* AI Participant Card */}
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
          <motion.div 
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-80 border-l border-border/50 flex flex-col bg-surface-0/50 backdrop-blur-sm"
          >
            {activePanel === "participants" && (
              <ParticipantsList
                participants={participants}
                meetingId={meeting.id}
                meetingTitle={meeting.title}
                isHost={isHost}
                isAIEnabled={isAIEnabled}
                onClose={() => setActivePanel("none")}
              />
            )}
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
            {activePanel === "transcript" && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between p-3 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <Mic className="w-4 h-4 text-primary" />
                    <span className="font-medium text-foreground">Live Transcript</span>
                  </div>
                  <Button variant="ghost" size="iconSm" onClick={() => setActivePanel("none")}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <LiveTranscript
                  transcripts={transcription.transcripts}
                  interimText={transcription.interimText}
                  currentSpeaker={userName}
                  isAIProcessing={meetingAI.isProcessing}
                  className="flex-1"
                />
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Invite Modal */}
      <InviteModal
        isOpen={showInvite}
        onClose={() => setShowInvite(false)}
        meetingId={meeting.id}
        meetingTitle={meeting.title}
      />

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
