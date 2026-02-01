import { cn } from "@/lib/utils";
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  MonitorUp,
  PhoneOff,
  Sparkles,
  MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MeetingControlsRealProps {
  isMuted: boolean;
  isVideoOn: boolean;
  isAIEnabled: boolean;
  participantCount: number;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleAI: () => void;
  onStartScreenShare: () => void;
  onEndCall: () => void;
  className?: string;
}

export function MeetingControlsReal({
  isMuted,
  isVideoOn,
  isAIEnabled,
  participantCount,
  onToggleMute,
  onToggleVideo,
  onToggleAI,
  onStartScreenShare,
  onEndCall,
  className,
}: MeetingControlsRealProps) {
  return (
    <div className={cn(
      "flex items-center gap-2 px-4 py-3 rounded-2xl glass-panel shadow-lg",
      className
    )}>
      {/* Microphone */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={isMuted ? "destructive" : "secondary"}
            size="lg"
            className="w-12 h-12 rounded-full"
            onClick={onToggleMute}
          >
            {isMuted ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isMuted ? "Unmute" : "Mute"}
        </TooltipContent>
      </Tooltip>

      {/* Camera */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={isVideoOn ? "secondary" : "destructive"}
            size="lg"
            className="w-12 h-12 rounded-full"
            onClick={onToggleVideo}
          >
            {isVideoOn ? (
              <Video className="w-5 h-5" />
            ) : (
              <VideoOff className="w-5 h-5" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isVideoOn ? "Turn off camera" : "Turn on camera"}
        </TooltipContent>
      </Tooltip>

      {/* Screen Share */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="secondary"
            size="lg"
            className="w-12 h-12 rounded-full"
            onClick={onStartScreenShare}
          >
            <MonitorUp className="w-5 h-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Share screen</TooltipContent>
      </Tooltip>

      {/* AI Toggle */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={isAIEnabled ? "secondary" : "ghost"}
            size="lg"
            className={cn(
              "w-12 h-12 rounded-full relative",
              isAIEnabled && "ring-2 ring-primary/50"
            )}
            onClick={onToggleAI}
          >
            <Sparkles className={cn(
              "w-5 h-5",
              isAIEnabled ? "text-primary" : "text-muted-foreground"
            )} />
            {isAIEnabled && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isAIEnabled ? "Disable AI Assistant" : "Enable AI Assistant"}
        </TooltipContent>
      </Tooltip>

      {/* Divider */}
      <div className="w-px h-8 bg-border/50 mx-1" />

      {/* Participant Count */}
      <div className="text-sm text-muted-foreground px-2">
        {participantCount}
      </div>

      {/* More Options */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="lg"
            className="w-12 h-12 rounded-full"
          >
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>More options</TooltipContent>
      </Tooltip>

      {/* Divider */}
      <div className="w-px h-8 bg-border/50 mx-1" />

      {/* End Call */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="destructive"
            size="lg"
            className="w-14 h-12 rounded-full"
            onClick={onEndCall}
          >
            <PhoneOff className="w-5 h-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Leave meeting</TooltipContent>
      </Tooltip>
    </div>
  );
}
