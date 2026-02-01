import { useState, useCallback } from "react";

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: Date;
  reactions: { emoji: string; count: number; hasReacted: boolean }[];
}

// Mock current user ID for demo
const CURRENT_USER_ID = "1";

const initialMessages: ChatMessage[] = [
  {
    id: "msg-1",
    userId: "2",
    userName: "Marcus Johnson",
    userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    content: "Just shared the Q1 roadmap doc in the meeting notes 📄",
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    reactions: [{ emoji: "👍", count: 2, hasReacted: true }],
  },
  {
    id: "msg-2",
    userId: "3",
    userName: "Emily Rodriguez",
    userAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
    content: "The design system updates look great! I'll prepare the handoff docs by EOD",
    timestamp: new Date(Date.now() - 1000 * 60 * 10),
    reactions: [],
  },
  {
    id: "msg-3",
    userId: "4",
    userName: "David Kim",
    userAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
    content: "API v2 spec is ready for review. @Sarah can you take a look when you have time?",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    reactions: [{ emoji: "🔥", count: 1, hasReacted: false }],
  },
];

export function useMeetingChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);

  const sendMessage = useCallback((content: string) => {
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      userId: CURRENT_USER_ID,
      userName: "Sarah Chen",
      userAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=200&h=200&fit=crop&crop=face",
      content,
      timestamp: new Date(),
      reactions: [],
    };
    setMessages((prev) => [...prev, newMessage]);
  }, []);

  const addReaction = useCallback((messageId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== messageId) return msg;

        const existingReaction = msg.reactions.find((r) => r.emoji === emoji);
        
        if (existingReaction) {
          // Toggle reaction
          if (existingReaction.hasReacted) {
            // Remove reaction
            const newReactions = msg.reactions
              .map((r) =>
                r.emoji === emoji
                  ? { ...r, count: r.count - 1, hasReacted: false }
                  : r
              )
              .filter((r) => r.count > 0);
            return { ...msg, reactions: newReactions };
          } else {
            // Add to existing
            return {
              ...msg,
              reactions: msg.reactions.map((r) =>
                r.emoji === emoji
                  ? { ...r, count: r.count + 1, hasReacted: true }
                  : r
              ),
            };
          }
        } else {
          // Add new reaction
          return {
            ...msg,
            reactions: [...msg.reactions, { emoji, count: 1, hasReacted: true }],
          };
        }
      })
    );
  }, []);

  return {
    messages,
    sendMessage,
    addReaction,
  };
}
