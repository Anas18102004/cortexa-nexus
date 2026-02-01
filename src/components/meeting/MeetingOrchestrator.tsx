import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Meeting, Participant, MeetingState } from "@/types/meeting";
import { PreJoinLobby } from "./PreJoinLobbyReal";
import { LiveMeetingRoomLocal } from "./LiveMeetingRoomLocal";
import { PostMeetingSummary } from "./PostMeetingSummary";
import { MeetingErrorState } from "./MeetingStates";
import { useRealtimeMeetingWebRTC } from "@/hooks/useRealtimeMeetingWebRTC";
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
  const [displayName, setDisplayName] = useState(currentUser.name);

  // Real-time meeting with WebRTC for actual audio/video streaming
  const realtimeMeeting = useRealtimeMeetingWebRTC({
    meetingId: meeting.id,
    userId: currentUser.id,
    userName: displayName,
    isHost: currentUser.isHost,
    onMeetingJoined: () => {
      console.log("Successfully joined real-time meeting with WebRTC");
      setPhase("live");
      setMeetingError(null);
    },
    onMeetingLeft: () => {
      console.log("Left meeting");
      if (phase === "live") {
        setPhase("ended");
      }
    },
    onParticipantJoined: (participant) => {
      console.log("Participant joined:", participant.userName);
    },
    onParticipantLeft: (id, name) => {
      console.log("Participant left:", name);
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
    participants: realtimeMeeting.participants,
  });

  const handleJoinMeeting = useCallback(async (audio: boolean, video: boolean, name: string) => {
    setAudioEnabled(audio);
    setVideoEnabled(video);
    setDisplayName(name);
    setMeetingError(null);
    await realtimeMeeting.joinMeeting();
  }, [realtimeMeeting]);

  const handleEndMeeting = useCallback(async () => {
    await realtimeMeeting.leaveMeeting();
    setPhase("ended");
  }, [realtimeMeeting]);

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

  // Adapt realtimeMeeting to match expected interface
  const adaptedMeeting = {
    ...realtimeMeeting,
    // Map RealtimeParticipant to LocalParticipant interface
    participants: realtimeMeeting.participants.map(p => ({
      ...p,
      audioTrack: null,
      videoTrack: null,
    })),
    localParticipant: realtimeMeeting.localParticipant ? {
      ...realtimeMeeting.localParticipant,
      audioTrack: null,
      videoTrack: null,
    } : null,
  };

  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {phase === "lobby" && (
        <PreJoinLobby
          meetingTitle={meeting.title}
          currentUser={currentUser}
          onJoinMeeting={handleJoinMeeting}
          isJoining={realtimeMeeting.isJoining}
        />
      )}

      {phase === "live" && (
        <LiveMeetingRoomLocal
          meeting={meeting}
          userId={currentUser.id}
          userName={currentUser.name}
          isHost={currentUser.isHost}
          localMeeting={adaptedMeeting as any}
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
