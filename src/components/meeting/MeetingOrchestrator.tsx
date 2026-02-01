import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Meeting, Participant, MeetingState } from "@/types/meeting";
import { PreJoinLobby } from "./PreJoinLobbyReal";
import { LiveMeetingRoomLocal } from "./LiveMeetingRoomLocal";
import { PostMeetingSummary } from "./PostMeetingSummary";
import { MeetingErrorState } from "./MeetingStates";
import { useLocalMeeting } from "@/hooks/useLocalMeeting";
import { useMeetingAI } from "@/hooks/useMeetingAI";

type MeetingPhase = "lobby" | "live" | "ended" | "error";

interface MeetingOrchestratorProps {
  meeting: Meeting;
  currentUser: Participant;
  className?: string;
}

export function MeetingOrchestrator({
  meeting,
  currentUser,
  className,
}: MeetingOrchestratorProps) {
  const [phase, setPhase] = useState<MeetingPhase>("lobby");
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [meetingError, setMeetingError] = useState<string | null>(null);

  // Local meeting integration (no external provider needed)
  const localMeeting = useLocalMeeting({
    meetingId: meeting.id,
    userId: currentUser.id,
    userName: currentUser.name,
    isHost: currentUser.isHost,
    onMeetingJoined: () => {
      console.log("Successfully joined meeting");
      setPhase("live");
      setMeetingError(null);
    },
    onMeetingLeft: () => {
      console.log("Left meeting");
      // Only go to ended if we were actually in a live meeting
      if (phase === "live") {
        setPhase("ended");
      }
    },
    onError: (err) => {
      console.error("Meeting error:", err);
      const errorMessage = err.message || "Failed to join meeting";
      
      if (errorMessage.includes("Permission denied") || errorMessage.includes("NotAllowedError")) {
        setMeetingError("Camera and microphone access is required. Please allow access in your browser and try again.");
      } else if (errorMessage.includes("NotFoundError")) {
        setMeetingError("No camera or microphone found. Please connect a device and try again.");
      } else {
        setMeetingError(errorMessage);
      }
      setPhase("error");
    },
  });

  // AI assistant
  const meetingAI = useMeetingAI({
    isEnabled: phase === "live",
    participants: localMeeting.participants,
  });

  const handleJoinMeeting = useCallback(async (audio: boolean, video: boolean) => {
    setAudioEnabled(audio);
    setVideoEnabled(video);
    setMeetingError(null);
    await localMeeting.joinMeeting();
  }, [localMeeting]);

  const handleEndMeeting = useCallback(async () => {
    await localMeeting.leaveMeeting();
    setPhase("ended");
  }, [localMeeting]);

  const handleRejoin = useCallback(() => {
    setPhase("lobby");
    setMeetingError(null);
    meetingAI.reset();
  }, [meetingAI]);

  const handleRetry = useCallback(() => {
    setPhase("lobby");
    setMeetingError(null);
  }, []);

  // Build meeting state for summary
  const buildMeetingState = (): MeetingState => ({
    meeting: {
      ...meeting,
      decisions: meetingAI.decisions,
      actionItems: meetingAI.actionItems,
      aiInsights: meetingAI.insights,
      status: "ended",
    },
    currentAgendaIndex: 0,
    elapsedTime: 0,
    aiMode: "assist",
    isCaptionsEnabled: false,
    isRecording: false,
    uiMode: "review",
  });

  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {phase === "lobby" && (
        <PreJoinLobby
          meetingTitle={meeting.title}
          currentUser={currentUser}
          onJoinMeeting={handleJoinMeeting}
          isJoining={localMeeting.isJoining}
        />
      )}

      {phase === "live" && (
        <LiveMeetingRoomLocal
          meeting={meeting}
          userId={currentUser.id}
          userName={currentUser.name}
          isHost={currentUser.isHost}
          localMeeting={localMeeting}
          onEndMeeting={handleEndMeeting}
        />
      )}

      {phase === "error" && (
        <MeetingErrorState
          error={meetingError || "An unexpected error occurred"}
          onRetry={handleRetry}
        />
      )}

      {phase === "ended" && (
        <PostMeetingSummary
          meeting={buildMeetingState().meeting}
          duration={0}
          onClose={handleRejoin}
        />
      )}
    </div>
  );
}

