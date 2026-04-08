import { useState, useCallback, useRef, useEffect } from 'react';
import { X, MessageCircle, User, Phone, Send, ShieldCheck } from 'lucide-react';

interface WhatsAppFloatingButtonProps {
  whatsappNumber: string;
  title?: string;
  subtitle?: string;
  privacyUrl?: string;
  termsUrl?: string;
  onLeadCapture?: (data: { name: string; phone: string }) => void;
}

function applyPhoneMask(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : '';
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function WhatsAppFloatingButton({
  whatsappNumber,
  title = 'Conserto de Geladeira',
  subtitle = 'Online agora',
  privacyUrl = '/privacidade',
  termsUrl = '/termos',
  onLeadCapture,
}: WhatsAppFloatingButtonProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; phone?: string; accepted?: string }>({});
  const [sending, setSending] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const validate = useCallback(() => {
    const e: typeof errors = {};
    if (!name.trim()) e.name = 'Informe seu nome';
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 11) e.phone = 'Informe um telefone válido';
    if (!accepted) e.accepted = 'Você precisa aceitar os termos';
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [name, phone, accepted]);

  const handleSubmit = useCallback(() => {
    if (!validate() || sending) return;
    setSending(true);
    const digits = phone.replace(/\D/g, '');
    const fullPhone = digits.startsWith('55') ? digits : `55${digits}`;
    const msg = encodeURIComponent(
      `Olá! Meu nome é ${name.trim()} e gostaria de um orçamento.\nMeu telefone: +${fullPhone}`
    );
    onLeadCapture?.({ name: name.trim(), phone: fullPhone });
    const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
    const url = isMobile
      ? `https://wa.me/${whatsappNumber}?text=${msg}`
      : `https://web.whatsapp.com/send?phone=${whatsappNumber}&text=${msg}`;
    window.open(url, '_blank');
    setTimeout(() => {
      setName(''); setPhone(''); setAccepted(false); setErrors({}); setSending(false); setOpen(false);
    }, 500);
  }, [name, phone, accepted, sending, validate, whatsappNumber, onLeadCapture]);

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Abrir WhatsApp"
        className="group fixed bottom-5 right-5 z-[9999] flex h-[60px] w-[60px] items-center justify-center rounded-full shadow-[0_4px_20px_rgba(37,211,102,0.4)] transition-all duration-300 hover:scale-110 hover:shadow-[0_6px_28px_rgba(37,211,102,0.5)] active:scale-95 sm:bottom-6 sm:right-6 sm:h-16 sm:w-16"
        style={{ backgroundColor: '#25D366' }}
      >
        <svg className="h-7 w-7 sm:h-8 sm:w-8 transition-transform duration-300 group-hover:rotate-[15deg]" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a8 8 0 01-4.243-1.214l-.257-.154-2.874.854.854-2.874-.154-.257A8 8 0 1112 20z" />
        </svg>
        {/* Pulse rings */}
        <span className="absolute inset-0 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] rounded-full opacity-20" style={{ backgroundColor: '#25D366' }} />
      </button>

      {/* Modal */}
      {open && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-[10000] flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4 animate-in fade-in duration-200"
          onClick={(e) => e.target === overlayRef.current && setOpen(false)}
        >
          <div className="w-full max-h-[95dvh] overflow-y-auto rounded-t-3xl bg-background shadow-[0_-8px_40px_rgba(0,0,0,0.15)] sm:max-w-[420px] sm:rounded-2xl sm:shadow-2xl animate-in slide-in-from-bottom-8 sm:zoom-in-95 fade-in duration-300">
            
            {/* Header with gradient */}
            <div className="relative overflow-hidden px-5 pb-5 pt-6 sm:px-6" style={{ background: 'linear-gradient(135deg, #075E54 0%, #128C7E 100%)' }}>
              {/* Decorative circles */}
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/5" />
              <div className="absolute -left-4 bottom-0 h-16 w-16 rounded-full bg-white/5" />
              
              {/* Drag indicator (mobile) */}
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/30 sm:hidden" />
              
              <div className="relative flex items-center gap-3.5">
                {/* Avatar */}
                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/15 ring-2 ring-white/20 backdrop-blur-sm sm:h-14 sm:w-14">
                  <svg className="h-6 w-6 sm:h-7 sm:w-7" viewBox="0 0 24 24" fill="white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a8 8 0 01-4.243-1.214l-.257-.154-2.874.854.854-2.874-.154-.257A8 8 0 1112 20z" />
                  </svg>
                  {/* Online dot */}
                  <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[#075E54] bg-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-[15px] font-semibold text-white truncate sm:text-base">{title}</h2>
                  <p className="mt-0.5 text-[11px] font-medium text-emerald-200/90 sm:text-xs">
                    🟢 {subtitle}
                  </p>
                </div>
              </div>
              
              {/* Close button */}
              <button
                onClick={() => setOpen(false)}
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-white/60 transition-all hover:bg-white/15 hover:text-white active:scale-90 sm:right-4 sm:top-4"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Chat bubble hint */}
            <div className="px-5 pt-4 sm:px-6">
              <div className="relative rounded-xl rounded-tl-sm bg-muted/60 px-3.5 py-2.5 text-[13px] text-muted-foreground">
                <span className="font-medium text-foreground">Olá! 👋</span>
                <br />
                Preencha seus dados para iniciar uma conversa no WhatsApp.
              </div>
            </div>

            {/* Form */}
            <div className="space-y-3.5 px-5 pb-6 pt-4 sm:px-6 sm:pb-6">
              {/* Name */}
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-[13px] font-medium text-foreground" htmlFor="wab-name">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  Nome
                </label>
                <input
                  id="wab-name"
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setErrors(prev => ({ ...prev, name: undefined })); }}
                  placeholder="Seu nome completo"
                  className={`flex h-11 w-full rounded-xl border bg-muted/30 px-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-all duration-200 focus:bg-background focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 sm:h-12 ${errors.name ? 'border-destructive ring-1 ring-destructive/20' : 'border-input'}`}
                  maxLength={100}
                />
                {errors.name && (
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
                    <span className="inline-block h-1 w-1 rounded-full bg-destructive" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-[13px] font-medium text-foreground" htmlFor="wab-phone">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  Telefone / WhatsApp
                </label>
                <input
                  id="wab-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => { setPhone(applyPhoneMask(e.target.value)); setErrors(prev => ({ ...prev, phone: undefined })); }}
                  placeholder="(11) 99999-9999"
                  className={`flex h-11 w-full rounded-xl border bg-muted/30 px-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-all duration-200 focus:bg-background focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 sm:h-12 ${errors.phone ? 'border-destructive ring-1 ring-destructive/20' : 'border-input'}`}
                  inputMode="numeric"
                />
                {errors.phone && (
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
                    <span className="inline-block h-1 w-1 rounded-full bg-destructive" />
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Checkbox */}
              <div className="pt-0.5">
                <label className="flex items-start gap-2.5 cursor-pointer group/check">
                  <div className="relative mt-0.5">
                    <input
                      type="checkbox"
                      checked={accepted}
                      onChange={(e) => { setAccepted(e.target.checked); setErrors(prev => ({ ...prev, accepted: undefined })); }}
                      className="peer sr-only"
                    />
                    <div className={`flex h-[18px] w-[18px] items-center justify-center rounded-md border-2 transition-all duration-200 peer-checked:border-emerald-500 peer-checked:bg-emerald-500 ${errors.accepted ? 'border-destructive' : 'border-muted-foreground/30 group-hover/check:border-muted-foreground/50'}`}>
                      {accepted && (
                        <svg className="h-3 w-3 text-white animate-in zoom-in duration-150" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
                    Li e aceito a{' '}
                    <a href={privacyUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-emerald-600 underline decoration-emerald-600/30 underline-offset-2 hover:text-emerald-500 hover:decoration-emerald-500/50 transition-colors">
                      Política de Privacidade
                    </a>{' '}
                    e os{' '}
                    <a href={termsUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-emerald-600 underline decoration-emerald-600/30 underline-offset-2 hover:text-emerald-500 hover:decoration-emerald-500/50 transition-colors">
                      Termos de Uso
                    </a>
                  </span>
                </label>
                {errors.accepted && (
                  <p className="mt-1 ml-7 flex items-center gap-1 text-[11px] text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
                    <span className="inline-block h-1 w-1 rounded-full bg-destructive" />
                    {errors.accepted}
                  </p>
                )}
              </div>

              {/* CTA */}
              <button
                onClick={handleSubmit}
                disabled={sending}
                className="group/btn relative mt-1 flex h-12 w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:shadow-[0_4px_20px_rgba(37,211,102,0.35)] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed sm:h-[52px] sm:text-[15px]"
                style={{ background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)' }}
              >
                {/* Shine effect */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
                
                {sending ? (
                  <>
                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Abrindo WhatsApp…
                  </>
                ) : (
                  <>
                    <Send className="h-4.5 w-4.5 transition-transform duration-300 group-hover/btn:translate-x-0.5" />
                    Iniciar Conversa
                  </>
                )}
              </button>

              {/* Security badge */}
              <div className="flex items-center justify-center gap-1.5 pt-1">
                <ShieldCheck className="h-3 w-3 text-muted-foreground/50" />
                <span className="text-[10px] text-muted-foreground/50">Seus dados estão protegidos</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
