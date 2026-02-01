import { cn } from "@/lib/utils";
import { Participant } from "@/types/meeting";
import { Sparkles } from "lucide-react";

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
      {/* Main Speaker */}
      <div className="flex-1 relative rounded-2xl overflow-hidden bg-surface-1 min-h-0">
        {activeSpeaker ? (
          <>
            {activeSpeaker.isVideoOn ? (
              <div className="absolute inset-0">
                <img
                  src={activeSpeaker.avatar}
                  alt={activeSpeaker.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-surface-1 to-surface-2">
                <div className={cn(
                  "w-28 h-28 rounded-full bg-surface-3 flex items-center justify-center",
                  activeSpeaker.isSpeaking && "speaker-ring"
                )}>
                  <span className="text-4xl font-semibold text-foreground">
                    {activeSpeaker.name.charAt(0)}
                  </span>
                </div>
              </div>
            )}

            {/* Speaker Info */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="flex items-center gap-3">
                <div className="glass-panel rounded-xl px-4 py-2 flex items-center gap-3">
                  {activeSpeaker.isAI && (
                    <Sparkles className="w-4 h-4 text-primary" />
                  )}
                  <div>
                    <p className="font-medium text-foreground text-sm">
                      {activeSpeaker.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
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
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-muted-foreground text-sm">No active speaker</p>
          </div>
        )}
      </div>

      {/* Filmstrip */}
      {otherParticipants.length > 0 && (
        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
          {otherParticipants.map((participant) => (
            <div
              key={participant.id}
              className={cn(
                "shrink-0 relative rounded-xl overflow-hidden transition-all",
                participant.isSpeaking && "ring-2 ring-primary"
              )}
            >
              {participant.isVideoOn ? (
                <div className="w-20 h-14 bg-surface-1">
                  <img
                    src={participant.avatar}
                    alt={participant.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-20 h-14 bg-surface-2 flex items-center justify-center">
                  <span className="text-sm font-medium text-foreground">
                    {participant.name.charAt(0)}
                  </span>
                </div>
              )}

              {/* AI Badge */}
              {participant.isAI && (
                <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-primary/90 flex items-center justify-center">
                  <Sparkles className="w-2.5 h-2.5 text-primary-foreground" />
                </div>
              )}

              {/* Name */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1">
                <p className="text-[10px] text-white text-center truncate">
                  {participant.name.split(" ")[0]}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
