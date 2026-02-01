import { useState, useCallback } from "react";

export interface FloatingReaction {
  id: string;
  emoji: string;
  x: number; // percentage from left (0-100)
  createdAt: number;
}

const REACTION_EMOJIS = ["👍", "❤️", "🎉", "👏", "😂", "🔥", "💯", "🚀", "✨", "💪"];

export function useFloatingReactions() {
  const [reactions, setReactions] = useState<FloatingReaction[]>([]);

  const addReaction = useCallback((emoji: string) => {
    const newReaction: FloatingReaction = {
      id: `reaction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      emoji,
      x: 10 + Math.random() * 80, // Random position between 10-90%
      createdAt: Date.now(),
    };

    setReactions((prev) => [...prev, newReaction]);

    // Auto-remove after animation completes (4 seconds)
    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== newReaction.id));
    }, 4000);
  }, []);

  const removeReaction = useCallback((id: string) => {
    setReactions((prev) => prev.filter((r) => r.id !== id));
  }, []);

  // Quick reaction - adds a random common emoji
  const addQuickReaction = useCallback(() => {
    const randomEmoji = REACTION_EMOJIS[Math.floor(Math.random() * REACTION_EMOJIS.length)];
    addReaction(randomEmoji);
  }, [addReaction]);

  // Burst reaction - adds multiple of the same emoji
  const addBurstReaction = useCallback((emoji: string, count: number = 5) => {
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        addReaction(emoji);
      }, i * 100); // Stagger by 100ms each
    }
  }, [addReaction]);

  return {
    reactions,
    addReaction,
    removeReaction,
    addQuickReaction,
    addBurstReaction,
    availableEmojis: REACTION_EMOJIS,
  };
}
