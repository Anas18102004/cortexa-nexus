import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  Hand,
  MessageSquare,
  MoreHorizontal,
  PhoneOff,
  Users,
  Captions,
  Circle,
  Settings,
  Layout,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface MeetingControlsProps {
  isMuted: boolean;
  isVideoOn: boolean;
  isScreenSharing: boolean;
  isHandRaised: boolean;
  isCaptionsOn: boolean;
  isRecording: boolean;
  participantCount: number;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onToggleHand: () => void;
  onToggleCaptions: () => void;
  onToggleRecording: () => void;
  onOpenChat: () => void;
  onOpenParticipants: () => void;
  onEndCall: () => void;
  className?: string;
}

export function MeetingControls({
  isMuted,
  isVideoOn,
  isScreenSharing,
  isHandRaised,
  isCaptionsOn,
  isRecording,
  participantCount,
  onToggleMute,
  onToggleVideo,
  onToggleScreenShare,
  onToggleHand,
  onToggleCaptions,
  onToggleRecording,
  onOpenChat,
  onOpenParticipants,
  onEndCall,
  className,
}: MeetingControlsProps) {
  return (
    <div
      className={cn(
        "glass-panel rounded-2xl p-2 flex items-center gap-1",
        className
      )}
    >
      {/* Primary Controls */}
      <div className="flex items-center gap-1 px-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isMuted ? "controlActive" : "control"}
              size="icon"
              onClick={onToggleMute}
            >
              {isMuted ? (
                <MicOff className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{isMuted ? "Unmute" : "Mute"}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={!isVideoOn ? "controlActive" : "control"}
              size="icon"
              onClick={onToggleVideo}
            >
              {isVideoOn ? (
                <Video className="w-5 h-5" />
              ) : (
                <VideoOff className="w-5 h-5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{isVideoOn ? "Turn off camera" : "Turn on camera"}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isScreenSharing ? "aurora" : "control"}
              size="icon"
              onClick={onToggleScreenShare}
            >
              <Monitor className="w-5 h-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isScreenSharing ? "Stop sharing" : "Share screen"}
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="w-px h-8 bg-border" />

      {/* Secondary Controls */}
      <div className="flex items-center gap-1 px-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isHandRaised ? "secondary" : "control"}
              size="icon"
              onClick={onToggleHand}
            >
              <Hand className="w-5 h-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{isHandRaised ? "Lower hand" : "Raise hand"}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="control" size="icon" onClick={onOpenChat}>
              <MessageSquare className="w-5 h-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Chat</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="control"
              size="icon"
              onClick={onOpenParticipants}
              className="relative"
            >
              <Users className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-[10px] font-medium flex items-center justify-center text-primary-foreground">
                {participantCount}
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Participants</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isCaptionsOn ? "secondary" : "control"}
              size="icon"
              onClick={onToggleCaptions}
            >
              <Captions className="w-5 h-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{isCaptionsOn ? "Hide captions" : "Show captions"}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="control"
              size="icon"
              onClick={onToggleRecording}
              className={cn(isRecording && "text-destructive")}
            >
              <Circle
                className={cn(
                  "w-5 h-5",
                  isRecording && "fill-current animate-pulse"
                )}
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isRecording ? "Stop recording" : "Start recording"}
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="w-px h-8 bg-border" />

      {/* More Options */}
      <div className="flex items-center gap-1 px-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="control" size="icon">
              <Layout className="w-5 h-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Change layout</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="control" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Settings</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="control" size="icon">
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>More options</TooltipContent>
        </Tooltip>
      </div>

      <div className="w-px h-8 bg-border" />

      {/* End Call */}
      <div className="px-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="controlActive"
              size="default"
              onClick={onEndCall}
              className="px-6"
            >
              <PhoneOff className="w-5 h-5 mr-2" />
              End
            </Button>
          </TooltipTrigger>
          <TooltipContent>Leave meeting</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
