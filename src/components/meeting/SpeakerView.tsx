import { cn } from "@/lib/utils";
import { Participant } from "@/types/meeting";
import { ParticipantAvatar } from "./ParticipantAvatar";
import { Sparkles, Mic } from "lucide-react";

interface SpeakerViewProps {
  activeSpeaker: Participant | null;
  participants: Participant[];
  className?: string;
}

export function SpeakerView({ activeSpeaker, participants, className }: SpeakerViewProps) {
  const otherParticipants = participants.filter(
    (p) => p.id !== activeSpeaker?.id
  );

  return (
    <div className={cn("relative flex-1 flex flex-col", className)}>
      {/* Main Speaker Area */}
      <div className="flex-1 relative rounded-2xl overflow-hidden bg-surface-1 min-h-0">
        {activeSpeaker ? (
          <>
            {/* Video/Avatar Display */}
            {activeSpeaker.isVideoOn ? (
              <div className="absolute inset-0 bg-gradient-to-br from-surface-2 to-surface-1">
                <img
                  src={activeSpeaker.avatar}
                  alt={activeSpeaker.name}
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-surface-1">
                <div className="w-32 h-32 rounded-full bg-surface-2 flex items-center justify-center speaker-ring">
                  <span className="text-5xl font-semibold text-foreground">
                    {activeSpeaker.name.charAt(0)}
                  </span>
                </div>
              </div>
            )}

            {/* Speaker Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-end justify-between">
                <div className="flex items-center gap-4">
                  <div className="glass-panel rounded-xl px-4 py-3 flex items-center gap-3">
                    {activeSpeaker.isAI && (
                      <Sparkles className="w-5 h-5 text-aurora-teal" />
                    )}
                    <div>
                      <p className="font-semibold text-foreground">
                        {activeSpeaker.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {activeSpeaker.role.title}
                      </p>
                    </div>
                    {activeSpeaker.isSpeaking && !activeSpeaker.isMuted && (
                      <div className="audio-wave ml-2">
                        <span />
                        <span />
                        <span />
                        <span />
                        <span />
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="glass-panel rounded-xl px-4 py-2 flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-aurora-teal" />
                    <span>{participants.length} in meeting</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-muted-foreground">No active speaker</p>
          </div>
        )}
      </div>

      {/* Participant Filmstrip */}
      {otherParticipants.length > 0 && (
        <div className="mt-4 flex items-center gap-3 overflow-x-auto pb-2">
          {otherParticipants.map((participant) => (
            <div
              key={participant.id}
              className={cn(
                "shrink-0 p-2 rounded-xl transition-all",
                participant.isSpeaking && "bg-surface-2 shadow-glow-sm"
              )}
            >
              <div className="relative">
                {participant.isVideoOn ? (
                  <div className="w-24 h-16 rounded-lg overflow-hidden bg-surface-1">
                    <img
                      src={participant.avatar}
                      alt={participant.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-16 rounded-lg bg-surface-2 flex items-center justify-center">
                    <span className="text-lg font-semibold text-foreground">
                      {participant.name.charAt(0)}
                    </span>
                  </div>
                )}

                {/* Mute Indicator */}
                {participant.isMuted && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-destructive flex items-center justify-center">
                    <Mic className="w-3 h-3 text-destructive-foreground" />
                  </div>
                )}

                {/* AI Badge */}
                {participant.isAI && (
                  <div className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-aurora-teal flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-background" />
                  </div>
                )}
              </div>

              <p className="text-xs text-center text-muted-foreground mt-1.5 truncate max-w-24">
                {participant.name}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
