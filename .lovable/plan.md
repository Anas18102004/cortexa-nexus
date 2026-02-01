
# Cortexa Meet: Complete Feature Implementation Plan

## Current State Analysis

After thorough exploration of the codebase, the meeting system has a solid foundation with:

**Already Implemented:**
- Local WebRTC video/audio using native `getUserMedia`
- Pre-join lobby with camera/mic preview
- Real-time speaking detection via AudioContext analysis
- Grid and speaker view layouts
- In-meeting chat with emoji reactions
- AI assistant with transcript analysis
- Push-to-talk mode
- Theme toggle (dark/light)
- Basic invite modal with link copying
- Role-aware participant cards
- Simulated participants for demo mode

**Missing or Incomplete Features:**
1. Screen sharing (stubbed with console.log only)
2. Waiting room / host approval flow
3. Raise hand synchronization
4. Recording functionality
5. Host controls (mute others, remove participant)
6. Auto-hide controls on idle
7. Network quality indicator integration
8. Spotlight view layout
9. Join/leave toast notifications
10. System messages in chat

---

## Implementation Plan

### Phase 1: Screen Sharing (Critical Feature)

Implement real screen sharing using `getDisplayMedia` API in the local meeting hook.

**Files to modify:**
- `src/hooks/useLocalMeeting.ts` - Add screen share state and `getDisplayMedia` logic
- `src/components/meeting/LiveMeetingRoomLocal.tsx` - Display screen share in main video area
- `src/components/meeting/MeetingControlsReal.tsx` - Add stop share button and active indicator

**Technical approach:**
```text
+------------------+     getDisplayMedia     +-------------------+
|  Screen Share    | ----------------------> |  screenStream     |
|  Button Click    |                         |  (MediaStream)    |
+------------------+                         +-------------------+
                                                      |
                                                      v
                                            +-------------------+
                                            |  Display in main  |
                                            |  video area with  |
                                            |  "Sharing" badge  |
                                            +-------------------+
```

### Phase 2: Auto-Hide Controls on Idle

Implement idle detection to fade out controls bar after inactivity.

**Files to create/modify:**
- `src/hooks/useIdleDetection.ts` (new) - Track mouse/keyboard activity
- `src/components/meeting/FloatingControls.tsx` (new) - Wrapper with fade animation
- `src/components/meeting/LiveMeetingRoomLocal.tsx` - Integrate idle detection

**Technical approach:**
- Track `mousemove`, `keydown`, `click` events
- Set controls opacity to 0 after 4 seconds of idle
- Show on any user activity with smooth fade transition
- Always visible when PTT mode active or sharing screen

### Phase 3: Host Controls

Implement host moderation capabilities.

**Files to modify:**
- `src/hooks/useLocalMeeting.ts` - Add `muteParticipant`, `removeParticipant` functions
- `src/components/meeting/ParticipantCard.tsx` - Add action buttons for host
- `src/components/meeting/ParticipantsList.tsx` - Connect host actions

**Features:**
- "Mute" button on each participant card (host only)
- "Remove from meeting" with confirmation dialog
- "Mute All" button in participants header
- Visual feedback when host mutes someone

### Phase 4: Raise Hand with Sync

Make raise hand visible to all participants with proper ordering.

**Files to modify:**
- `src/hooks/useLocalMeeting.ts` - Add `raisedHands` state and `toggleRaiseHand`
- `src/types/meeting.ts` - Extend LocalParticipant with `isHandRaised`
- `src/components/meeting/ParticipantCard.tsx` - Show hand icon when raised
- `src/components/meeting/LiveMeetingRoomLocal.tsx` - Add control and visual queue

**UI behavior:**
- Hand icon appears on participant tile and card
- Participants with raised hands bubble to top of list
- Toast notification when someone raises hand
- Host can "lower all hands" with one click

### Phase 5: Waiting Room

Implement host approval flow for joining.

**Files to create:**
- `src/components/meeting/WaitingRoom.tsx` (new) - Waiting state UI
- `src/components/meeting/HostAdmitPanel.tsx` (new) - Host sees waiting participants

**Files to modify:**
- `src/hooks/useLocalMeeting.ts` - Add `waitingParticipants` state
- `src/components/meeting/MeetingOrchestrator.tsx` - Add "waiting" phase

**Flow:**
```text
Participant clicks Join
        |
        v
+-------------------+     Host has waiting room ON?     +------------------+
|  Pre-join Lobby   | --------------------------------> |  Waiting Room    |
+-------------------+              YES                  |  "Please wait"   |
        |                                               +------------------+
        | NO                                                    |
        v                                                       v
+-------------------+                                   +------------------+
|  Live Meeting     | <-------------------------------- |  Host admits     |
+-------------------+                                   +------------------+
```

### Phase 6: Recording (Local)

Implement browser-based recording using MediaRecorder API.

**Files to create:**
- `src/hooks/useLocalRecording.ts` (new) - MediaRecorder logic

**Files to modify:**
- `src/components/meeting/LiveMeetingRoomLocal.tsx` - Add recording controls
- `src/components/meeting/MeetingControlsReal.tsx` - Recording button with indicator

**Features:**
- Record to WebM format
- Red pulsing indicator visible to all
- Auto-download on stop
- Permission indicator for participants

### Phase 7: Spotlight View

Add third layout mode for pinning a specific participant.

**Files to modify:**
- `src/components/meeting/LiveMeetingRoomLocal.tsx` - Add spotlight layout logic
- `src/components/meeting/MeetingControlsReal.tsx` - Add spotlight button
- `src/components/meeting/ParticipantCard.tsx` - Add "Pin/Spotlight" action

**Behavior:**
- Click on participant to spotlight them
- They stay large even when not speaking
- Small "Exit spotlight" button to return to speaker view

### Phase 8: Chat Enhancements

Add system messages and join/leave notifications.

**Files to modify:**
- `src/hooks/useMeetingChat.ts` - Add system message support
- `src/components/meeting/ChatPanel.tsx` - Style system messages differently
- `src/hooks/useLocalMeeting.ts` - Emit join/leave events

**System messages include:**
- "Jordan Lee joined the meeting"
- "Alex Rivera left the meeting"  
- "Recording started"
- "Screen sharing started by You"

### Phase 9: Network Quality Display

Integrate the existing NetworkQuality component into the live meeting.

**Files to modify:**
- `src/hooks/useLocalMeeting.ts` - Add network quality monitoring
- `src/components/meeting/LiveMeetingRoomLocal.tsx` - Display in top bar

**Technical approach:**
- Monitor RTT using `performance.now()` timing
- Check frame drops on video track
- Display green/yellow/red indicator
- Show tooltip with "Connection: Good/Fair/Poor"

### Phase 10: Final Polish

**Join/Leave animations:**
- Soft scale-in animation when participant joins
- Fade-out when leaving
- Toast notification with participant name

**Micro-interactions:**
- Button hover scales (1.02x)
- Active speaker gentle border pulse
- Smooth layout transitions with spring physics

---

## Technical Details

### Screen Share Implementation

```typescript
// In useLocalMeeting.ts
const startScreenShare = useCallback(async () => {
  try {
    const screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: { cursor: "always" },
      audio: true
    });
    
    screenStreamRef.current = screenStream;
    setIsScreenSharing(true);
    
    // Handle user stopping share via browser UI
    screenStream.getVideoTracks()[0].onended = () => {
      stopScreenShare();
    };
  } catch (err) {
    // User cancelled or permission denied
    console.log("Screen share cancelled");
  }
}, []);
```

### Idle Detection Hook

```typescript
// useIdleDetection.ts
export function useIdleDetection(timeout = 4000) {
  const [isIdle, setIsIdle] = useState(false);
  
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    const resetTimer = () => {
      setIsIdle(false);
      clearTimeout(timer);
      timer = setTimeout(() => setIsIdle(true), timeout);
    };
    
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('click', resetTimer);
    
    resetTimer();
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('click', resetTimer);
    };
  }, [timeout]);
  
  return isIdle;
}
```

### Recording Implementation

```typescript
// useLocalRecording.ts
export function useLocalRecording(stream: MediaStream | null) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  
  const startRecording = useCallback(() => {
    if (!stream) return;
    
    const recorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9'
    });
    
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      // Auto-download
      const a = document.createElement('a');
      a.href = url;
      a.download = `meeting-${Date.now()}.webm`;
      a.click();
    };
    
    mediaRecorderRef.current = recorder;
    recorder.start(1000); // Capture every second
    setIsRecording(true);
  }, [stream]);
  
  return { isRecording, startRecording, stopRecording };
}
```

---

## File Summary

### New Files to Create:
1. `src/hooks/useIdleDetection.ts` - Mouse/keyboard idle tracking
2. `src/hooks/useLocalRecording.ts` - MediaRecorder wrapper
3. `src/components/meeting/FloatingControls.tsx` - Auto-hide controls wrapper
4. `src/components/meeting/WaitingRoom.tsx` - Waiting room UI
5. `src/components/meeting/HostAdmitPanel.tsx` - Host admission controls

### Files to Modify:
1. `src/hooks/useLocalMeeting.ts` - Screen share, host controls, raise hand, network quality
2. `src/components/meeting/LiveMeetingRoomLocal.tsx` - All new features integration
3. `src/components/meeting/MeetingControlsReal.tsx` - New control buttons
4. `src/components/meeting/ParticipantCard.tsx` - Host actions, raise hand icon
5. `src/components/meeting/ParticipantsList.tsx` - Mute all, raise hand sorting
6. `src/components/meeting/ChatPanel.tsx` - System messages
7. `src/hooks/useMeetingChat.ts` - System message support
8. `src/components/meeting/MeetingOrchestrator.tsx` - Waiting room phase
9. `src/types/meeting.ts` - Extended participant types

---

## Priority Order

1. **Screen Sharing** - Most requested feature gap
2. **Auto-Hide Controls** - Critical for "calm" UX
3. **Host Controls** - Required for real meetings
4. **Raise Hand** - Basic meeting etiquette
5. **Recording** - Common expectation
6. **Chat System Messages** - Polished experience
7. **Waiting Room** - Security feature
8. **Spotlight View** - Advanced layout
9. **Network Quality** - Technical polish
10. **Final Animations** - Premium feel

This plan delivers 100% Zoom/Meet/Teams parity with a dramatically superior, calm, and intelligent user experience.
