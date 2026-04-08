import { useState, useCallback, useRef, useEffect } from 'react';
import { X, User, Phone, MessageSquare, Send, ShieldCheck } from 'lucide-react';
import whatsappIcon from '@/assets/iconzap.webp';

interface WhatsAppFloatingButtonProps {
  whatsappNumber: string;
  title?: string;
  subtitle?: string;
  privacyUrl?: string;
  termsUrl?: string;
  onLeadCapture?: (data: { name: string; phone: string; message: string }) => void;
}

function applyPhoneMask(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : '';
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function WhatsAppFloatingButton({
  whatsappNumber,
  title = 'Orçamento Eletricista',
  subtitle = 'Online agora',
  privacyUrl = '/privacidade',
  termsUrl = '/termos',
  onLeadCapture,
}: WhatsAppFloatingButtonProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; phone?: string; accepted?: string }>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const overlayRef = useRef<HTMLDivElement>(null);
  const whatsappUrlRef = useRef('');

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

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
    const msgText = message.trim()
      ? `Olá! Meu nome é ${name.trim()}.\n${message.trim()}\nMeu telefone: +${fullPhone}`
      : `Olá! Meu nome é ${name.trim()} e gostaria de um orçamento.\nMeu telefone: +${fullPhone}`;
    const encoded = encodeURIComponent(msgText);
    onLeadCapture?.({ name: name.trim(), phone: fullPhone, message: message.trim() });
    const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
    const url = isMobile
      ? `https://wa.me/${whatsappNumber}?text=${encoded}`
      : `https://web.whatsapp.com/send?phone=${whatsappNumber}&text=${encoded}`;
    whatsappUrlRef.current = url;
    setSending(false);
    setSent(true);
    setCountdown(5);
  }, [name, phone, message, accepted, sending, validate, whatsappNumber, onLeadCapture]);

  // Countdown + redirect after submit
  useEffect(() => {
    if (!sent) return;
    if (countdown <= 0) {
      window.open(whatsappUrlRef.current, '_blank');
      setSent(false);
      setName(''); setPhone(''); setMessage(''); setAccepted(false); setErrors({});
      setOpen(false);
      return;
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [sent, countdown]);

  const inputBase = "w-full rounded-xl border bg-white/60 backdrop-blur-sm px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-all duration-200 focus:bg-white/80 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500";
  const errorInput = "border-destructive ring-1 ring-destructive/20";
  const normalInput = "border-white/40";

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Abrir WhatsApp"
        className="group fixed bottom-5 right-5 z-[9999] flex h-[60px] w-[60px] items-center justify-center rounded-full shadow-[0_4px_24px_rgba(37,211,102,0.45)] transition-all duration-300 hover:scale-110 hover:shadow-[0_6px_32px_rgba(37,211,102,0.55)] active:scale-95 sm:bottom-6 sm:right-6 sm:h-16 sm:w-16"
        style={{ backgroundColor: '#25D366' }}
      >
        <img src={whatsappIcon} alt="WhatsApp" className="h-9 w-9 sm:h-10 sm:w-10 transition-transform duration-300 group-hover:rotate-[15deg] object-contain" />
        <span className="absolute inset-0 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] rounded-full opacity-20" style={{ backgroundColor: '#25D366' }} />
      </button>

      {/* Modal overlay */}
      {open && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 animate-in fade-in duration-200"
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
          onClick={(e) => e.target === overlayRef.current && setOpen(false)}
        >
          {/* Glassmorphism card */}
          <div
            className="w-[90vw] max-w-[420px] max-h-[80vh] overflow-y-auto rounded-2xl animate-in zoom-in-95 fade-in duration-300"
            style={{
              background: 'rgba(255,255,255,0.72)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              border: '1px solid rgba(255,255,255,0.45)',
              boxShadow: '0 8px 60px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.6)',
            }}
          >
            {/* Header */}
            <div
              className="relative overflow-hidden rounded-t-2xl px-5 pb-5 pt-6 sm:px-6"
              style={{ background: 'linear-gradient(135deg, rgba(7,94,84,0.95) 0%, rgba(18,140,126,0.95) 100%)' }}
            >
              {/* Decorative blurs */}
              <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10 blur-xl" />
              <div className="absolute -left-6 bottom--2 h-20 w-20 rounded-full bg-white/10 blur-lg" />

              {/* Drag indicator (mobile) */}
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/30 sm:hidden" />

              <div className="relative flex items-center gap-3.5">
                {/* Avatar glass */}
                <div
                  className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full sm:h-14 sm:w-14"
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(10px)',
                    border: '1.5px solid rgba(255,255,255,0.25)',
                  }}
                >
                  <img src={whatsappIcon} alt="" className="h-7 w-7 sm:h-8 sm:w-8 object-contain" />
                  <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[#075E54] bg-emerald-400 shadow-sm" />
                </div>

                <div className="flex-1 min-w-0">
                  <h2 className="text-[15px] font-semibold text-white truncate sm:text-base drop-shadow-sm">{title}</h2>
                  <p className="mt-0.5 flex items-center gap-1.5 text-[11px] font-medium text-emerald-200/90 sm:text-xs">
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
                    {subtitle}
                  </p>
                </div>
              </div>

              {/* Close */}
              <button
                onClick={() => setOpen(false)}
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-white/60 transition-all hover:bg-white/15 hover:text-white active:scale-90 sm:right-4 sm:top-4"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {sent ? (
              /* ── Success Screen ── */
              <div className="flex flex-col items-center justify-center gap-4 px-6 py-10 text-center animate-in fade-in zoom-in-95 duration-300">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                  <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-foreground">Mensagem enviada!</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Você será redirecionado para o WhatsApp em{' '}
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white">
                    {countdown}
                  </span>
                  {' '}segundos
                </p>
                <div className="w-full max-w-[200px] overflow-hidden rounded-full bg-muted/50 h-1.5 mt-2">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-1000 ease-linear"
                    style={{ width: `${((5 - countdown) / 5) * 100}%` }}
                  />
                </div>
                <button
                  onClick={() => { window.open(whatsappUrlRef.current, '_blank'); setSent(false); setName(''); setPhone(''); setMessage(''); setAccepted(false); setErrors({}); setOpen(false); }}
                  className="mt-2 flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white transition-all hover:scale-105 active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)' }}
                >
                  <img src={whatsappIcon} alt="" className="h-5 w-5 object-contain" />
                  Ir agora para o WhatsApp
                </button>
              </div>
            ) : (
              /* ── Form body ── */
              <div className="space-y-4 px-5 pb-6 pt-5 sm:px-6">

                {/* Nome */}
                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-[13px] font-semibold text-foreground/80" htmlFor="wab-name">
                    <User className="h-3.5 w-3.5 text-emerald-600/70" />
                    Nome
                  </label>
                  <input
                    id="wab-name"
                    type="text"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setErrors(prev => ({ ...prev, name: undefined })); }}
                    placeholder="Seu nome completo"
                    className={`${inputBase} ${errors.name ? errorInput : normalInput}`}
                    maxLength={100}
                  />
                  {errors.name && (
                    <p className="mt-1 text-[11px] text-destructive animate-in fade-in slide-in-from-top-1 duration-200">{errors.name}</p>
                  )}
                </div>

                {/* Telefone */}
                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-[13px] font-semibold text-foreground/80" htmlFor="wab-phone">
                    <Phone className="h-3.5 w-3.5 text-emerald-600/70" />
                    Telefone / WhatsApp
                  </label>
                  <input
                    id="wab-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => { setPhone(applyPhoneMask(e.target.value)); setErrors(prev => ({ ...prev, phone: undefined })); }}
                    placeholder="(11) 99999-9999"
                    className={`${inputBase} ${errors.phone ? errorInput : normalInput}`}
                    inputMode="numeric"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-[11px] text-destructive animate-in fade-in slide-in-from-top-1 duration-200">{errors.phone}</p>
                  )}
                </div>

                {/* Mensagem */}
                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-[13px] font-semibold text-foreground/80" htmlFor="wab-msg">
                    <MessageSquare className="h-3.5 w-3.5 text-emerald-600/70" />
                    Mensagem
                  </label>
                  <textarea
                    id="wab-msg"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Descreva o que precisa..."
                    rows={3}
                    maxLength={500}
                    className={`${inputBase} ${normalInput} resize-none`}
                  />
                </div>

                {/* Checkbox LGPD */}
                <label className="flex items-start gap-2.5 cursor-pointer group/check pt-1">
                  <div className="relative mt-0.5">
                    <input
                      type="checkbox"
                      checked={accepted}
                      onChange={(e) => { setAccepted(e.target.checked); setErrors(prev => ({ ...prev, accepted: undefined })); }}
                      className="peer sr-only"
                    />
                    <div
                      className={`flex h-[18px] w-[18px] items-center justify-center rounded-md border-2 transition-all duration-200 peer-checked:border-emerald-500 peer-checked:bg-emerald-500 ${errors.accepted ? 'border-destructive' : 'border-muted-foreground/30 group-hover/check:border-muted-foreground/50'}`}
                      style={{ backdropFilter: 'blur(4px)' }}
                    >
                      {accepted && (
                        <svg className="h-3 w-3 text-white animate-in zoom-in duration-150" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
                    Li e aceito a{' '}
                    <a href={privacyUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-emerald-600 underline decoration-emerald-600/30 underline-offset-2 hover:text-emerald-500 transition-colors">
                      Política de Privacidade
                    </a>{' '}
                    e os{' '}
                    <a href={termsUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-emerald-600 underline decoration-emerald-600/30 underline-offset-2 hover:text-emerald-500 transition-colors">
                      Termos de Uso
                    </a>
                  </span>
                </label>
                {errors.accepted && (
                  <div className="ml-7 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    <span className="text-sm font-semibold text-destructive">⚠️ {errors.accepted}</span>
                  </div>
                )}

                {/* CTA */}
                <button
                  onClick={handleSubmit}
                  disabled={sending}
                  className="group/btn relative mt-2 flex h-12 w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl text-sm font-bold text-white transition-all duration-300 hover:shadow-[0_4px_24px_rgba(37,211,102,0.4)] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed sm:h-[52px] sm:text-[15px]"
                  style={{ background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)' }}
                >
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
                      <img src={whatsappIcon} alt="" className="h-5 w-5 object-contain" />
                      Iniciar Conversa
                    </>
                  )}
                </button>

                {/* Security badge */}
                <div className="flex items-center justify-center gap-1.5 pt-1">
                  <ShieldCheck className="h-3 w-3 text-muted-foreground/40" />
                  <span className="text-[10px] text-muted-foreground/40 font-medium">Seus dados estão protegidos</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
