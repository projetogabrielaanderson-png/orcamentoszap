import { useState, useCallback, useRef, useEffect } from 'react';
import { X, MessageCircle } from 'lucide-react';

interface WhatsAppFloatingButtonProps {
  /** WhatsApp number with country code (digits only, e.g. "5511999999999") */
  whatsappNumber: string;
  /** Title shown in the modal header */
  title?: string;
  /** Subtitle shown below the title */
  subtitle?: string;
  /** Privacy policy URL */
  privacyUrl?: string;
  /** Terms of use URL */
  termsUrl?: string;
  /** Called after form submit with lead data (for CRM integration) */
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

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
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

    // CRM callback
    onLeadCapture?.({ name: name.trim(), phone: fullPhone });

    const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
    const url = isMobile
      ? `https://wa.me/${whatsappNumber}?text=${msg}`
      : `https://web.whatsapp.com/send?phone=${whatsappNumber}&text=${msg}`;

    window.open(url, '_blank');

    // Reset after short delay
    setTimeout(() => {
      setName('');
      setPhone('');
      setAccepted(false);
      setErrors({});
      setSending(false);
      setOpen(false);
    }, 500);
  }, [name, phone, accepted, sending, validate, whatsappNumber, onLeadCapture]);

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Abrir WhatsApp"
        className="fixed bottom-6 right-6 z-[9999] flex h-16 w-16 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-110 active:scale-95"
        style={{ backgroundColor: '#25D366' }}
      >
        <MessageCircle className="h-8 w-8 text-white" fill="white" strokeWidth={0} />
        {/* Pulse ring */}
        <span className="absolute inset-0 animate-ping rounded-full opacity-30" style={{ backgroundColor: '#25D366' }} />
      </button>

      {/* Modal overlay */}
      {open && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={(e) => e.target === overlayRef.current && setOpen(false)}
        >
          <div className="w-full max-w-[400px] rounded-2xl bg-background shadow-2xl animate-in zoom-in-95 fade-in duration-300 overflow-hidden">
            {/* Header */}
            <div className="relative px-5 py-4" style={{ backgroundColor: '#075E54' }}>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full" style={{ backgroundColor: '#25D366' }}>
                  <MessageCircle className="h-6 w-6 text-white" fill="white" strokeWidth={0} />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-semibold text-white truncate">{title}</h2>
                  <p className="text-xs text-green-200 flex items-center gap-1">
                    <span className="inline-block h-2 w-2 rounded-full bg-green-400" />
                    {subtitle}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/20 hover:text-white"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <div className="space-y-4 p-5">
              {/* Name */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="wab-name">
                  Nome
                </label>
                <input
                  id="wab-name"
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setErrors(prev => ({ ...prev, name: undefined })); }}
                  placeholder="Seu nome completo"
                  className={`flex h-12 w-full rounded-lg border px-3.5 text-sm bg-background text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:ring-2 focus:ring-green-500/40 focus:border-green-500 ${errors.name ? 'border-destructive' : 'border-input'}`}
                  maxLength={100}
                />
                {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="wab-phone">
                  Telefone / WhatsApp
                </label>
                <input
                  id="wab-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => { setPhone(applyPhoneMask(e.target.value)); setErrors(prev => ({ ...prev, phone: undefined })); }}
                  placeholder="(11) 99999-9999"
                  className={`flex h-12 w-full rounded-lg border px-3.5 text-sm bg-background text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:ring-2 focus:ring-green-500/40 focus:border-green-500 ${errors.phone ? 'border-destructive' : 'border-input'}`}
                  inputMode="numeric"
                />
                {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone}</p>}
              </div>

              {/* Checkbox */}
              <div>
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={accepted}
                    onChange={(e) => { setAccepted(e.target.checked); setErrors(prev => ({ ...prev, accepted: undefined })); }}
                    className="mt-0.5 h-4 w-4 rounded border-input accent-green-600"
                  />
                  <span className="text-xs leading-relaxed text-muted-foreground">
                    Li e aceito a{' '}
                    <a href={privacyUrl} target="_blank" rel="noopener noreferrer" className="underline text-primary hover:text-primary/80">
                      Política de Privacidade
                    </a>{' '}
                    e os{' '}
                    <a href={termsUrl} target="_blank" rel="noopener noreferrer" className="underline text-primary hover:text-primary/80">
                      Termos de Uso
                    </a>
                  </span>
                </label>
                {errors.accepted && <p className="mt-1 text-xs text-destructive">{errors.accepted}</p>}
              </div>

              {/* CTA */}
              <button
                onClick={handleSubmit}
                disabled={sending}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#25D366' }}
              >
                <MessageCircle className="h-5 w-5" fill="white" strokeWidth={0} />
                {sending ? 'Abrindo WhatsApp…' : 'Iniciar Conversa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
