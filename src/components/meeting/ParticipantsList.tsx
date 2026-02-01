import { useState } from "react";
import { cn } from "@/lib/utils";
import { MeetingParticipant } from "@/hooks/useDailyMeeting";
import { ParticipantCard, ParticipantCardCompact } from "./ParticipantCard";
import { InviteModal } from "./InviteModal";
import { 
  Users, 
  UserPlus, 
  Sparkles,
  Search,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

// Mock role data for participants (in production, fetch from database)
const mockParticipantRoles: Record<string, { title: string; department: string }> = {
  "user-1": { title: "Product Manager", department: "Product" },
  "user-2": { title: "Frontend Developer", department: "Engineering" },
  "user-3": { title: "UX Designer", department: "Design" },
  "user-4": { title: "Backend Developer", department: "Engineering" },
  "user-5": { title: "AI Engineer", department: "AI/ML" },
};

interface ParticipantsListProps {
  participants: MeetingParticipant[];
  meetingId: string;
  meetingTitle: string;
  isHost?: boolean;
  isAIEnabled?: boolean;
  onClose?: () => void;
  className?: string;
}

export function ParticipantsList({
  participants,
  meetingId,
  meetingTitle,
  isHost = false,
  isAIEnabled = true,
  onClose,
  className,
}: ParticipantsListProps) {
  const [showInvite, setShowInvite] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter participants by search
  const filteredParticipants = participants.filter(p =>
    p.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group by speaking status for better UX
  const speakingParticipants = filteredParticipants.filter(p => p.isSpeaking && !p.isMuted);
  const otherParticipants = filteredParticipants.filter(p => !p.isSpeaking || p.isMuted);

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium text-foreground">
            Participants ({participants.length})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="iconSm"
            onClick={() => setShowInvite(true)}
          >
            <UserPlus className="w-4 h-4" />
          </Button>
          {onClose && (
            <Button variant="ghost" size="iconSm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Search */}
      {participants.length > 4 && (
        <div className="p-3 border-b border-border/30">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search participants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-8 bg-surface-2 border-border/50"
            />
          </div>
        </div>
      )}

      {/* Participants List */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          {/* AI Participant */}
          {isAIEnabled && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wider px-1">
                AI Assistant
              </p>
              <div className="glass-panel rounded-xl p-3 border-l-2 border-l-primary ai-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-aurora-violet flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-background" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Cortexa AI</p>
                    <p className="text-xs text-primary">Listening & analyzing</p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                </div>
              </div>
            </div>
          )}

          {/* Speaking Now */}
          {speakingParticipants.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wider px-1">
                Speaking Now
              </p>
              <div className="space-y-2">
                {speakingParticipants.map((participant) => {
                  const role = mockParticipantRoles[participant.id] || { title: "Member", department: "" };
                  return (
                    <ParticipantCard
                      key={participant.id}
                      participant={participant}
                      roleTitle={role.title}
                      department={role.department}
                      isHost={participant.isOwner}
                      className="fade-in"
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* All Participants */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider px-1">
              {speakingParticipants.length > 0 ? "Others" : "In Meeting"}
            </p>
            <div className="space-y-2">
              {otherParticipants.map((participant) => {
                const role = mockParticipantRoles[participant.id] || { title: "Member", department: "" };
                return (
                  <ParticipantCard
                    key={participant.id}
                    participant={participant}
                    roleTitle={role.title}
                    department={role.department}
                    isHost={participant.isOwner}
                    onRemove={isHost && !participant.isLocal ? () => {} : undefined}
                    className="fade-in"
                  />
                );
              })}
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Invite Modal */}
      <InviteModal
        isOpen={showInvite}
        onClose={() => setShowInvite(false)}
        meetingId={meetingId}
        meetingTitle={meetingTitle}
      />
    </div>
  );
}

// Compact horizontal filmstrip version
export function ParticipantsFilmstrip({
  participants,
  isAIEnabled = true,
  className,
}: {
  participants: MeetingParticipant[];
  isAIEnabled?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {/* AI participant */}
      {isAIEnabled && (
        <div className="relative p-1.5 rounded-lg bg-primary/10 ring-1 ring-primary/30">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-aurora-violet flex items-center justify-center ai-pulse">
            <Sparkles className="w-4 h-4 text-background" />
          </div>
        </div>
      )}
      
      {/* Human participants */}
      {participants.slice(0, 6).map((participant) => {
        const role = mockParticipantRoles[participant.id];
        return (
          <ParticipantCardCompact
            key={participant.id}
            participant={participant}
            roleTitle={role?.title}
          />
        );
      })}
      
      {/* Overflow count */}
      {participants.length > 6 && (
        <div className="w-8 h-8 rounded-full bg-surface-3 flex items-center justify-center text-xs font-medium text-muted-foreground">
          +{participants.length - 6}
        </div>
      )}
    </div>
  );
}
