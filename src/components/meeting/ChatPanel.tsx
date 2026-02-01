import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Smile, X, UserPlus, UserMinus, Circle, MonitorUp, Hand } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChatMessage } from "@/hooks/useMeetingChat";

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  onAddReaction: (messageId: string, emoji: string) => void;
  onClose: () => void;
  className?: string;
}

const EMOJI_OPTIONS = ["👍", "❤️", "😂", "🎉", "🤔", "👏", "🔥", "💯"];

export function ChatPanel({
  messages,
  onSendMessage,
  onAddReaction,
  onClose,
  className,
}: ChatPanelProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hoveredMessage, setHoveredMessage] = useState<string | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSystemIcon = (type?: string) => {
    switch (type) {
      case "join": return <UserPlus className="w-3 h-3" />;
      case "leave": return <UserMinus className="w-3 h-3" />;
      case "recording": return <Circle className="w-3 h-3 fill-current" />;
      case "screenshare": return <MonitorUp className="w-3 h-3" />;
      case "hand": return <Hand className="w-3 h-3" />;
      default: return null;
    }
  };

  const getSystemColor = (type?: string) => {
    switch (type) {
      case "join": return "text-aurora-teal";
      case "leave": return "text-muted-foreground";
      case "recording": return "text-destructive";
      case "screenshare": return "text-primary";
      case "hand": return "text-aurora-violet";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className={cn("flex flex-col h-full bg-surface-0", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="font-medium text-foreground">Chat</h3>
        <Button variant="ghost" size="iconSm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id}>
              {message.isSystem ? (
                // System message
                <div className={cn(
                  "flex items-center justify-center gap-2 py-2 text-xs",
                  getSystemColor(message.systemType)
                )}>
                  {getSystemIcon(message.systemType)}
                  <span>{message.content}</span>
                  <span className="text-muted-foreground/60">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              ) : (
                // Regular message
                <div
                  className="group relative"
                  onMouseEnter={() => setHoveredMessage(message.id)}
                  onMouseLeave={() => setHoveredMessage(null)}
                >
                  <div className="flex gap-3">
                    <img
                      src={message.userAvatar}
                      alt={message.userName}
                      className="w-8 h-8 rounded-full object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-medium text-foreground">
                          {message.userName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/90 mt-0.5 break-words">
                        {message.content}
                      </p>

                      {/* Reactions */}
                      {message.reactions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {message.reactions.map((reaction) => (
                            <button
                              key={reaction.emoji}
                              onClick={() => onAddReaction(message.id, reaction.emoji)}
                              className={cn(
                                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors",
                                reaction.hasReacted
                                  ? "bg-primary/20 text-primary"
                                  : "bg-surface-2 hover:bg-surface-3 text-muted-foreground"
                              )}
                            >
                              <span>{reaction.emoji}</span>
                              <span>{reaction.count}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Reaction Picker */}
                  {hoveredMessage === message.id && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="iconSm"
                          className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Smile className="w-4 h-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-2" align="end">
                        <div className="flex gap-1">
                          {EMOJI_OPTIONS.map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => onAddReaction(message.id, emoji)}
                              className="p-1.5 hover:bg-surface-2 rounded transition-colors text-lg"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              )}
            </div>
          ))}

          {messages.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                No messages yet. Start the conversation!
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 bg-surface-1 border-transparent focus:border-primary/50"
          />
          <Button
            variant="aurora"
            size="icon"
            onClick={handleSend}
            disabled={!input.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
