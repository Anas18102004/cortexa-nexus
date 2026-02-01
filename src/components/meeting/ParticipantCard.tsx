import { useState } from "react";
import { cn } from "@/lib/utils";
import { MeetingParticipant } from "@/hooks/useDailyMeeting";
import { 
  Mic, 
  MicOff, 
  Crown, 
  Sparkles,
  MoreHorizontal,
  UserMinus,
  Volume2
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Role type mapping for visual styling
type RoleCategory = "engineering" | "product" | "design" | "ai" | "default";

interface RoleConfig {
  category: RoleCategory;
  accentClass: string;
  glowClass: string;
  borderClass: string;
  bgGradient: string;
}

const roleConfigs: Record<string, RoleConfig> = {
  // Engineering roles → Cyan accent
  "Engineering Lead": { 
    category: "engineering", 
    accentClass: "text-aurora-cyan",
    glowClass: "shadow-[0_0_20px_hsl(188_94%_48%/0.15)]",
    borderClass: "border-aurora-cyan/30",
    bgGradient: "from-aurora-cyan/10 to-transparent"
  },
  "Frontend Developer": { 
    category: "engineering", 
    accentClass: "text-aurora-cyan",
    glowClass: "shadow-[0_0_20px_hsl(188_94%_48%/0.15)]",
    borderClass: "border-aurora-cyan/30",
    bgGradient: "from-aurora-cyan/10 to-transparent"
  },
  "Backend Developer": { 
    category: "engineering", 
    accentClass: "text-aurora-cyan",
    glowClass: "shadow-[0_0_20px_hsl(188_94%_48%/0.15)]",
    borderClass: "border-aurora-cyan/30",
    bgGradient: "from-aurora-cyan/10 to-transparent"
  },
  "AI Engineer": { 
    category: "ai", 
    accentClass: "text-primary",
    glowClass: "shadow-[0_0_20px_hsl(168_76%_50%/0.2)]",
    borderClass: "border-primary/40",
    bgGradient: "from-primary/15 to-aurora-violet/10"
  },
  // Product roles → Violet accent
  "Product Manager": { 
    category: "product", 
    accentClass: "text-aurora-violet",
    glowClass: "shadow-[0_0_20px_hsl(250_56%_65%/0.15)]",
    borderClass: "border-aurora-violet/30",
    bgGradient: "from-aurora-violet/10 to-transparent"
  },
  "Program Manager": { 
    category: "product", 
    accentClass: "text-aurora-violet",
    glowClass: "shadow-[0_0_20px_hsl(250_56%_65%/0.15)]",
    borderClass: "border-aurora-violet/30",
    bgGradient: "from-aurora-violet/10 to-transparent"
  },
  // Design roles → Rose/Amber accent (using rose as our warm color)
  "Designer": { 
    category: "design", 
    accentClass: "text-aurora-rose",
    glowClass: "shadow-[0_0_20px_hsl(340_75%_55%/0.15)]",
    borderClass: "border-aurora-rose/30",
    bgGradient: "from-aurora-rose/10 to-transparent"
  },
  "UX Designer": { 
    category: "design", 
    accentClass: "text-aurora-rose",
    glowClass: "shadow-[0_0_20px_hsl(340_75%_55%/0.15)]",
    borderClass: "border-aurora-rose/30",
    bgGradient: "from-aurora-rose/10 to-transparent"
  },
  "UI Designer": { 
    category: "design", 
    accentClass: "text-aurora-rose",
    glowClass: "shadow-[0_0_20px_hsl(340_75%_55%/0.15)]",
    borderClass: "border-aurora-rose/30",
    bgGradient: "from-aurora-rose/10 to-transparent"
  },
};

const defaultRoleConfig: RoleConfig = {
  category: "default",
  accentClass: "text-muted-foreground",
  glowClass: "",
  borderClass: "border-border/50",
  bgGradient: "from-surface-2/50 to-transparent"
};

function getRoleConfig(roleTitle: string): RoleConfig {
  return roleConfigs[roleTitle] || defaultRoleConfig;
}

// Presence state type
type PresenceState = "speaking" | "listening" | "muted" | "idle" | "disconnected";

function getPresenceState(participant: MeetingParticipant): PresenceState {
  // Assume connected if we have the participant
  if (participant.isSpeaking && !participant.isMuted) return "speaking";
  if (participant.isMuted) return "muted";
  return "listening";
}

interface ParticipantCardProps {
  participant: MeetingParticipant;
  roleTitle?: string;
  department?: string;
  isHost?: boolean;
  isAI?: boolean;
  onRemove?: () => void;
  className?: string;
}

export function ParticipantCard({
  participant,
  roleTitle = "Member",
  department = "",
  isHost = false,
  isAI = false,
  onRemove,
  className,
}: ParticipantCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const roleConfig = getRoleConfig(roleTitle);
  const presenceState = getPresenceState(participant);

  return (
    <div
      className={cn(
        "group relative rounded-xl p-3 transition-all duration-300 border",
        "bg-gradient-to-br",
        roleConfig.bgGradient,
        roleConfig.borderClass,
        presenceState === "speaking" && roleConfig.glowClass,
        presenceState === "speaking" && "scale-[1.02]",
        isHovered && "bg-surface-2/50",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-3">
        {/* Avatar with presence indicator */}
        <div className="relative">
          <Avatar className={cn(
            "w-10 h-10 ring-2 ring-offset-2 ring-offset-background transition-all duration-300",
            presenceState === "speaking" ? "ring-primary" : 
            presenceState === "muted" ? "ring-destructive/50" :
            presenceState === "disconnected" ? "ring-muted/30" :
            "ring-transparent"
          )}>
            <AvatarFallback className={cn(
              "text-sm font-medium",
              isAI ? "bg-gradient-to-br from-primary to-aurora-violet text-background" :
              "bg-surface-3 text-foreground"
            )}>
              {isAI ? (
                <Sparkles className="w-4 h-4" />
              ) : (
                participant.userName.charAt(0).toUpperCase()
              )}
            </AvatarFallback>
          </Avatar>

          {/* Speaking waveform indicator */}
          {presenceState === "speaking" && (
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-end gap-0.5 h-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="w-0.5 bg-primary rounded-full animate-pulse"
                  style={{
                    height: `${4 + Math.random() * 8}px`,
                    animationDelay: `${i * 100}ms`,
                    animationDuration: "0.6s",
                  }}
                />
              ))}
            </div>
          )}

          {/* Mute indicator */}
          {presenceState === "muted" && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-destructive flex items-center justify-center">
              <MicOff className="w-2.5 h-2.5 text-destructive-foreground" />
            </div>
          )}
        </div>

        {/* Name and role info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-foreground truncate">
              {participant.userName}
            </span>
            {participant.isLocal && (
              <span className="text-[10px] text-muted-foreground">(You)</span>
            )}
            {isHost && (
              <Tooltip>
                <TooltipTrigger>
                  <Crown className="w-3 h-3 text-aurora-violet" />
                </TooltipTrigger>
                <TooltipContent>Host</TooltipContent>
              </Tooltip>
            )}
            {isAI && (
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            )}
          </div>
          <p className={cn("text-xs truncate", roleConfig.accentClass)}>
            {roleTitle}
          </p>
          {department && (
            <p className="text-[10px] text-muted-foreground truncate mt-0.5">
              {department}
            </p>
          )}
        </div>

        {/* Actions (visible on hover for host) */}
        {isHovered && onRemove && !participant.isLocal && (
          <DropdownMenu>
            <DropdownMenuTrigger className="opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-6 h-6 rounded-md bg-surface-3 flex items-center justify-center hover:bg-surface-2">
                <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onRemove} className="text-destructive">
                <UserMinus className="w-4 h-4 mr-2" />
                Remove from meeting
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Presence state indicator line at bottom */}
      <div className={cn(
        "absolute bottom-0 left-2 right-2 h-0.5 rounded-full transition-all duration-500",
        presenceState === "speaking" ? "bg-primary" :
        presenceState === "listening" ? "bg-muted-foreground/30" :
        presenceState === "muted" ? "bg-destructive/50" :
        "bg-transparent"
      )} />
    </div>
  );
}

// Compact version for sidebar/filmstrip
export function ParticipantCardCompact({
  participant,
  roleTitle = "Member",
  isAI = false,
  className,
}: Omit<ParticipantCardProps, "department" | "isHost" | "onRemove">) {
  const roleConfig = getRoleConfig(roleTitle);
  const presenceState = getPresenceState(participant);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn(
          "relative p-1.5 rounded-lg transition-all duration-200",
          presenceState === "speaking" && "bg-primary/10 ring-1 ring-primary/30",
          className
        )}>
          <Avatar className={cn(
            "w-8 h-8",
            presenceState === "speaking" && "speaker-ring"
          )}>
            <AvatarFallback className={cn(
              "text-xs font-medium",
              isAI ? "bg-gradient-to-br from-primary to-aurora-violet text-background" :
              "bg-surface-3 text-foreground"
            )}>
              {isAI ? (
                <Sparkles className="w-3 h-3" />
              ) : (
                participant.userName.charAt(0).toUpperCase()
              )}
            </AvatarFallback>
          </Avatar>

          {participant.isMuted && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-destructive flex items-center justify-center">
              <MicOff className="w-2 h-2 text-destructive-foreground" />
            </div>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        <p className="font-medium">{participant.userName}</p>
        <p className={cn("text-xs", roleConfig.accentClass)}>{roleTitle}</p>
      </TooltipContent>
    </Tooltip>
  );
}
