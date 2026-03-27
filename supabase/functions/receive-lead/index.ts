import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let body: Record<string, string>;
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      body = await req.json();
    } else if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      body = {};
      formData.forEach((value, key) => {
        body[key] = value.toString();
      });
    } else {
      // Try JSON fallback
      body = await req.json();
    }

    const name = (body.name || "").trim();
    const phone = (body.phone || "").trim();
    const message = (body.message || "").trim();
    const originUrl = (body.origin_url || "").trim();
    const utmSource = (body.utm_source || "").trim();
    const utmMedium = (body.utm_medium || "").trim();
    const utmCampaign = (body.utm_campaign || "").trim();
    const categoryId = (body.category_id || "").trim();

    if (!name || !phone) {
      return new Response(JSON.stringify({ error: "Nome e telefone são obrigatórios" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get default category if none provided
    let finalCategoryId = categoryId;
    if (!finalCategoryId) {
      const { data: categories } = await supabase
        .from("categories")
        .select("id")
        .limit(1)
        .single();
      finalCategoryId = categories?.id || "";
    }

    if (!finalCategoryId) {
      return new Response(JSON.stringify({ error: "Nenhuma categoria encontrada" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Find a user to assign (first user with a professional in this category, or first user)
    const { data: professional } = await supabase
      .from("professionals")
      .select("user_id")
      .eq("category_id", finalCategoryId)
      .limit(1)
      .single();

    const userId = professional?.user_id;

    if (!userId) {
      // Fallback: get any user from professionals table
      const { data: anyPro } = await supabase
        .from("professionals")
        .select("user_id")
        .limit(1)
        .single();

      if (!anyPro?.user_id) {
        return new Response(JSON.stringify({ error: "Nenhum usuário cadastrado para receber leads" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: lead, error } = await supabase.from("leads").insert({
        name,
        phone,
        message,
        origin_url: originUrl,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        category_id: finalCategoryId,
        user_id: anyPro.user_id,
        status: "novo",
      }).select().single();

      if (error) {
        console.error("Insert error:", error);
        return new Response(JSON.stringify({ error: "Erro ao salvar lead" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true, lead_id: lead.id }), {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: lead, error } = await supabase.from("leads").insert({
      name,
      phone,
      message,
      origin_url: originUrl,
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: utmCampaign,
      category_id: finalCategoryId,
      user_id: userId,
      status: "novo",
    }).select().single();

    if (error) {
      console.error("Insert error:", error);
      return new Response(JSON.stringify({ error: "Erro ao salvar lead" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, lead_id: lead.id }), {
      status: 201,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Erro interno" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
