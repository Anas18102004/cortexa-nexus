import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Meeting, Participant, MeetingState } from "@/types/meeting";
import { PreJoinLobby } from "./PreJoinLobbyReal";
import { LiveMeetingRoom } from "./LiveMeetingRoom";
import { PostMeetingSummary } from "./PostMeetingSummary";
import { useDailyMeeting } from "@/hooks/useDailyMeeting";
import { useMeetingAI } from "@/hooks/useMeetingAI";

type MeetingPhase = "lobby" | "live" | "ended";

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

  // Daily.co meeting integration
  const dailyMeeting = useDailyMeeting({
    meetingId: meeting.id,
    userId: currentUser.id,
    userName: currentUser.name,
    isHost: currentUser.isHost,
    onMeetingJoined: () => {
      console.log("Successfully joined meeting");
      setPhase("live");
    },
    onMeetingLeft: () => {
      console.log("Left meeting");
      setPhase("ended");
    },
    onError: (err) => {
      console.error("Meeting error:", err);
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
    await dailyMeeting.joinMeeting();
  }, [dailyMeeting]);

  const handleEndMeeting = useCallback(async () => {
    await dailyMeeting.leaveMeeting();
    setPhase("ended");
  }, [dailyMeeting]);

  const handleRejoin = useCallback(() => {
    setPhase("lobby");
    meetingAI.reset();
  }, [meetingAI]);

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
