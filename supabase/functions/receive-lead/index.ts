import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type LeadPayload = {
  name?: string;
  phone?: string;
  message?: string;
  origin_url?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  category_id?: string;
  user_id?: string;
  owner?: string;
};

const normalize = (value: unknown) => (typeof value === "string" ? value.trim() : "");

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
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(JSON.stringify({ error: "Server configuration error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let rawBody: LeadPayload = {};
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      rawBody = (await req.json()) as LeadPayload;
    } else if (
      contentType.includes("application/x-www-form-urlencoded") ||
      contentType.includes("multipart/form-data")
    ) {
      const formData = await req.formData();
      const mapped: Record<string, string> = {};
      formData.forEach((value, key) => {
        mapped[key] = value.toString();
      });
      rawBody = mapped;
    } else {
      rawBody = (await req.json()) as LeadPayload;
    }

    const name = normalize(rawBody.name);
    const phone = normalize(rawBody.phone);
    const message = normalize(rawBody.message);
    const originUrl = normalize(rawBody.origin_url);
    const utmSource = normalize(rawBody.utm_source);
    const utmMedium = normalize(rawBody.utm_medium);
    const utmCampaign = normalize(rawBody.utm_campaign);
    let categoryId = normalize(rawBody.category_id);
    let userId = normalize(rawBody.user_id) || normalize(rawBody.owner);

    console.log("Processing lead:", { name, phone, categoryId, userId, originUrl });

    if (!name || name.length < 2 || name.length > 120) {
      console.warn("Invalid name:", name);
      return new Response(JSON.stringify({ error: "Nome inválido (mínimo 2 caracteres)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const phoneDigits = phone.replace(/\D/g, "");
    if (!phoneDigits || phoneDigits.length < 10 || phoneDigits.length > 15) {
      console.warn("Invalid phone:", phone);
      return new Response(JSON.stringify({ error: "Telefone inválido (insira DDD + número)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!categoryId) {
      console.warn("Lead recebido sem category_id");
      return new Response(JSON.stringify({ error: "Categoria não informada. Verifique o formulário/embed (campo category_id)." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Valida que a categoria informada realmente existe
    const { data: catExists } = await supabase
      .from("categories")
      .select("id")
      .eq("id", categoryId)
      .maybeSingle();

    if (!catExists) {
      console.warn(`category_id ${categoryId} não existe no banco`);
      return new Response(JSON.stringify({ error: "Categoria informada não existe. Regenere o embed/link do formulário." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }


    if (!userId) {
      console.info("User ID is empty, fetching default professional...");
    } else {
      // Check if provided userId actually belongs to a professional
      const { data: profExists } = await supabase
        .from("professionals")
        .select("user_id")
        .eq("user_id", userId)
        .maybeSingle();

      if (!profExists) {
        console.warn(`Provided user_id ${userId} is not associated with any professional. Finding fallback...`);
        userId = ""; // Reset to trigger fallback fetch
      }
    }

    if (!userId) {
      console.info("Missing user_id/owner, trying to find first professional...");
      const { data: leadOwner } = await supabase
        .from("professionals")
        .select("user_id")
        .limit(1)
        .single();

      userId = leadOwner?.user_id ?? "";
    }

    if (!userId) {
      console.warn("No user_id provided and no professional found in database");
      return new Response(JSON.stringify({ error: "Sua solicitação não pôde ser atribuída a um profissional. Verifique se há profissionais cadastrados no sistema." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Saving lead to DB for user:", userId);

    const { data: lead, error } = await supabase
      .from("leads")
      .insert({
        name,
        phone: phoneDigits,
        message,
        origin_url: originUrl,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        category_id: categoryId,
        user_id: userId,
        status: "new",
      })

      .select("id")
      .single();

    if (error || !lead) {
      console.error("Database insert error:", { message: error?.message, code: error?.code });
      return new Response(JSON.stringify({ error: `Erro ao salvar lead na base: ${error?.message || 'Erro desconhecido'}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Lead saved successfully:", lead.id);

    return new Response(JSON.stringify({ success: true, lead_id: lead.id }), {
      status: 201,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Critical/Unexpected error in function:", err);
    return new Response(JSON.stringify({ error: `Erro interno ao processar lead: ${(err as Error).message || 'Erro inesperado'}` }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

