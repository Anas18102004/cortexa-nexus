import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface AnalyzeRequest {
  action: "summarize" | "decisions" | "actions" | "transcribe";
  transcript: string;
  context?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    console.error("LOVABLE_API_KEY is not configured");
    return new Response(
      JSON.stringify({ error: "AI API key not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const { action, transcript, context } = (await req.json()) as AnalyzeRequest;

    let systemPrompt = "";
    let userPrompt = "";

    switch (action) {
      case "summarize":
        systemPrompt = `You are Nova AI, an intelligent meeting assistant. You provide concise, actionable summaries of meeting discussions. Focus on key points, decisions made, and next steps. Be professional but conversational.`;
        userPrompt = `Summarize the following meeting transcript in 3-5 bullet points:\n\n${transcript}`;
        break;

      case "decisions":
        systemPrompt = `You are Nova AI, specialized in extracting decisions from meetings. Identify clear decisions, who owns them, and their status (proposed, confirmed, or deferred).`;
        userPrompt = `Extract all decisions from this meeting transcript. For each decision, provide:
- Content: The decision made
- Owner: Who is responsible
- Status: proposed/confirmed/deferred

Transcript:\n${transcript}

${context ? `Context: ${context}` : ""}

Return as JSON array: [{"content": "...", "owner": "...", "status": "..."}]`;
        break;

      case "actions":
        systemPrompt = `You are Nova AI, specialized in extracting action items from meetings. Identify tasks, assignees, priorities, and deadlines.`;
        userPrompt = `Extract all action items from this meeting transcript. For each action:
- Task: What needs to be done
- Assignee: Who is responsible
- Priority: low/medium/high
- Deadline: If mentioned (ISO date format or null)

Transcript:\n${transcript}

${context ? `Context: ${context}` : ""}

Return as JSON array: [{"task": "...", "assignee": "...", "priority": "...", "deadline": null}]`;
        break;

      case "transcribe":
        systemPrompt = `You are Nova AI. Clean up and format the provided speech-to-text transcription. Fix grammar, punctuation, and speaker attribution where possible. Maintain the original meaning.`;
        userPrompt = `Clean up this transcription:\n\n${transcript}`;
        break;

      default:
        return new Response(JSON.stringify({ error: "Invalid action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited. Please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add more credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content || "";

    // Parse JSON responses for decisions and actions
    let result: any = content;
    if (action === "decisions" || action === "actions") {
      try {
        // Extract JSON from the response
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.error("Failed to parse AI response as JSON:", e);
        result = [];
      }
    }

    console.log(`AI ${action} completed successfully`);
    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in meeting-ai function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
