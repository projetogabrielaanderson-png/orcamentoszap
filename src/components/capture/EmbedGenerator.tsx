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
  return `<!-- Widget WhatsApp Glassmorphism -->
<style>
.wb{position:fixed;bottom:24px;right:24px;z-index:9999;width:60px;height:60px;border-radius:50%;border:none;cursor:pointer;background:#25D366;box-shadow:0 4px 24px rgba(37,211,102,.45);display:flex;align-items:center;justify-content:center;transition:transform .2s;animation:wp 2s infinite}
.wb:hover{transform:scale(1.1)}.wb:active{transform:scale(.95)}
.wb img{width:36px;height:36px;object-fit:contain;transition:transform .3s}.wb:hover img{transform:rotate(15deg)}
@keyframes wp{0%,100%{box-shadow:0 0 0 0 rgba(37,211,102,.4)}70%{box-shadow:0 0 0 16px rgba(37,211,102,0)}}
.wo{position:fixed;inset:0;z-index:10000;display:none;align-items:flex-end;justify-content:center;background:rgba(0,0,0,.4);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);padding:0}
.wo.open{display:flex}
@media(min-width:640px){.wo{align-items:center;padding:16px}}
.wm{width:100%;max-width:420px;border-radius:24px 24px 0 0;overflow:hidden;background:rgba(255,255,255,.72);backdrop-filter:blur(20px) saturate(180%);-webkit-backdrop-filter:blur(20px) saturate(180%);border:1px solid rgba(255,255,255,.45);box-shadow:0 8px 60px rgba(0,0,0,.12),inset 0 1px 0 rgba(255,255,255,.6);animation:wz .3s ease;font-family:system-ui,sans-serif}
@media(min-width:640px){.wm{border-radius:16px}}
@keyframes wz{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}
@media(min-width:640px){@keyframes wz{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}}
.wh{padding:20px 24px;background:linear-gradient(135deg,rgba(7,94,84,.95),rgba(18,140,126,.95));display:flex;align-items:center;gap:14px;position:relative;overflow:hidden}
.wh::before{content:'';position:absolute;right:-32px;top:-32px;width:112px;height:112px;border-radius:50%;background:rgba(255,255,255,.1);filter:blur(8px)}
.wh h2{font-size:15px;font-weight:600;color:#fff;margin:0}
.wh .st{font-size:11px;color:rgba(167,243,208,.9);margin:4px 0 0;display:flex;align-items:center;gap:6px}
.wh .st::before{content:'';width:8px;height:8px;border-radius:50%;background:#4ade80;box-shadow:0 0 6px rgba(52,211,153,.6)}
.wav{width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,.15);backdrop-filter:blur(10px);border:1.5px solid rgba(255,255,255,.25);display:flex;align-items:center;justify-content:center;flex-shrink:0;position:relative}
.wav img{width:28px;height:28px;object-fit:contain}
.wav::after{content:'';position:absolute;bottom:-2px;right:-2px;width:14px;height:14px;border-radius:50%;background:#4ade80;border:2px solid #075E54}
.wx{position:absolute;right:12px;top:12px;width:32px;height:32px;border:none;border-radius:50%;background:transparent;cursor:pointer;color:rgba(255,255,255,.6);font-size:20px;display:flex;align-items:center;justify-content:center;transition:all .2s}
.wx:hover{background:rgba(255,255,255,.15);color:#fff}
.wf{padding:20px 24px 24px;display:flex;flex-direction:column;gap:16px}
.wf label{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:rgba(0,0,0,.6);margin-bottom:6px}
.wf label svg{width:14px;height:14px;color:rgba(5,150,105,.7)}
.wf input,.wf textarea{width:100%;padding:12px 16px;border:1px solid rgba(255,255,255,.4);border-radius:12px;font-size:14px;outline:none;transition:all .2s;background:rgba(255,255,255,.6);backdrop-filter:blur(4px);color:#1f2937;box-sizing:border-box}
.wf textarea{height:72px;resize:none}
.wf input::placeholder,.wf textarea::placeholder{color:rgba(0,0,0,.3)}
.wf input:focus,.wf textarea:focus{background:rgba(255,255,255,.8);border-color:#25D366;box-shadow:0 0 0 3px rgba(37,211,102,.15)}
.wf .er{border-color:#ef4444!important;box-shadow:0 0 0 2px rgba(239,68,68,.1)!important}
.we{font-size:11px;color:#ef4444;margin-top:4px;display:none}
.we.s{display:block}
.we.big{font-size:14px;font-weight:600;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);border-radius:8px;padding:8px 12px;display:none;align-items:center;gap:6px;margin-top:4px}
.we.big.s{display:flex}
.wk{display:flex;align-items:flex-start;gap:10px;cursor:pointer;font-size:11px;color:#6b7280;line-height:1.5}
.wk input{margin-top:2px;accent-color:#25D366;width:18px;height:18px;flex-shrink:0}
.wk a{color:#059669;font-weight:600;text-decoration:underline;text-underline-offset:2px}
.wk a:hover{color:#10b981}
.ws{width:100%;height:48px;border:none;border-radius:12px;background:linear-gradient(135deg,#25D366,#128C7E);color:#fff;font-size:14px;font-weight:700;cursor:pointer;transition:all .3s;display:flex;align-items:center;justify-content:center;gap:10px;position:relative;overflow:hidden;margin-top:4px}
.ws:hover{box-shadow:0 4px 24px rgba(37,211,102,.4)}.ws:active{transform:scale(.98)}.ws:disabled{opacity:.6;cursor:not-allowed}
.ws::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,.2),transparent);transform:translateX(-100%);transition:transform .7s}.ws:hover::after{transform:translateX(100%)}
.ws img{width:20px;height:20px;object-fit:contain}
.wsc{display:flex;align-items:center;justify-content:center;gap:6px;padding-top:4px;font-size:10px;color:rgba(0,0,0,.25);font-weight:500}
.wsc svg{width:12px;height:12px}
.wok{display:none;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:40px 24px;text-align:center;animation:wz .3s ease}
.wok.s{display:flex}
.wok .ico{width:64px;height:64px;border-radius:50%;background:rgba(16,185,129,.15);display:flex;align-items:center;justify-content:center}
.wok .ico svg{width:32px;height:32px;color:#059669}
.wok h3{font-size:18px;font-weight:700;color:#1f2937;margin:0}
.wok p{font-size:14px;color:#6b7280;margin:0;line-height:1.5}
.wok .cd{display:inline-flex;width:32px;height:32px;align-items:center;justify-content:center;border-radius:50%;background:#25D366;color:#fff;font-size:14px;font-weight:700}
.wok .bar{width:200px;height:6px;border-radius:99px;background:rgba(0,0,0,.08);overflow:hidden;margin-top:8px}
.wok .bar div{height:100%;border-radius:99px;background:#25D366;transition:width 1s linear}
.wok .go{display:flex;align-items:center;gap:8px;border:none;border-radius:12px;padding:12px 24px;background:linear-gradient(135deg,#25D366,#128C7E);color:#fff;font-size:14px;font-weight:700;cursor:pointer;margin-top:8px;transition:transform .2s}
.wok .go:hover{transform:scale(1.05)}.wok .go:active{transform:scale(.95)}
.wok .go img{width:20px;height:20px;object-fit:contain}
@media(max-width:639px){.wm{max-height:95dvh;overflow-y:auto}}
</style>
<button class="wb" id="wB"><img src="https://hzzlhgfyingaphnakktg.supabase.co/storage/v1/object/public/assets/iconzap.webp" alt="WhatsApp"></button>
<div class="wo" id="wO">
<div class="wm">
<div class="wh">
<div class="wav"><img src="https://hzzlhgfyingaphnakktg.supabase.co/storage/v1/object/public/assets/iconzap.webp" alt=""></div>
<div><h2>${config.title}</h2><p class="st">Online agora</p></div>
<button class="wx" id="wX">&times;</button>
</div>
<form class="wf" id="wF" novalidate>
<div><label><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>Nome</label><input type="text" id="wn" placeholder="Seu nome completo"><p class="we" id="en">Informe seu nome</p></div>
<div><label><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>Telefone / WhatsApp</label><input type="tel" id="wp" placeholder="(11) 99999-9999" inputmode="numeric"><p class="we" id="ep">Telefone inválido</p></div>
<div><label><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>Mensagem</label><textarea id="wg" placeholder="Descreva o que precisa..."></textarea></div>
<label class="wk"><input type="checkbox" id="wa"><span>Li e aceito a <a href="${siteUrl}/privacidade" target="_blank">Política de Privacidade</a> e os <a href="${siteUrl}/termos" target="_blank">Termos de Uso</a></span></label>
<p class="we" id="ea" style="margin-top:-8px">Aceite os termos</p>
<button type="submit" class="ws" id="wS"><img src="https://hzzlhgfyingaphnakktg.supabase.co/storage/v1/object/public/assets/iconzap.webp" alt=""> Iniciar Conversa</button>
<div class="wsc"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>Seus dados estão protegidos</div>
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
busy=1;s.disabled=1;s.innerHTML='<svg style="width:20px;height:20px;animation:spin 1s linear infinite" viewBox="0 0 24 24" fill="none"><circle opacity=".25" cx="12" cy="12" r="10" stroke="white" stroke-width="4"/><path opacity=".75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Abrindo WhatsApp…';
var ph=dg.indexOf('55')===0?dg:'55'+dg;
fetch('${edgeEndpoint}',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:nm,phone:ph,message:mg,user_id:'${ownerId}',category_id:'${config.category_id}',origin_url:'${siteUrl}'})}).catch(function(){});
var msg=encodeURIComponent('Olá! Meu nome é '+nm+'.\\n'+(mg?mg+'\\n':'')+'Tel: +'+ph);
var url=/Android|iPhone|iPad/i.test(navigator.userAgent)?'https://wa.me/${whatsappNumber}?text='+msg:'https://web.whatsapp.com/send?phone=${whatsappNumber}&text='+msg;
window.open(url,'_blank');
setTimeout(function(){f.reset();o.classList.remove('open');busy=0;s.disabled=0;s.innerHTML='<img src="https://hzzlhgfyingaphnakktg.supabase.co/storage/v1/object/public/assets/iconzap.webp" alt="" style="width:20px;height:20px;object-fit:contain"> Iniciar Conversa'},500);
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
