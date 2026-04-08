import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCRM } from '@/contexts/CRMContext';
import { Copy, Check, Code2, Link2, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { FormConfig } from './FormEditor';

interface EmbedGeneratorProps {
  formConfig: FormConfig;
}

function generateWhatsAppWidgetHTML(config: FormConfig, whatsappNumber: string, siteUrl: string, edgeEndpoint: string, ownerId: string) {
  const c = config.primary_color || '#075E54';
  return `<!-- Widget WhatsApp -->
<style>
.wb{position:fixed;bottom:24px;right:24px;z-index:9999;width:60px;height:60px;border-radius:50%;border:none;cursor:pointer;background:#25D366;box-shadow:0 4px 16px rgba(0,0,0,.25);display:flex;align-items:center;justify-content:center;transition:transform .2s;animation:wp 2s infinite}
.wb:hover{transform:scale(1.1)}.wb:active{transform:scale(.95)}
@keyframes wp{0%,100%{box-shadow:0 0 0 0 rgba(37,211,102,.4)}70%{box-shadow:0 0 0 16px rgba(37,211,102,0)}}
.wo{position:fixed;inset:0;z-index:10000;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.6);backdrop-filter:blur(4px);padding:16px}
.wo.open{display:flex}
.wm{width:100%;max-width:400px;border-radius:16px;overflow:hidden;background:#fff;box-shadow:0 20px 60px rgba(0,0,0,.3);animation:wz .3s ease;font-family:system-ui,sans-serif}
@keyframes wz{from{opacity:0;transform:scale(.92)}to{opacity:1;transform:scale(1)}}
.wh{padding:16px 20px;background:${c};display:flex;align-items:center;gap:12px;position:relative}
.wh h2{font-size:16px;font-weight:600;color:#fff;margin:0}
.wh p{font-size:12px;color:rgba(255,255,255,.8);margin:2px 0 0}
.wh p::before{content:'';width:8px;height:8px;border-radius:50%;background:#4ade80;display:inline-block;margin-right:4px}
.wx{position:absolute;right:12px;top:12px;width:28px;height:28px;border:none;border-radius:50%;background:transparent;cursor:pointer;color:rgba(255,255,255,.7);font-size:20px;display:flex;align-items:center;justify-content:center}
.wx:hover{background:rgba(255,255,255,.2);color:#fff}
.wf{padding:20px;display:flex;flex-direction:column;gap:14px}
.wf label{display:block;font-size:14px;font-weight:500;color:#1f2937;margin-bottom:4px}
.wf input,.wf textarea{width:100%;padding:10px 12px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;outline:none;transition:border-color .2s}
.wf textarea{height:72px;resize:vertical}
.wf input:focus,.wf textarea:focus{border-color:#25D366;box-shadow:0 0 0 3px rgba(37,211,102,.15)}
.wf .er{border-color:#ef4444!important}
.we{font-size:12px;color:#ef4444;margin-top:2px;display:none}
.we.s{display:block}
.wk{display:flex;align-items:flex-start;gap:8px;cursor:pointer;font-size:12px;color:#6b7280}
.wk input{margin-top:2px;accent-color:#25D366}
.wk a{color:${c};text-decoration:underline}
.ws{width:100%;height:44px;border:none;border-radius:8px;background:#25D366;color:#fff;font-size:14px;font-weight:600;cursor:pointer;transition:filter .2s}
.ws:hover{filter:brightness(1.1)}.ws:disabled{opacity:.6;cursor:not-allowed}
@media(max-width:480px){.wm{max-width:100%;border-radius:12px}.wo{padding:8px}}
</style>
<button class="wb" id="wB">💬</button>
<div class="wo" id="wO">
<div class="wm">
<div class="wh">
<div><h2>${config.title}</h2><p>Online agora</p></div>
<button class="wx" id="wX">&times;</button>
</div>
<form class="wf" id="wF" novalidate>
<div><label>Nome</label><input type="text" id="wn" placeholder="Seu nome completo"><p class="we" id="en">Informe seu nome</p></div>
<div><label>Telefone / WhatsApp</label><input type="tel" id="wp" placeholder="(11) 99999-9999" inputmode="numeric"><p class="we" id="ep">Telefone inválido</p></div>
<div><label>Mensagem</label><textarea id="wg" placeholder="Descreva o que precisa..."></textarea></div>
<label class="wk"><input type="checkbox" id="wa"><span>Li e aceito a <a href="${siteUrl}/privacidade" target="_blank">Política de Privacidade</a> e os <a href="${siteUrl}/termos" target="_blank">Termos de Uso</a></span></label>
<p class="we" id="ea" style="margin-top:-6px">Aceite os termos</p>
<button type="submit" class="ws" id="wS">💬 Iniciar Conversa</button>
</form>
</div>
</div>
<script>
(function(){
var $=function(i){return document.getElementById(i)},o=$('wO'),f=$('wF'),n=$('wn'),p=$('wp'),g=$('wg'),a=$('wa'),s=$('wS'),busy=0;
$('wB').onclick=function(){o.classList.add('open');n.focus()};
$('wX').onclick=function(){o.classList.remove('open')};
o.onclick=function(e){e.target===o&&o.classList.remove('open')};
document.onkeydown=function(e){e.key==='Escape'&&o.classList.remove('open')};
p.oninput=function(){var d=this.value.replace(/\\D/g,'').slice(0,11);this.value=d.length<=2?(d.length?'('+d:''):d.length<=7?'('+d.slice(0,2)+') '+d.slice(2):'('+d.slice(0,2)+') '+d.slice(2,7)+'-'+d.slice(7);ep.classList.remove('s');this.classList.remove('er')};
n.oninput=function(){$('en').classList.remove('s');this.classList.remove('er')};
a.onchange=function(){$('ea').classList.remove('s')};
f.onsubmit=function(e){
e.preventDefault();if(busy)return;
var v=1,nm=n.value.trim(),dg=p.value.replace(/\\D/g,''),mg=g.value.trim();
if(!nm){$('en').classList.add('s');n.classList.add('er');v=0}
if(dg.length<10||dg.length>11){$('ep').classList.add('s');p.classList.add('er');v=0}
if(!a.checked){$('ea').classList.add('s');v=0}
if(!v)return;
busy=1;s.disabled=1;s.textContent='Abrindo WhatsApp…';
var ph=dg.indexOf('55')===0?dg:'55'+dg;
fetch('${edgeEndpoint}',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:nm,phone:ph,message:mg,user_id:'${ownerId}',category_id:'${config.category_id}',origin_url:'${siteUrl}'})}).catch(function(){});
var msg=encodeURIComponent('Olá! Meu nome é '+nm+'.\\n'+(mg?mg+'\\n':'')+'Tel: +'+ph);
var url=/Android|iPhone|iPad/i.test(navigator.userAgent)?'https://wa.me/${whatsappNumber}?text='+msg:'https://web.whatsapp.com/send?phone=${whatsappNumber}&text='+msg;
window.open(url,'_blank');
setTimeout(function(){f.reset();o.classList.remove('open');busy=0;s.disabled=0;s.textContent='💬 Iniciar Conversa'},500);
};
})();
</script>`;
}

export function EmbedGenerator({ formConfig }: EmbedGeneratorProps) {
  const [siteUrl, setSiteUrl] = useState('https://meusite.com');
  const [whatsappNumber, setWhatsappNumber] = useState('5511999999999');
  const [copied, setCopied] = useState<'embed' | 'link' | 'widget' | null>(null);
  const { user } = useCRM();

  const baseUrl = 'https://orcamentoszap.lovable.app';
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

  const widgetCode = generateWhatsAppWidgetHTML(formConfig, whatsappNumber, siteUrl, edgeEndpoint, ownerId);

  const handleCopy = (text: string, type: 'embed' | 'link' | 'widget') => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    toast.success('Copiado!');
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Config inputs */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>URL do seu site</Label>
          <Input value={siteUrl} onChange={e => setSiteUrl(e.target.value)} placeholder="https://meusite.com" />
        </div>
        <div className="space-y-2">
          <Label>Número WhatsApp (com DDI)</Label>
          <Input value={whatsappNumber} onChange={e => setWhatsappNumber(e.target.value.replace(/\D/g, ''))} placeholder="5511999999999" />
        </div>
      </div>

      {/* Link direto */}
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

      {/* Tabs: Embed simples vs Widget WhatsApp */}
      <Tabs defaultValue="widget">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="widget" className="gap-1.5 text-xs">
            <MessageCircle className="h-3.5 w-3.5" /> Widget WhatsApp
          </TabsTrigger>
          <TabsTrigger value="embed" className="gap-1.5 text-xs">
            <Code2 className="h-3.5 w-3.5" /> Formulário Embed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="widget" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Botão flutuante WhatsApp + Modal de captura
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Cole antes do <code className="rounded bg-muted px-1 py-0.5 font-mono">&lt;/body&gt;</code> do seu site. Inclui botão flutuante, modal com formulário, máscara de telefone e integração automática com o CRM.
              </p>
            </CardHeader>
            <CardContent>
              <pre className="max-h-64 overflow-auto rounded-lg bg-muted p-4 text-xs scrollbar-thin">
                <code>{widgetCode}</code>
              </pre>
              <Button variant="outline" size="sm" className="mt-3 gap-1.5" onClick={() => handleCopy(widgetCode, 'widget')}>
                {copied === 'widget' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied === 'widget' ? 'Copiado!' : 'Copiar Widget HTML'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="embed" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Formulário HTML simples</CardTitle>
              <p className="text-xs text-muted-foreground">
                Formulário estático para integrar em qualquer página.
              </p>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
