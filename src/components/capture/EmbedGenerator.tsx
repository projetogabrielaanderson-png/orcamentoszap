import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCRM } from '@/contexts/CRMContext';
import { Copy, Check, Code2, Link2 } from 'lucide-react';
import { toast } from 'sonner';
import type { FormConfig } from './FormEditor';

interface EmbedGeneratorProps {
  formConfig: FormConfig;
}

export function EmbedGenerator({ formConfig }: EmbedGeneratorProps) {
  const [siteUrl, setSiteUrl] = useState('https://meusite.com');
  const [copied, setCopied] = useState<'embed' | 'link' | null>(null);
  const { user } = useCRM();

<<<<<<< HEAD
  const baseUrl = 'https://whatsapp.assistenciatecnica.maringa.br';
=======
  const baseUrl = window.location.origin;
>>>>>>> e96d3b3 (Deploy to Vercel and dynamic URL setup)
  const ownerId = user?.id ?? '';

  const directLink = `${baseUrl}/form?category_id=${formConfig.category_id}&owner=${encodeURIComponent(ownerId)}&origin=${encodeURIComponent(siteUrl)}`;

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const edgeEndpoint = `${supabaseUrl}/functions/v1/receive-lead`;

  const embedCode = `<!-- LeadFlow - Formulário de Captação -->
<div id="leadflow-form" style="max-width:480px;margin:0 auto;font-family:system-ui,sans-serif">
  <form action="${edgeEndpoint}" method="POST" style="display:flex;flex-direction:column;gap:12px;padding:24px;border:1px solid #e2e8f0;border-radius:12px;background:#fff">
    <h3 style="margin:0;font-size:18px;font-weight:600;color:#1e293b">${formConfig.title}</h3>
    <input name="name" placeholder="Seu nome" required style="padding:10px 14px;border:1px solid #e2e8f0;border-radius:8px;font-size:14px" />
    <input name="phone" placeholder="WhatsApp (ex: 11999990000)" required style="padding:10px 14px;border:1px solid #e2e8f0;border-radius:8px;font-size:14px" />
    <textarea name="message" placeholder="Descreva o que precisa..." rows="3" style="padding:10px 14px;border:1px solid #e2e8f0;border-radius:8px;font-size:14px;resize:vertical"></textarea>
    <input type="hidden" name="origin_url" value="${siteUrl}" />
    <input type="hidden" name="user_id" value="${ownerId}" />
    <input type="hidden" name="category_id" value="${formConfig.category_id}" />
    <button type="submit" style="padding:12px;background:${formConfig.primary_color};color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer">Enviar</button>
  </form>
</div>`;

  const handleCopy = (text: string, type: 'embed' | 'link') => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    toast.success('Copiado!');
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <div className="space-y-2">
          <Label>URL do seu site</Label>
          <Input value={siteUrl} onChange={e => setSiteUrl(e.target.value)} placeholder="https://meusite.com" />
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Link2 className="h-4 w-4" /> Link Direto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Input value={directLink} readOnly className="text-xs" />
              <Button variant="outline" size="icon" onClick={() => handleCopy(directLink, 'link')}>
                {copied === 'link' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Code2 className="h-4 w-4" /> Código HTML Embedável
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="max-h-48 overflow-auto rounded-lg bg-muted p-4 text-xs scrollbar-thin">
              <code>{embedCode}</code>
            </pre>
            <Button variant="outline" size="sm" className="mt-3 gap-1.5" onClick={() => handleCopy(embedCode, 'embed')}>
              {copied === 'embed' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied === 'embed' ? 'Copiado!' : 'Copiar código'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Preview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl p-6" style={{ backgroundColor: formConfig.bg_color }}>
            <div className="mx-auto max-w-md rounded-2xl bg-white p-6 shadow-lg">
              {formConfig.logo_url && <img src={formConfig.logo_url} alt="Logo" className="mx-auto mb-3 h-10 object-contain" />}
              <h3 className="text-lg font-semibold" style={{ color: '#1e293b' }}>{formConfig.title}</h3>
              <p className="text-sm text-gray-500">{formConfig.description}</p>
              <div className="mt-4 space-y-2">
                <input disabled placeholder="Seu nome" className="w-full rounded-lg border px-3 py-2 text-sm opacity-50" />
                <input disabled placeholder="WhatsApp" className="w-full rounded-lg border px-3 py-2 text-sm opacity-50" />
                <textarea disabled placeholder="Mensagem..." rows={2} className="w-full rounded-lg border px-3 py-2 text-sm opacity-50 resize-none" />
                <button disabled className="w-full rounded-lg py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: formConfig.primary_color }}>Enviar</button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
