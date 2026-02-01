import { useState, useEffect } from "react";
import { PreMeetingLobby } from "@/components/meeting/PreMeetingLobby";
import { LiveMeeting } from "@/components/meeting/LiveMeeting";
import { PostMeetingSummary } from "@/components/meeting/PostMeetingSummary";
import { 
  mockMeeting, 
  mockMeetingState, 
  currentUser as initialUser 
} from "@/data/mockMeeting";
import { Participant, MeetingState } from "@/types/meeting";

type MeetingPhase = "lobby" | "live" | "summary";

const Index = () => {
  const [phase, setPhase] = useState<MeetingPhase>("lobby");
  const [currentUser, setCurrentUser] = useState<Participant>(initialUser);
  const [meetingState, setMeetingState] = useState<MeetingState>({
    ...mockMeetingState,
    elapsedTime: 0,
    uiMode: "focus",
  });
  const [elapsedTime, setElapsedTime] = useState(0);

  // Timer for live meeting
  useEffect(() => {
    if (phase === "live") {
      const interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
        setMeetingState((prev) => ({
          ...prev,
          elapsedTime: prev.elapsedTime + 1,
        }));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [phase]);

  const handleJoin = () => {
    setPhase("live");
    setElapsedTime(0);
    setMeetingState((prev) => ({
      ...prev,
      elapsedTime: 0,
      meeting: {
        ...prev.meeting,
        status: "live",
      },
    }));
  };

  const handleEndMeeting = () => {
    setPhase("summary");
  };

  const handleCloseSummary = () => {
    // Reset to lobby for demo purposes
    setPhase("lobby");
    setElapsedTime(0);
    setMeetingState(mockMeetingState);
  };

  const handleToggleMute = () => {
    setCurrentUser((prev) => ({
      ...prev,
      isMuted: !prev.isMuted,
    }));
  };

  const handleToggleVideo = () => {
    setCurrentUser((prev) => ({
      ...prev,
      isVideoOn: !prev.isVideoOn,
    }));
  };

  return (
    <>
      {phase === "lobby" && (
        <PreMeetingLobby
          meeting={mockMeeting}
          currentUser={currentUser}
          onJoin={handleJoin}
          onToggleMute={handleToggleMute}
          onToggleVideo={handleToggleVideo}
        />
      )}
      {phase === "live" && (
        <LiveMeeting
          state={meetingState}
          currentUser={currentUser}
          onEndMeeting={handleEndMeeting}
        />
      )}
      {phase === "summary" && (
        <PostMeetingSummary
          meeting={meetingState.meeting}
          duration={elapsedTime}
          onClose={handleCloseSummary}
        />
      )}
    </>
  );
};

export default Index;
