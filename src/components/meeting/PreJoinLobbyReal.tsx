import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useMediaDevices } from "@/hooks/useMediaDevices";
import { Participant } from "@/types/meeting";
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Settings2, 
  Sparkles,
  ChevronDown,
  Volume2,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PreJoinLobbyProps {
  meetingTitle: string;
  currentUser: Participant;
  onJoinMeeting: (audioEnabled: boolean, videoEnabled: boolean) => void;
  isJoining?: boolean;
  className?: string;
}

export function PreJoinLobby({
  meetingTitle,
  currentUser,
  onJoinMeeting,
  isJoining = false,
  className,
}: PreJoinLobbyProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showSettings, setShowSettings] = useState(false);
  
  const {
    hasPermissions,
    audioDevices,
    videoDevices,
    selectedAudioDevice,
    selectedVideoDevice,
    localStream,
    audioLevel,
    isAudioEnabled,
    isVideoEnabled,
    requestPermissions,
    toggleAudio,
    toggleVideo,
    setSelectedAudioDevice,
    setSelectedVideoDevice,
  } = useMediaDevices();

  // Request permissions on mount
  useEffect(() => {
    requestPermissions();
  }, []);

  // Attach video stream to video element
  useEffect(() => {
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  const handleJoin = () => {
    onJoinMeeting(isAudioEnabled, isVideoEnabled);
  };

  return (
    <div className={cn("min-h-screen bg-background flex", className)}>
      {/* Left Side - Video Preview */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-2xl space-y-6">
          {/* Video Preview Container */}
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-surface-1 border border-border/50">
            {isVideoEnabled && localStream ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-surface-1 to-surface-2">
                <div className="w-24 h-24 rounded-full bg-surface-3 flex items-center justify-center">
                  <span className="text-3xl font-semibold text-foreground">
                    {currentUser.name.charAt(0)}
                  </span>
                </div>
              </div>
            )}

            {/* Audio Level Indicator */}
            {isAudioEnabled && (
              <div className="absolute bottom-4 left-4 flex items-center gap-2 glass-panel rounded-lg px-3 py-2">
                <Volume2 className="w-4 h-4 text-primary" />
                <div className="w-20 h-1.5 bg-surface-3 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-75"
                    style={{ width: `${Math.min(audioLevel * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Name Badge */}
            <div className="absolute bottom-4 right-4 glass-panel rounded-xl px-4 py-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">{currentUser.name}</span>
                <span className="text-xs text-muted-foreground">{currentUser.role.title}</span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            <Button
              variant={isAudioEnabled ? "secondary" : "destructive"}
              size="lg"
              className="w-14 h-14 rounded-full"
              onClick={toggleAudio}
            >
              {isAudioEnabled ? (
                <Mic className="w-5 h-5" />
              ) : (
                <MicOff className="w-5 h-5" />
              )}
            </Button>

            <Button
              variant={isVideoEnabled ? "secondary" : "destructive"}
              size="lg"
              className="w-14 h-14 rounded-full"
              onClick={toggleVideo}
            >
              {isVideoEnabled ? (
                <Video className="w-5 h-5" />
              ) : (
                <VideoOff className="w-5 h-5" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="lg"
              className="w-14 h-14 rounded-full"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings2 className="w-5 h-5" />
            </Button>
          </div>

          {/* Settings Dropdown */}
          {showSettings && (
            <div className="glass-panel rounded-xl p-4 space-y-4 animate-fade-in">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Microphone</label>
                <Select value={selectedAudioDevice} onValueChange={setSelectedAudioDevice}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select microphone" />
                  </SelectTrigger>
                  <SelectContent>
                    {audioDevices.map((device) => (
                      <SelectItem key={device.deviceId} value={device.deviceId}>
                        {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Camera</label>
                <Select value={selectedVideoDevice} onValueChange={setSelectedVideoDevice}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select camera" />
                  </SelectTrigger>
                  <SelectContent>
                    {videoDevices.map((device) => (
                      <SelectItem key={device.deviceId} value={device.deviceId}>
                        {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Side - Meeting Info */}
      <div className="w-[400px] bg-surface-0 border-l border-border/50 flex flex-col justify-center p-8">
        <div className="space-y-8">
          {/* Meeting Title */}
          <div className="space-y-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              Ready to join
            </span>
            <h1 className="text-2xl font-semibold text-foreground">{meetingTitle}</h1>
          </div>

          {/* Your Role */}
          <div className="space-y-3">
            <span className="text-sm text-muted-foreground">Your role in this meeting</span>
            <div className="glass-panel rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-aurora-teal to-aurora-cyan flex items-center justify-center">
                  <span className="text-lg font-semibold text-background">
                    {currentUser.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{currentUser.name}</p>
                  <p className="text-sm text-muted-foreground">{currentUser.role.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{currentUser.role.department}</p>
                </div>
                {currentUser.isHost && (
                  <span className="px-2 py-0.5 rounded-full bg-aurora-violet/20 text-aurora-violet text-xs">
                    Host
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* AI Presence */}
          <div className="glass-panel rounded-xl p-4 border-l-2 border-l-primary">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-aurora-teal to-aurora-violet flex items-center justify-center ai-pulse">
                <Sparkles className="w-5 h-5 text-background" />
              </div>
              <div>
                <p className="font-medium text-foreground">Cortexa AI</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Will join to assist with notes, decisions, and action items
                </p>
              </div>
            </div>
          </div>

          {/* Checklist */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className={cn(
                "w-4 h-4",
                hasPermissions ? "text-primary" : "text-muted-foreground"
              )} />
              <span className={hasPermissions ? "text-foreground" : "text-muted-foreground"}>
                Camera & microphone ready
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span className="text-foreground">Meeting room available</span>
            </div>
          </div>

          {/* Join Button */}
          <Button
            onClick={handleJoin}
            disabled={isJoining || hasPermissions === false}
            className="w-full h-12 text-base font-medium bg-gradient-to-r from-primary to-aurora-cyan hover:opacity-90 transition-opacity"
          >
            {isJoining ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                Joining...
              </span>
            ) : (
              "Join Meeting"
            )}
          </Button>

          {hasPermissions === false && (
            <p className="text-sm text-destructive text-center">
              Please allow camera and microphone access to join
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
