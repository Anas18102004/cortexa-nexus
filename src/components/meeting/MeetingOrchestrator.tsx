import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Meeting, Participant, MeetingState } from "@/types/meeting";
import { PreJoinLobby } from "./PreJoinLobbyReal";
import { LiveMeetingRoom } from "./LiveMeetingRoom";
import { PostMeetingSummary } from "./PostMeetingSummary";
import { MeetingErrorState } from "./MeetingStates";
import { useDailyMeeting } from "@/hooks/useDailyMeeting";
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

  // Daily.co meeting integration
  const dailyMeeting = useDailyMeeting({
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
      
      // Check for specific Daily.co errors
      if (errorMessage.includes("account-missing-payment-method")) {
        setMeetingError("Daily.co account requires a payment method. Please configure billing in your Daily.co dashboard or use a different video provider.");
      } else if (errorMessage.includes("exp-room")) {
        setMeetingError("This meeting room has expired. Please create a new meeting.");
      } else if (errorMessage.includes("nbf-room")) {
        setMeetingError("This meeting has not started yet. Please wait for the host.");
      } else {
        setMeetingError(errorMessage);
      }
      setPhase("error");
    },
  });

  // AI assistant
  const meetingAI = useMeetingAI({
    isEnabled: phase === "live",
    participants: dailyMeeting.participants,
  });

  const handleJoinMeeting = useCallback(async (audio: boolean, video: boolean) => {
    setAudioEnabled(audio);
    setVideoEnabled(video);
    setMeetingError(null);
    await dailyMeeting.joinMeeting();
  }, [dailyMeeting]);

  const handleEndMeeting = useCallback(async () => {
    await dailyMeeting.leaveMeeting();
    setPhase("ended");
  }, [dailyMeeting]);

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
          isJoining={dailyMeeting.isJoining}
        />
      )}

      {phase === "live" && (
        <LiveMeetingRoom
          meeting={meeting}
          userId={currentUser.id}
          userName={currentUser.name}
          isHost={currentUser.isHost}
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
