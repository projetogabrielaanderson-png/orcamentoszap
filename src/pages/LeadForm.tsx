import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CalendarDays, Info } from 'lucide-react';
import { toast } from 'sonner';
import { CheckCircle, Loader2, ArrowRight, ArrowLeft, Send, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CustomField {
  label: string;
  type: 'text' | 'email' | 'select' | 'textarea';
  required: boolean;
  options?: string[];
}

interface FormConfigData {
  title: string;
  description: string;
  primary_color: string;
  bg_color: string;
  logo_url: string;
  custom_fields: CustomField[];
}

const defaultFormConfig: FormConfigData = {
  title: 'Solicite um Orçamento',
  description: 'Preencha seus dados e entraremos em contato',
  primary_color: '#3b82f6',
  bg_color: '#eef2ff',
  logo_url: '',
  custom_fields: [],
};

interface Step {
  id: string;
  label: string;
  placeholder: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'terms' | 'schedule';
  required: boolean;
  options?: string[];
  validate?: (value: string) => string | null;
}

const LeadFormPage = () => {
  const [searchParams] = useSearchParams();
  const origin = searchParams.get('origin') || '';
  const categoryId = searchParams.get('category_id') || '';

  const [formConfig, setFormConfig] = useState<FormConfigData>(defaultFormConfig);
  const [configLoading, setConfigLoading] = useState(!!categoryId);

  const [currentStep, setCurrentStep] = useState(0);
  const [values, setValues] = useState<Record<string, string>>({});
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<'quiz' | 'sending' | 'done'>('quiz');
  const [sendingProgress, setSendingProgress] = useState(0);
  const [slideDir, setSlideDir] = useState<'forward' | 'backward'>('forward');

  useEffect(() => {
    if (!categoryId) { setConfigLoading(false); return; }
    supabase
      .from('form_configs')
      .select('title, description, primary_color, bg_color, logo_url, custom_fields')
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setFormConfig({
            title: data.title,
            description: data.description,
            primary_color: data.primary_color,
            bg_color: data.bg_color,
            logo_url: data.logo_url,
            custom_fields: (data.custom_fields as any) || [],
          });
        }
        setConfigLoading(false);
      });
  }, [categoryId]);

  // Build steps dynamically
  const steps: Step[] = [
    {
      id: 'name',
      label: 'Qual é o seu nome?',
      placeholder: 'Digite seu nome completo',
      type: 'text',
      required: true,
      validate: (v) => (!v.trim() || v.trim().length < 2) ? 'Nome deve ter pelo menos 2 caracteres' : null,
    },
    {
      id: 'phone',
      label: 'Qual seu WhatsApp?',
      placeholder: '(44) 99999-0000',
      type: 'tel',
      required: true,
      validate: (v) => {
        const digits = v.replace(/\D/g, '');
        return (digits.length < 10 || digits.length > 11) ? 'Telefone inválido. Use DDD + número' : null;
      },
    },
    ...formConfig.custom_fields.filter(f => f.label.trim()).map((field, i) => ({
      id: `custom_${i}`,
      label: field.label,
      placeholder: field.label,
      type: field.type === 'select' ? 'select' as const : field.type === 'textarea' ? 'textarea' as const : field.type === 'email' ? 'email' as const : 'text' as const,
      required: field.required,
      options: field.options,
      validate: field.required ? ((v: string) => !v.trim() ? `${field.label} é obrigatório` : null) : undefined,
    })),
    {
      id: 'schedule',
      label: 'Quando você gostaria de ser atendido?',
      placeholder: '',
      type: 'schedule',
      required: false,
    },
    {
      id: 'message',
      label: 'Descreva o que você precisa',
      placeholder: 'Conte-nos mais detalhes sobre sua necessidade...',
      type: 'textarea',
      required: false,
    },
    {
      id: 'terms',
      label: 'Quase lá! Aceite os termos para finalizar',
      placeholder: '',
      type: 'terms',
      required: true,
    },
  ];

  const totalSteps = steps.length;
  const step = steps[currentStep];
  const progress = ((currentStep) / totalSteps) * 100;
  const currentValue = values[step?.id] || '';

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const setValue = (id: string, val: string) => {
    const finalVal = id === 'phone' ? formatPhone(val) : val;
    setValues(prev => ({ ...prev, [id]: finalVal }));
  };

  const canProceed = useCallback(() => {
    if (!step) return false;
    if (step.type === 'terms') return acceptedTerms;
    if (step.type === 'schedule') return true; // optional step
    if (step.required && !currentValue.trim()) return false;
    if (step.validate) return !step.validate(currentValue);
    return true;
  }, [step, currentValue, acceptedTerms]);

  const goNext = () => {
    if (!canProceed()) {
      if (step.validate) {
        const err = step.validate(currentValue);
        if (err) { toast.error(err); return; }
      }
      if (step.type === 'terms' && !acceptedTerms) {
        toast.error('Aceite os termos para continuar');
        return;
      }
      if (step.required && !currentValue.trim()) {
        toast.error('Este campo é obrigatório');
        return;
      }
      return;
    }
    if (currentStep < totalSteps - 1) {
      setSlideDir('forward');
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      setSlideDir('backward');
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && step.type !== 'textarea') {
      e.preventDefault();
      goNext();
    }
  };

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const endpoint = `${supabaseUrl}/functions/v1/receive-lead`;

  const handleSubmit = async () => {
    setLoading(true);
    setPhase('sending');
    setSendingProgress(0);

    // Animate progress
    const interval = setInterval(() => {
      setSendingProgress(prev => {
        if (prev >= 85) { clearInterval(interval); return 85; }
        return prev + Math.random() * 15;
      });
    }, 300);

    const phoneDigits = (values.phone || '').replace(/\D/g, '');
    const customParts = formConfig.custom_fields
      .filter((f, i) => f.label.trim() && values[`custom_${i}`])
      .map((f, i) => `${f.label}: ${values[`custom_${i}`]}`);
    const scheduleParts = [];
    if (values.schedule_date) scheduleParts.push(`Data Preferencial: ${values.schedule_date}`);
    if (values.schedule_period) scheduleParts.push(`Período: ${values.schedule_period}`);
    const fullMessage = [(values.message || '').trim(), ...customParts, ...scheduleParts].filter(Boolean).join('\n');

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: (values.name || '').trim(),
          phone: phoneDigits,
          message: fullMessage,
          origin_url: origin,
          user_id: searchParams.get('owner') || '',
          category_id: categoryId,
          utm_source: searchParams.get('utm_source') || '',
          utm_medium: searchParams.get('utm_medium') || '',
          utm_campaign: searchParams.get('utm_campaign') || '',
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Erro ao enviar');
      }
      clearInterval(interval);
      setSendingProgress(100);
      setTimeout(() => setPhase('done'), 800);
    } catch (err: any) {
      clearInterval(interval);
      toast.error(err.message || 'Erro ao enviar. Tente novamente.');
      setPhase('quiz');
      setLoading(false);
    }
  };

  // ── Loading config ──
  if (configLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: formConfig.bg_color }}>
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: formConfig.primary_color }} />
      </div>
    );
  }

  // ── Sending phase ──
  if (phase === 'sending') {
    const sendingSteps = [
      { label: 'Verificando dados...', threshold: 20 },
      { label: 'Registrando solicitação...', threshold: 50 },
      { label: 'Notificando profissionais...', threshold: 80 },
      { label: 'Finalizado!', threshold: 100 },
    ];
    const activeLabel = sendingSteps.find(s => sendingProgress <= s.threshold)?.label || 'Finalizado!';

    return (
      <div className="flex min-h-screen items-center justify-center p-4" style={{ backgroundColor: formConfig.bg_color }}>
        <div className="w-full max-w-md rounded-2xl bg-white p-10 text-center shadow-xl">
          <div className="relative mx-auto mb-6 h-20 w-20">
            <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="35" fill="none" stroke="#e5e7eb" strokeWidth="6" />
              <circle
                cx="40" cy="40" r="35" fill="none"
                stroke={formConfig.primary_color}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 35}`}
                strokeDashoffset={`${2 * Math.PI * 35 * (1 - sendingProgress / 100)}`}
                className="transition-all duration-300"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-lg font-bold" style={{ color: formConfig.primary_color }}>
              {Math.round(sendingProgress)}%
            </span>
          </div>
          <p className="text-lg font-semibold text-gray-800">{activeLabel}</p>
          <p className="mt-2 text-sm text-gray-400">Aguarde um momento...</p>
        </div>
      </div>
    );
  }

  // ── Success phase ──
  if (phase === 'done') {
    return (
      <div className="flex min-h-screen items-center justify-center p-4" style={{ backgroundColor: formConfig.bg_color }}>
        <div className="w-full max-w-md rounded-2xl bg-white p-10 text-center shadow-xl animate-in fade-in zoom-in-95 duration-500">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Enviado com sucesso! 🎉</h2>
          <p className="mt-3 text-gray-500">
            Recebemos sua solicitação, <span className="font-medium text-gray-700">{values.name}</span>.
          </p>
          <p className="mt-1 text-sm text-gray-400">
            Um profissional entrará em contato pelo WhatsApp em breve.
          </p>
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-left text-sm text-gray-600">
            <p className="font-medium text-green-700 mb-2">Resumo da solicitação:</p>
            <p>📞 {values.phone}</p>
            {values.message && <p className="mt-1">📝 {values.message}</p>}
          </div>
        </div>
      </div>
    );
  }

  // ── Quiz phase ──
  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: formConfig.bg_color }}>
      {/* Progress bar */}
      <div className="w-full bg-white/50 backdrop-blur-sm">
        <div className="mx-auto max-w-lg px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            {formConfig.logo_url ? (
              <img src={formConfig.logo_url} alt="Logo" className="h-8 object-contain" />
            ) : (
              <span className="text-sm font-semibold text-gray-700">{formConfig.title}</span>
            )}
            <span className="text-xs font-medium text-gray-400">
              {currentStep + 1} / {totalSteps}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%`, backgroundColor: formConfig.primary_color }}
            />
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div
          key={currentStep}
          className="w-full max-w-lg animate-in fade-in duration-300"
          style={{ animationName: slideDir === 'forward' ? 'slideInRight' : 'slideInLeft' }}
        >
          <div className="rounded-2xl bg-white p-8 shadow-xl sm:p-10">
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-400">
              Pergunta {currentStep + 1}
            </p>
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">{step.label}</h2>

            <div className="mt-6">
              {step.type === 'terms' ? (
                <div className="space-y-4">
                  <label className="flex items-start gap-3 cursor-pointer rounded-xl border-2 p-4 transition-colors hover:bg-gray-50"
                    style={{ borderColor: acceptedTerms ? formConfig.primary_color : '#e5e7eb' }}
                  >
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={e => setAcceptedTerms(e.target.checked)}
                      className="mt-0.5 h-5 w-5 rounded"
                      style={{ accentColor: formConfig.primary_color }}
                    />
                    <span className="text-sm text-gray-600 leading-relaxed">
                      Li e aceito os{' '}
                      <a href="/termos" target="_blank" rel="noopener noreferrer" className="underline font-medium" style={{ color: formConfig.primary_color }}>
                        Termos de Uso
                      </a>{' '}
                      e a{' '}
                      <a href="/privacidade" target="_blank" rel="noopener noreferrer" className="underline font-medium" style={{ color: formConfig.primary_color }}>
                        Política de Privacidade (LGPD)
                      </a>
                    </span>
                  </label>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Shield className="h-3.5 w-3.5" />
                    Seus dados estão protegidos
                  </div>
                </div>
              ) : step.type === 'textarea' ? (
                <textarea
                  autoFocus
                  placeholder={step.placeholder}
                  value={currentValue}
                  onChange={e => setValue(step.id, e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={4}
                  className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-base transition-colors focus:border-blue-400 focus:bg-white focus:outline-none resize-none"
                  style={{ '--tw-ring-color': formConfig.primary_color } as any}
                />
              ) : step.type === 'select' ? (
                <div className="space-y-2">
                  {step.options?.map((option, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => { setValue(step.id, option); setTimeout(goNext, 300); }}
                      className="w-full rounded-xl border-2 p-4 text-left text-base transition-all hover:shadow-md"
                      style={{
                        borderColor: currentValue === option ? formConfig.primary_color : '#e5e7eb',
                        backgroundColor: currentValue === option ? `${formConfig.primary_color}10` : 'white',
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              ) : (
                <input
                  autoFocus
                  type={step.type === 'tel' ? 'tel' : step.type === 'email' ? 'email' : 'text'}
                  placeholder={step.placeholder}
                  value={currentValue}
                  onChange={e => setValue(step.id, e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-4 text-lg transition-colors focus:border-blue-400 focus:bg-white focus:outline-none"
                  style={{ '--tw-ring-color': formConfig.primary_color } as any}
                />
              )}

              {step.type !== 'select' && (
                <p className="mt-2 text-xs text-gray-400">
                  {step.type === 'terms' ? '' : 'Pressione Enter ↵ para continuar'}
                </p>
              )}
            </div>

            {/* Navigation */}
            <div className="mt-8 flex items-center justify-between">
              <button
                type="button"
                onClick={goBack}
                disabled={currentStep === 0}
                className="flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 disabled:invisible"
              >
                <ArrowLeft className="h-4 w-4" /> Voltar
              </button>

              <button
                type="button"
                onClick={goNext}
                disabled={!canProceed() || loading}
                className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all hover:shadow-lg disabled:opacity-40"
                style={{ backgroundColor: formConfig.primary_color }}
              >
                {currentStep === totalSteps - 1 ? (
                  <>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Enviar</>
                ) : (
                  <>Continuar <ArrowRight className="h-4 w-4" /></>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadFormPage;
