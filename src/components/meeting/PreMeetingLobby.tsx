import { cn } from "@/lib/utils";
import { Meeting, Participant } from "@/types/meeting";
import { Button } from "@/components/ui/button";
import { ParticipantAvatar } from "./ParticipantAvatar";
import { RoleCard } from "./RoleCard";
import { 
  Calendar, 
  Clock, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff,
  Settings,
  Sparkles,
  Target,
  FileText,
  ChevronRight
} from "lucide-react";
import { useState } from "react";

interface PreMeetingLobbyProps {
  meeting: Meeting;
  currentUser: Participant;
  onJoin: () => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  className?: string;
}

export function PreMeetingLobby({
  meeting,
  currentUser,
  onJoin,
  onToggleMute,
  onToggleVideo,
  className,
}: PreMeetingLobbyProps) {
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);

  return (
    <div className={cn("min-h-screen bg-background flex", className)}>
      {/* Left Panel - Self Preview & Controls */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {/* Self Preview */}
        <div className="relative w-full max-w-md aspect-video rounded-2xl overflow-hidden bg-surface-1 mb-6">
          {currentUser.isVideoOn ? (
            <div className="absolute inset-0 bg-gradient-to-br from-surface-2 to-surface-1">
              <img
                src={currentUser.avatar}
                alt="Your preview"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-surface-2">
              <div className="w-24 h-24 rounded-full bg-surface-3 flex items-center justify-center">
                <span className="text-4xl font-semibold text-foreground">
                  {currentUser.name.charAt(0)}
                </span>
              </div>
            </div>
          )}

          {/* Controls Overlay */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
            <Button
              variant={currentUser.isMuted ? "controlActive" : "control"}
              size="icon"
              onClick={onToggleMute}
            >
              {currentUser.isMuted ? (
                <MicOff className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </Button>
            <Button
              variant={!currentUser.isVideoOn ? "controlActive" : "control"}
              size="icon"
              onClick={onToggleVideo}
            >
              {currentUser.isVideoOn ? (
                <Video className="w-5 h-5" />
              ) : (
                <VideoOff className="w-5 h-5" />
              )}
            </Button>
            <Button variant="control" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Meeting Info */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {meeting.title}
          </h1>
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {new Date(meeting.scheduledStart).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {new Date(meeting.scheduledStart).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>

        {/* Join Button */}
        <Button variant="aurora" size="xl" onClick={onJoin} className="min-w-[200px]">
          Join Meeting
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      </div>

      {/* Right Panel - Meeting Context */}
      <div className="w-[420px] border-l border-border bg-surface-0 p-6 overflow-y-auto">
        {/* AI-Generated Agenda */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-aurora-teal" />
            <h2 className="text-sm font-medium text-foreground">AI-Generated Agenda</h2>
          </div>
          <div className="space-y-2">
            {meeting.agenda.map((item, index) => (
              <div
                key={item.id}
                className="glass-panel rounded-xl p-3 flex items-start gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-surface-3 flex items-center justify-center shrink-0">
                  <span className="text-xs font-medium text-muted-foreground">
                    {index + 1}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{item.title}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span>{item.owner}</span>
                    <span>•</span>
                    <span>{item.duration}m</span>
                    {item.aiSuggested && (
                      <>
                        <span>•</span>
                        <span className="text-aurora-teal">AI suggested</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Goal Clarity */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-4 h-4 text-aurora-violet" />
            <h2 className="text-sm font-medium text-foreground">Meeting Goal</h2>
          </div>
          <div className="glass-panel rounded-xl p-4">
            <p className="text-sm text-foreground leading-relaxed">
              {meeting.description || "Define sprint priorities and assign ownership for Q1 initiatives."}
            </p>
            <div className="flex items-center gap-2 mt-3">
              <div className="flex-1 h-1.5 rounded-full bg-surface-3 overflow-hidden">
                <div className="h-full w-3/4 bg-gradient-to-r from-aurora-teal to-aurora-cyan rounded-full" />
              </div>
              <span className="text-xs text-aurora-teal">75% clarity</span>
            </div>
          </div>
        </div>

        {/* Prep Notes */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-4 h-4 text-aurora-cyan" />
            <h2 className="text-sm font-medium text-foreground">Prep Notes</h2>
          </div>
          <div className="glass-panel rounded-xl p-4 space-y-2">
            <p className="text-sm text-muted-foreground">
              • Review Q4 performance metrics before the meeting
            </p>
            <p className="text-sm text-muted-foreground">
              • Come prepared with team capacity estimates
            </p>
            <p className="text-sm text-muted-foreground">
              • Consider dependencies with the Platform team
            </p>
          </div>
        </div>

        {/* Participants */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-foreground">
              Participants ({meeting.participants.length})
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {meeting.participants.map((participant) => (
              <ParticipantAvatar
                key={participant.id}
                participant={participant}
                size="md"
                showControls={false}
                onClick={() => setSelectedParticipant(
                  selectedParticipant?.id === participant.id ? null : participant
                )}
              />
            ))}
          </div>

          {/* Selected Participant Role Card */}
          {selectedParticipant && (
            <div className="mt-4 fade-in">
              <RoleCard participant={selectedParticipant} expanded />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
