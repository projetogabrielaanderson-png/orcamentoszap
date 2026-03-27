import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, ExternalLink, Code2, Link2 } from 'lucide-react';
import { toast } from 'sonner';

export function EmbedGenerator() {
  const [siteUrl, setSiteUrl] = useState('https://meusite.com');
  const [copied, setCopied] = useState<'embed' | 'link' | null>(null);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const edgeEndpoint = `${supabaseUrl}/functions/v1/receive-lead`;
  const formPageUrl = `https://orcamentoszap.lovable.app/form`;

  const embedCode = `<!-- LeadFlow - Formulário de Captação -->
<div id="leadflow-form" style="max-width:480px;margin:0 auto;font-family:system-ui,sans-serif">
  <form action="${formEndpoint}" method="POST" style="display:flex;flex-direction:column;gap:12px;padding:24px;border:1px solid #e2e8f0;border-radius:12px;background:#fff">
    <h3 style="margin:0;font-size:18px;font-weight:600;color:#1e293b">Solicite um Orçamento</h3>
    <input name="name" placeholder="Seu nome" required style="padding:10px 14px;border:1px solid #e2e8f0;border-radius:8px;font-size:14px" />
    <input name="phone" placeholder="WhatsApp (ex: 11999990000)" required style="padding:10px 14px;border:1px solid #e2e8f0;border-radius:8px;font-size:14px" />
    <textarea name="message" placeholder="Descreva o que precisa..." rows="3" required style="padding:10px 14px;border:1px solid #e2e8f0;border-radius:8px;font-size:14px;resize:vertical"></textarea>
    <input type="hidden" name="origin_url" value="${siteUrl}" />
    <button type="submit" style="padding:12px;background:#3b82f6;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer">Enviar</button>
  </form>
</div>`;

  const directLink = `${formEndpoint}?origin=${encodeURIComponent(siteUrl)}`;

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

        {/* Embed code */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Code2 className="h-4 w-4" />
              Código HTML Embedável
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="max-h-48 overflow-auto rounded-lg bg-muted p-4 text-xs scrollbar-thin">
              <code>{embedCode}</code>
            </pre>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 gap-1.5"
              onClick={() => handleCopy(embedCode, 'embed')}
            >
              {copied === 'embed' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied === 'embed' ? 'Copiado!' : 'Copiar código'}
            </Button>
          </CardContent>
        </Card>

        {/* Direct link */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Link2 className="h-4 w-4" />
              Link Direto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Input value={directLink} readOnly className="text-xs" />
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleCopy(directLink, 'link')}
              >
                {copied === 'link' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ExternalLink className="h-4 w-4" />
            Preview do Formulário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border bg-background p-6">
            <h3 className="text-lg font-semibold">Solicite um Orçamento</h3>
            <div className="mt-4 space-y-3">
              <Input placeholder="Seu nome" disabled />
              <Input placeholder="WhatsApp (ex: 11999990000)" disabled />
              <textarea
                placeholder="Descreva o que precisa..."
                rows={3}
                disabled
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground disabled:opacity-50"
              />
              <Button className="w-full" disabled>Enviar</Button>
            </div>
            <Badge variant="secondary" className="mt-3 text-[10px]">
              Origem: {siteUrl}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
