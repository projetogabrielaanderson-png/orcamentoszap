import { createClient } from 'jsr:@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const VAPID_PUBLIC = Deno.env.get('VAPID_PUBLIC_KEY')!;
const VAPID_PRIVATE = Deno.env.get('VAPID_PRIVATE_KEY')!;
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:contato@orcamentoszap.lovable.app';

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);

function render(tpl: string, vars: Record<string, string>): string {
  return (tpl || '').replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) => vars[k] ?? '');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body = await req.json();
    const {
      user_id,
      lead_name,
      lead_phone,
      lead_id,
      category_id,
      is_test,
    } = body ?? {};
    if (!user_id) {
      return new Response(JSON.stringify({ error: 'Missing user_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Busca subscriptions, settings e categoria em paralelo
    const [subsRes, settingsRes, categoryRes] = await Promise.all([
      admin.from('push_subscriptions').select('id, endpoint, p256dh, auth').eq('user_id', user_id),
      admin
        .from('user_settings')
        .select('company_name, push_title_template, push_body_template, push_sound, push_vibrate')
        .eq('user_id', user_id)
        .maybeSingle(),
      category_id
        ? admin.from('categories').select('name').eq('id', category_id).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    ]);

    if (subsRes.error) throw subsRes.error;
    const subs = subsRes.data ?? [];

    if (subs.length === 0) {
      return new Response(JSON.stringify({ ok: true, sent: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const settings = settingsRes.data ?? ({} as any);
    const titleTpl = settings.push_title_template || '🔔 Novo Lead — {{empresa}}';
    const bodyTpl = settings.push_body_template || '{{nome}} • {{telefone}}';
    const sound = settings.push_sound ?? 'default';
    const vibrate = settings.push_vibrate ?? true;
    const empresa = settings.company_name || 'CRM ZAP';
    const categoria = (categoryRes.data as any)?.name ?? '';

    const vars = {
      nome: lead_name ?? '',
      telefone: lead_phone ?? '',
      categoria,
      empresa,
    };

    const title = render(titleTpl, vars).trim() || `🔔 Novo Lead — ${empresa}`;
    const bodyText = render(bodyTpl, vars).trim() || (lead_name ?? 'Novo lead recebido');

    const payload = JSON.stringify({
      title: is_test ? `[TESTE] ${title}` : title,
      body: bodyText,
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      sound,
      vibrate,
      data: { url: '/kanban', lead_id, sound },
    });

    const expired: string[] = [];
    let sent = 0;
    await Promise.all(
      subs.map(async (s) => {
        try {
          await webpush.sendNotification(
            { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
            payload
          );
          sent++;
        } catch (err: any) {
          const status = err?.statusCode;
          if (status === 404 || status === 410) expired.push(s.endpoint);
        }
      })
    );

    if (expired.length > 0) {
      await admin.from('push_subscriptions').delete().in('endpoint', expired);
    }

    return new Response(JSON.stringify({ ok: true, sent, removed: expired.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
