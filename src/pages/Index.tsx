import { useState, useEffect } from "react";
import { PreMeetingLobby } from "@/components/meeting/PreMeetingLobby";
import { LiveMeeting } from "@/components/meeting/LiveMeeting";
import { PostMeetingSummary } from "@/components/meeting/PostMeetingSummary";
import { MeetingOrchestrator } from "@/components/meeting/MeetingOrchestrator";
import { 
  mockMeeting, 
  mockMeetingState, 
  currentUser as initialUser 
} from "@/data/mockMeeting";
import { Participant, MeetingState } from "@/types/meeting";
import { Button } from "@/components/ui/button";
import { Video, Monitor } from "lucide-react";

type MeetingPhase = "lobby" | "live" | "summary";
type MeetingMode = "demo" | "real";

const Index = () => {
  const [mode, setMode] = useState<MeetingMode>("demo");
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
    if (phase === "live" && mode === "demo") {
      const interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
        setMeetingState((prev) => ({
          ...prev,
          elapsedTime: prev.elapsedTime + 1,
        }));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [phase, mode]);

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

  // Real WebRTC meeting mode
  if (mode === "real") {
    return (
      <div className="relative">
        {/* Mode Toggle */}
        <div className="fixed top-4 right-4 z-50">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMode("demo")}
            className="glass-panel"
          >
            <Monitor className="w-4 h-4 mr-2" />
            Switch to Demo
          </Button>
        </div>
        
        <MeetingOrchestrator
          meeting={mockMeeting}
          currentUser={currentUser}
        />
      </div>
    );
  }

  // Demo mode with mock data
  return (
    <div className="relative">
      {/* Mode Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMode("real")}
          className="glass-panel"
        >
          <Video className="w-4 h-4 mr-2" />
          Try Real Meeting
        </Button>
      </div>

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
    </div>
  );
};

export default Index;
