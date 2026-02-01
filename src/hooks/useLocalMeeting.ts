import { useState, useCallback, useEffect, useRef } from "react";

export interface LocalParticipant {
  id: string;
  sessionId: string;
  userName: string;
  isLocal: boolean;
  isOwner: boolean;
  audioTrack: MediaStreamTrack | null;
  videoTrack: MediaStreamTrack | null;
  isMuted: boolean;
  isVideoOn: boolean;
  isSpeaking: boolean;
  joinedAt: Date;
}

interface UseLocalMeetingOptions {
  meetingId: string;
  userId: string;
  userName: string;
  isHost: boolean;
  onMeetingJoined?: () => void;
  onMeetingLeft?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Local-only meeting hook that simulates a real meeting using local media
 * No external provider required - works immediately
 */
export function useLocalMeeting({
  meetingId,
  userId,
  userName,
  isHost,
  onMeetingJoined,
  onMeetingLeft,
  onError,
}: UseLocalMeetingOptions) {
  const [participants, setParticipants] = useState<LocalParticipant[]>([]);
  const [localParticipant, setLocalParticipant] = useState<LocalParticipant | null>(null);
  const [activeSpeakerId, setActiveSpeakerId] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const localStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Create simulated participants for demo
  const createSimulatedParticipants = useCallback(() => {
    const simulated: LocalParticipant[] = [
      {
        id: "sim-1",
        sessionId: "sim-session-1",
        userName: "Alex Rivera",
        isLocal: false,
        isOwner: false,
        audioTrack: null,
        videoTrack: null,
        isMuted: false,
        isVideoOn: true,
        isSpeaking: false,
        joinedAt: new Date(),
      },
      {
        id: "sim-2",
        sessionId: "sim-session-2",
        userName: "Jordan Lee",
        isLocal: false,
        isOwner: false,
        audioTrack: null,
        videoTrack: null,
        isMuted: true,
        isVideoOn: false,
        isSpeaking: false,
        joinedAt: new Date(),
      },
    ];
    return simulated;
  }, []);

  // Join meeting - gets local media and simulates joining
  const joinMeeting = useCallback(async () => {
    if (isJoining || isJoined) return;
    setIsJoining(true);
    setError(null);

    try {
      // Request camera and microphone
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localStreamRef.current = stream;

      // Create local participant
      const local: LocalParticipant = {
        id: userId,
        sessionId: `session-${userId}`,
        userName,
        isLocal: true,
        isOwner: isHost,
        audioTrack: stream.getAudioTracks()[0] || null,
        videoTrack: stream.getVideoTracks()[0] || null,
        isMuted: false,
        isVideoOn: true,
        isSpeaking: false,
        joinedAt: new Date(),
      };

      setLocalParticipant(local);

      // Add simulated participants after a delay for realism
      const simulated = createSimulatedParticipants();
      
      setTimeout(() => {
        setParticipants([local, ...simulated]);
      }, 500);

      // Set up audio level detection for speaking indicator
      setupAudioAnalysis(stream);

      setIsJoined(true);
      setIsJoining(false);
      onMeetingJoined?.();

      // Simulate random speaking activity from other participants
      startSpeakingSimulation(simulated);

    } catch (err) {
      console.error("Failed to join meeting:", err);
      const error = err instanceof Error ? err : new Error("Failed to access camera/microphone");
      setError(error);
      setIsJoining(false);
      onError?.(error);
    }
  }, [meetingId, userId, userName, isHost, isJoining, isJoined, createSimulatedParticipants, onMeetingJoined, onError]);

  // Setup audio analysis for speaking detection
  const setupAudioAnalysis = useCallback((stream: MediaStream) => {
    try {
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 256;
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const checkAudioLevel = () => {
        if (!analyserRef.current) return;
        
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        const isSpeaking = average > 30;

        setLocalParticipant((prev) => {
          if (!prev || prev.isSpeaking === isSpeaking) return prev;
          return { ...prev, isSpeaking };
        });

        if (isSpeaking) {
          setActiveSpeakerId(userId);
        }

        animationFrameRef.current = requestAnimationFrame(checkAudioLevel);
      };

      checkAudioLevel();
    } catch (err) {
      console.warn("Audio analysis not available:", err);
    }
  }, [userId]);

  // Simulate speaking activity from other participants
  const startSpeakingSimulation = useCallback((simulated: LocalParticipant[]) => {
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * simulated.length);
      const speakerId = simulated[randomIdx].id;
      
      setParticipants((prev) =>
        prev.map((p) => ({
          ...p,
          isSpeaking: p.id === speakerId,
        }))
      );
      
      setActiveSpeakerId(speakerId);

      // Stop speaking after a bit
      setTimeout(() => {
        setParticipants((prev) =>
          prev.map((p) => ({
            ...p,
            isSpeaking: p.id === speakerId ? false : p.isSpeaking,
          }))
        );
      }, 2000 + Math.random() * 3000);
    }, 5000 + Math.random() * 5000);

    return () => clearInterval(interval);
  }, []);

  // Leave meeting
  const leaveMeeting = useCallback(async () => {
    // Stop all tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    // Stop audio analysis
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    setIsJoined(false);
    setParticipants([]);
    setLocalParticipant(null);
    onMeetingLeft?.();
  }, [onMeetingLeft]);

  // Toggle microphone
  const toggleMicrophone = useCallback(async () => {
    if (!localStreamRef.current) return;
    
    const audioTrack = localStreamRef.current.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setLocalParticipant((prev) =>
        prev ? { ...prev, isMuted: !audioTrack.enabled } : null
      );
    }
  }, []);

  // Toggle camera
  const toggleCamera = useCallback(async () => {
    if (!localStreamRef.current) return;
    
    const videoTrack = localStreamRef.current.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setLocalParticipant((prev) =>
        prev ? { ...prev, isVideoOn: videoTrack.enabled } : null
      );
    }
  }, []);

  // Screen share (mock - just logs)
  const startScreenShare = useCallback(async () => {
    console.log("Screen share would start here");
  }, []);

  const stopScreenShare = useCallback(async () => {
    console.log("Screen share would stop here");
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    // State
    participants,
    localParticipant,
    activeSpeakerId,
    isJoining,
    isJoined,
    roomUrl: `local://${meetingId}`,
    error,
    callObject: null,
    localStream: localStreamRef.current,
    
    // Actions
    joinMeeting,
    leaveMeeting,
    toggleMicrophone,
    toggleCamera,
    startScreenShare,
    stopScreenShare,
  };
}
