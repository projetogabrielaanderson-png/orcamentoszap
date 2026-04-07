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
  return `<!DOCTYPE html>
<!-- Widget WhatsApp - ${config.title} -->
<!-- Cole este código antes do </body> do seu site -->
<style>
.wab-btn{position:fixed;bottom:24px;right:24px;z-index:9999;width:64px;height:64px;border-radius:50%;border:none;cursor:pointer;background:#25D366;box-shadow:0 4px 20px rgba(0,0,0,.25);display:flex;align-items:center;justify-content:center;transition:transform .2s}
.wab-btn:hover{transform:scale(1.1)}.wab-btn:active{transform:scale(.95)}
.wab-btn svg{width:32px;height:32px;fill:#fff}
.wab-btn::after{content:'';position:absolute;inset:0;border-radius:50%;background:#25D366;opacity:.3;animation:wab-ping 2s cubic-bezier(0,0,.2,1) infinite}
@keyframes wab-ping{75%,100%{transform:scale(1.6);opacity:0}}
.wab-overlay{position:fixed;inset:0;z-index:10000;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.6);backdrop-filter:blur(4px);padding:16px}
.wab-overlay.open{display:flex}
.wab-modal{width:100%;max-width:400px;border-radius:16px;overflow:hidden;background:#fff;box-shadow:0 20px 60px rgba(0,0,0,.3);animation:wab-zoom .3s ease;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif}
@keyframes wab-zoom{from{opacity:0;transform:scale(.92)}to{opacity:1;transform:scale(1)}}
.wab-header{position:relative;padding:16px 20px;background:${config.primary_color || '#075E54'};display:flex;align-items:center;gap:12px}
.wab-header-icon{width:44px;height:44px;border-radius:50%;background:#25D366;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.wab-header-icon svg{width:24px;height:24px;fill:#fff}
.wab-header h2{font-size:16px;font-weight:600;color:#fff;margin:0}
.wab-header p{font-size:12px;color:rgba(255,255,255,.8);margin:2px 0 0;display:flex;align-items:center;gap:4px}
.wab-header p::before{content:'';width:8px;height:8px;border-radius:50%;background:#4ade80;display:inline-block}
.wab-close{position:absolute;right:12px;top:12px;width:32px;height:32px;border:none;border-radius:50%;background:transparent;cursor:pointer;color:rgba(255,255,255,.7);font-size:20px;display:flex;align-items:center;justify-content:center;transition:background .2s,color .2s}
.wab-close:hover{background:rgba(255,255,255,.2);color:#fff}
.wab-form{padding:20px;display:flex;flex-direction:column;gap:16px}
.wab-field label{display:block;font-size:14px;font-weight:500;color:#1f2937;margin-bottom:6px}
.wab-field input[type="text"],.wab-field input[type="tel"],.wab-field textarea{width:100%;height:48px;padding:0 14px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;color:#1f2937;outline:none;transition:border-color .2s,box-shadow .2s}
.wab-field textarea{height:80px;padding:10px 14px;resize:vertical}
.wab-field input:focus,.wab-field textarea:focus{border-color:#25D366;box-shadow:0 0 0 3px rgba(37,211,102,.2)}
.wab-field input.error,.wab-field textarea.error{border-color:#ef4444}
.wab-error{font-size:12px;color:#ef4444;margin-top:4px;display:none}
.wab-error.show{display:block}
.wab-check{display:flex;align-items:flex-start;gap:10px;cursor:pointer}
.wab-check input{margin-top:2px;width:16px;height:16px;accent-color:#25D366;cursor:pointer}
.wab-check span{font-size:12px;line-height:1.5;color:#6b7280}
.wab-check a{color:${config.primary_color || '#075E54'};text-decoration:underline}
.wab-cta{width:100%;height:48px;border:none;border-radius:8px;background:#25D366;color:#fff;font-size:14px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:filter .2s,transform .1s}
.wab-cta:hover{filter:brightness(1.1)}.wab-cta:active{transform:scale(.98)}.wab-cta:disabled{opacity:.6;cursor:not-allowed}
.wab-cta svg{width:20px;height:20px;fill:#fff}
@media(max-width:480px){.wab-modal{max-width:100%;border-radius:12px}.wab-overlay{padding:8px}}
</style>

<svg style="display:none"><symbol id="wa-icon" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></symbol></svg>

<button class="wab-btn" id="wabBtn" aria-label="Abrir WhatsApp"><svg><use href="#wa-icon"/></svg></button>

<div class="wab-overlay" id="wabOverlay">
  <div class="wab-modal">
    <div class="wab-header">
      <div class="wab-header-icon"><svg><use href="#wa-icon"/></svg></div>
      <div><h2>${config.title}</h2><p>Online agora</p></div>
      <button class="wab-close" id="wabClose" aria-label="Fechar">&times;</button>
    </div>
    <form class="wab-form" id="wabForm" novalidate>
      <div class="wab-field">
        <label for="wab-name">Nome</label>
        <input type="text" id="wab-name" placeholder="Seu nome completo" maxlength="100" autocomplete="name">
        <p class="wab-error" id="err-name">Informe seu nome</p>
      </div>
      <div class="wab-field">
        <label for="wab-phone">Telefone / WhatsApp</label>
        <input type="tel" id="wab-phone" placeholder="(11) 99999-9999" maxlength="15" inputmode="numeric" autocomplete="tel">
        <p class="wab-error" id="err-phone">Informe um telefone válido</p>
      </div>
      <div class="wab-field">
        <label for="wab-msg">Mensagem</label>
        <textarea id="wab-msg" placeholder="Descreva o que precisa..." maxlength="500"></textarea>
      </div>
      <label class="wab-check">
        <input type="checkbox" id="wab-accept">
        <span>Li e aceito a <a href="${siteUrl}/privacidade" target="_blank">Política de Privacidade</a> e os <a href="${siteUrl}/termos" target="_blank">Termos de Uso</a></span>
      </label>
      <p class="wab-error" id="err-accept" style="margin-top:-8px">Você precisa aceitar os termos</p>
      <button type="submit" class="wab-cta" id="wabCta"><svg><use href="#wa-icon"/></svg>Iniciar Conversa</button>
    </form>
  </div>
</div>

<script>
(function(){
  var WA_NUMBER='${whatsappNumber}';
  var API_URL='${edgeEndpoint}';
  var OWNER_ID='${ownerId}';
  var CATEGORY_ID='${config.category_id}';
  var ORIGIN='${siteUrl}';
  var btn=document.getElementById('wabBtn'),overlay=document.getElementById('wabOverlay'),form=document.getElementById('wabForm');
  var nameEl=document.getElementById('wab-name'),phoneEl=document.getElementById('wab-phone'),msgEl=document.getElementById('wab-msg'),acceptEl=document.getElementById('wab-accept'),cta=document.getElementById('wabCta');
  var sending=false;
  btn.addEventListener('click',function(){overlay.classList.add('open');nameEl.focus()});
  document.getElementById('wabClose').addEventListener('click',function(){overlay.classList.remove('open')});
  overlay.addEventListener('click',function(e){if(e.target===overlay)overlay.classList.remove('open')});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')overlay.classList.remove('open')});
  phoneEl.addEventListener('input',function(){var d=this.value.replace(/\\D/g,'').slice(0,11);if(d.length<=2)this.value=d.length?'('+d:'';else if(d.length<=7)this.value='('+d.slice(0,2)+') '+d.slice(2);else this.value='('+d.slice(0,2)+') '+d.slice(2,7)+'-'+d.slice(7)});
  function showErr(id){document.getElementById('err-'+id).classList.add('show')}
  function hideErr(id){document.getElementById('err-'+id).classList.remove('show')}
  nameEl.addEventListener('input',function(){hideErr('name');this.classList.remove('error')});
  phoneEl.addEventListener('input',function(){hideErr('phone');this.classList.remove('error')});
  acceptEl.addEventListener('change',function(){hideErr('accept')});
  form.addEventListener('submit',function(e){
    e.preventDefault();if(sending)return;
    var valid=true,nm=nameEl.value.trim(),digits=phoneEl.value.replace(/\\D/g,''),msg=msgEl.value.trim();
    if(!nm){showErr('name');nameEl.classList.add('error');valid=false}
    if(digits.length<10||digits.length>11){showErr('phone');phoneEl.classList.add('error');valid=false}
    if(!acceptEl.checked){showErr('accept');valid=false}
    if(!valid)return;
    sending=true;cta.disabled=true;cta.textContent='Abrindo WhatsApp…';
    var phone=digits.indexOf('55')===0?digits:'55'+digits;
    // Salvar lead no CRM
    fetch(API_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:nm,phone:phone,message:msg,user_id:OWNER_ID,category_id:CATEGORY_ID,origin_url:ORIGIN})}).catch(function(){});
    // Abrir WhatsApp
    var waMsg=encodeURIComponent('Olá! Meu nome é '+nm+'.\\n'+( msg ? msg+'\\n' : '' )+'Meu telefone: +'+phone);
    var isMobile=/Android|iPhone|iPad/i.test(navigator.userAgent);
    var url=isMobile?'https://wa.me/'+WA_NUMBER+'?text='+waMsg:'https://web.whatsapp.com/send?phone='+WA_NUMBER+'&text='+waMsg;
    window.open(url,'_blank');
    setTimeout(function(){form.reset();overlay.classList.remove('open');sending=false;cta.disabled=false;cta.innerHTML='<svg><use href="#wa-icon"/></svg>Iniciar Conversa'},500);
  });
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
