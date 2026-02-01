import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface CreateRoomRequest {
  meetingId: string;
  meetingTitle: string;
}

interface JoinRoomRequest {
  roomName: string;
  userName: string;
  userId: string;
  isOwner?: boolean;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const DAILY_API_KEY = Deno.env.get("DAILY_API_KEY");
  if (!DAILY_API_KEY) {
    console.error("DAILY_API_KEY is not configured");
    return new Response(
      JSON.stringify({ error: "Daily.co API key not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.split("/").pop();

    if (path === "create" && req.method === "POST") {
      // Create a new Daily.co room
      const { meetingId, meetingTitle } = (await req.json()) as CreateRoomRequest;
      
      const roomName = `cortexa-${meetingId.slice(0, 8)}`;
      
      const response = await fetch("https://api.daily.co/v1/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${DAILY_API_KEY}`,
        },
        body: JSON.stringify({
          name: roomName,
          properties: {
            enable_screenshare: true,
            enable_chat: true,
            enable_recording: "cloud",
            start_video_off: false,
            start_audio_off: false,
            max_participants: 20,
            exp: Math.floor(Date.now() / 1000) + 86400, // 24 hours
          },
        }),
      });

      if (!response.ok) {
        // Room might already exist, try to get it
        if (response.status === 400) {
          const getResponse = await fetch(`https://api.daily.co/v1/rooms/${roomName}`, {
            headers: { Authorization: `Bearer ${DAILY_API_KEY}` },
          });
          
          if (getResponse.ok) {
            const room = await getResponse.json();
            console.log("Room already exists:", roomName);
            return new Response(JSON.stringify({ room }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        }
        
        const error = await response.text();
        console.error("Failed to create room:", error);
        throw new Error(`Failed to create room: ${error}`);
      }

      const room = await response.json();
      console.log("Room created:", room.name);
      
      return new Response(JSON.stringify({ room }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (path === "token" && req.method === "POST") {
      // Generate a meeting token for a participant
      const { roomName, userName, userId, isOwner } = (await req.json()) as JoinRoomRequest;

      const response = await fetch("https://api.daily.co/v1/meeting-tokens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${DAILY_API_KEY}`,
        },
        body: JSON.stringify({
          properties: {
            room_name: roomName,
            user_name: userName,
            user_id: userId,
            is_owner: isOwner || false,
            enable_screenshare: true,
            enable_recording: isOwner ? "cloud" : false,
            start_video_off: false,
            start_audio_off: true,
            exp: Math.floor(Date.now() / 1000) + 86400,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("Failed to create token:", error);
        throw new Error(`Failed to create meeting token: ${error}`);
      }

      const { token } = await response.json();
      console.log("Token created for user:", userName);
      
      return new Response(JSON.stringify({ token }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (path === "delete" && req.method === "POST") {
      // Delete a room when meeting ends
      const { roomName } = await req.json();

      const response = await fetch(`https://api.daily.co/v1/rooms/${roomName}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${DAILY_API_KEY}` },
      });

      if (!response.ok && response.status !== 404) {
        const error = await response.text();
        console.error("Failed to delete room:", error);
      }

      console.log("Room deleted:", roomName);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown endpoint" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in daily-rooms function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
