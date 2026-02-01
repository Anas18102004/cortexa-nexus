import { useState, useCallback, useRef } from "react";

export interface FloatingReaction {
  id: string;
  emoji: string;
  x: number; // percentage from left (0-100)
  createdAt: number;
  sender?: {
    id: string;
    name: string;
    avatar: string;
  };
}

export interface ReactionSender {
  id: string;
  name: string;
  avatar: string;
}

const REACTION_EMOJIS = ["👍", "❤️", "🎉", "👏", "😂", "🔥", "💯", "🚀", "✨", "💪"];

// Sound effect frequencies for different emoji types
const EMOJI_SOUND_MAP: Record<string, { freq: number; type: OscillatorType }> = {
  "👍": { freq: 523, type: "sine" },      // C5 - bright
  "❤️": { freq: 659, type: "sine" },      // E5 - warm
  "🎉": { freq: 784, type: "triangle" },  // G5 - celebratory
  "👏": { freq: 440, type: "square" },    // A4 - clappy
  "😂": { freq: 587, type: "sine" },      // D5 - happy
  "🔥": { freq: 392, type: "sawtooth" },  // G4 - intense
  "💯": { freq: 698, type: "triangle" },  // F5 - perfect
  "🚀": { freq: 880, type: "sine" },      // A5 - soaring
  "✨": { freq: 1047, type: "sine" },     // C6 - sparkly
  "💪": { freq: 330, type: "square" },    // E4 - strong
};

export function useFloatingReactions(currentUser?: ReactionSender) {
  const [reactions, setReactions] = useState<FloatingReaction[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize AudioContext lazily (must be after user interaction)
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Play a satisfying pop/ping sound for reactions
  const playReactionSound = useCallback((emoji: string, isBurst: boolean = false) => {
    if (!soundEnabled) return;

    try {
      const ctx = getAudioContext();
      const soundConfig = EMOJI_SOUND_MAP[emoji] || { freq: 523, type: "sine" as OscillatorType };
      
      // Create oscillator for the main tone
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.type = soundConfig.type;
      oscillator.frequency.setValueAtTime(soundConfig.freq, ctx.currentTime);
      
      // Pitch bend up for a "pop" effect
      oscillator.frequency.exponentialRampToValueAtTime(
        soundConfig.freq * 1.5,
        ctx.currentTime + 0.05
      );
      oscillator.frequency.exponentialRampToValueAtTime(
        soundConfig.freq * 0.8,
        ctx.currentTime + 0.15
      );

      // Volume envelope - quick attack, medium decay
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(isBurst ? 0.15 : 0.25, ctx.currentTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.2);

      // Add a subtle harmonic for richness
      const harmonic = ctx.createOscillator();
      const harmonicGain = ctx.createGain();
      
      harmonic.type = "sine";
      harmonic.frequency.setValueAtTime(soundConfig.freq * 2, ctx.currentTime);
      harmonicGain.gain.setValueAtTime(0, ctx.currentTime);
      harmonicGain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.01);
      harmonicGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

      harmonic.connect(harmonicGain);
      harmonicGain.connect(ctx.destination);

      harmonic.start(ctx.currentTime);
      harmonic.stop(ctx.currentTime + 0.1);
    } catch (e) {
      // Audio context might not be available in some browsers
      console.log("Audio not available:", e);
    }
  }, [soundEnabled, getAudioContext]);

  const addReaction = useCallback((emoji: string, sender?: ReactionSender) => {
    const reactionSender = sender || currentUser;
    
    const newReaction: FloatingReaction = {
      id: `reaction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      emoji,
      x: 10 + Math.random() * 80, // Random position between 10-90%
      createdAt: Date.now(),
      sender: reactionSender,
    };

    setReactions((prev) => [...prev, newReaction]);
    playReactionSound(emoji, false);

    // Auto-remove after animation completes (4 seconds)
    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== newReaction.id));
    }, 4000);
  }, [currentUser, playReactionSound]);

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
        const reactionSender = currentUser;
        
        const newReaction: FloatingReaction = {
          id: `reaction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          emoji,
          x: 10 + Math.random() * 80,
          createdAt: Date.now(),
          sender: reactionSender,
        };

        setReactions((prev) => [...prev, newReaction]);
        playReactionSound(emoji, true);

        setTimeout(() => {
          setReactions((prev) => prev.filter((r) => r.id !== newReaction.id));
        }, 4000);
      }, i * 100); // Stagger by 100ms each
    }
  }, [currentUser, playReactionSound]);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => !prev);
  }, []);

  return {
    reactions,
    addReaction,
    removeReaction,
    addQuickReaction,
    addBurstReaction,
    availableEmojis: REACTION_EMOJIS,
    soundEnabled,
    toggleSound,
  };
}
