import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subjectId, subjectName } = await req.json();

    if (!subjectId || !subjectName) {
      return new Response(JSON.stringify({ error: "Missing subjectId or subjectName" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check cache
    const { data: cached } = await supabase
      .from("subject_summaries")
      .select("content")
      .eq("subject_id", subjectId)
      .maybeSingle();

    if (cached?.content) {
      return new Response(JSON.stringify({ content: cached.content }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate with AI
    const prompt = `Você é um especialista em ENEM. Gere um resumo essencial do tema "${subjectName}" para um estudante do ENEM.

Retorne um JSON array com exatamente 4 seções:
[
  {"title": "O que mais cai no ENEM", "items": ["tópico 1", "tópico 2", "tópico 3"]},
  {"title": "Erros comuns dos alunos", "items": ["erro 1", "erro 2", "erro 3"]},
  {"title": "Armadilhas de prova", "items": ["armadilha 1", "armadilha 2"]},
  {"title": "Dica prática para acertar", "items": ["dica 1", "dica 2"]}
]

Cada item deve ter no máximo 2 frases. Linguagem clara, direta, sem jargões. Total de leitura: menos de 5 minutos. Retorne APENAS o JSON, sem markdown.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    if (content) {
      // Cache in database
      await supabase
        .from("subject_summaries")
        .upsert({ subject_id: subjectId, content, generated_at: new Date().toISOString() }, { onConflict: "subject_id" });
    }

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
