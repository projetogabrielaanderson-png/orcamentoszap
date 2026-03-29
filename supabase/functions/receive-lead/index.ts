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

    if (!name || name.length < 2 || name.length > 120) {
      return new Response(JSON.stringify({ error: "Nome inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const phoneDigits = phone.replace(/\D/g, "");
    if (!phoneDigits || phoneDigits.length < 10 || phoneDigits.length > 15) {
      return new Response(JSON.stringify({ error: "Telefone inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!categoryId) {
      const { data: category, error: categoryError } = await supabase
        .from("categories")
        .select("id")
        .limit(1)
        .single();

      if (categoryError || !category?.id) {
        return new Response(JSON.stringify({ error: "Nenhuma categoria disponível" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      categoryId = category.id;
    }

    if (!userId) {
      const { data: leadOwner } = await supabase
        .from("professionals")
        .select("user_id")
        .limit(1)
        .single();

      userId = leadOwner?.user_id ?? "";
    }

    if (!userId) {
      return new Response(JSON.stringify({ error: "Lead sem proprietário (owner/user_id)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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
      console.error("Insert error", { message: error?.message, code: error?.code });
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
    console.error("Unexpected error", err);
    return new Response(JSON.stringify({ error: "Erro interno" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
