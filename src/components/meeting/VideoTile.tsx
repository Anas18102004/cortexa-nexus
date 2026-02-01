import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { MeetingParticipant } from "@/hooks/useDailyMeeting";
import { Sparkles, Mic, MicOff, Crown, Shield, Star, Volume2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface VideoTileProps {
  participant: MeetingParticipant;
  isActive?: boolean;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
  className?: string;
}

export function VideoTile({
  participant,
  isActive = false,
  size = "md",
  showName = true,
  className,
}: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Attach video track
  useEffect(() => {
    if (videoRef.current && participant.videoTrack) {
      const stream = new MediaStream([participant.videoTrack]);
      videoRef.current.srcObject = stream;
    } else if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [participant.videoTrack]);

  const sizeClasses = {
    sm: "w-20 h-14",
    md: "w-40 h-28",
    lg: "flex-1 min-h-0",
  };

  return (
    <div
      className={cn(
        "relative rounded-xl overflow-hidden bg-surface-1 transition-all duration-300",
        sizeClasses[size],
        isActive && "ring-2 ring-primary shadow-glow-sm",
        participant.isSpeaking && "ring-2 ring-aurora-teal",
        className
      )}
    >
      {/* Video or Avatar */}
      {participant.isVideoOn && participant.videoTrack ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={participant.isLocal}
          className={cn(
            "w-full h-full object-cover",
            participant.isLocal && "transform -scale-x-100"
          )}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-surface-1 to-surface-2">
          <div className={cn(
            "rounded-full bg-surface-3 flex items-center justify-center",
            size === "sm" ? "w-8 h-8" : size === "md" ? "w-12 h-12" : "w-24 h-24",
            participant.isSpeaking && "speaker-ring"
          )}>
            <span className={cn(
              "font-semibold text-foreground",
              size === "sm" ? "text-xs" : size === "md" ? "text-lg" : "text-3xl"
            )}>
              {participant.userName.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      )}

      {/* Speaking Indicator Wave */}
      {participant.isSpeaking && !participant.isMuted && (
        <div className="absolute top-2 right-2 flex items-center gap-0.5">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="w-0.5 bg-primary rounded-full animate-pulse"
              style={{
                height: `${8 + Math.random() * 8}px`,
                animationDelay: `${i * 100}ms`,
              }}
            />
          ))}
        </div>
      )}

      {/* Mute Indicator */}
      {participant.isMuted && (
        <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-destructive/90 flex items-center justify-center">
          <MicOff className="w-3.5 h-3.5 text-destructive-foreground" />
        </div>
      )}

      {/* Name Badge */}
      {showName && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
          <div className="flex items-center gap-1.5">
            {participant.isOwner && (
              <Crown className="w-3 h-3 text-aurora-violet" />
            )}
            <span className="text-xs text-white truncate">
              {participant.userName}
              {participant.isLocal && " (You)"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
