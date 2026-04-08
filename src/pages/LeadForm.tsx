import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { CheckCircle, Loader2, ArrowRight, ArrowLeft, Send, Shield, User, Phone, MessageSquare, CalendarDays, FileCheck, Check } from 'lucide-react';
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
  whatsapp_number: string;
}

const defaultFormConfig: FormConfigData = {
  title: 'Solicite um Orçamento',
  description: 'Preencha seus dados e entraremos em contato',
  primary_color: '#3b82f6',
  bg_color: '#f0f4ff',
  logo_url: '',
  custom_fields: [],
};

const DAYS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS_PT = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

function MiniCalendar({ value, onChange, primaryColor }: { value: string; onChange: (v: string) => void; primaryColor: string }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const initial = value ? new Date(value + 'T00:00:00') : today;
  const [viewMonth, setViewMonth] = useState(initial.getMonth());
  const [viewYear, setViewYear] = useState(initial.getFullYear());

  const days = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1);
    const startDay = first.getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < startDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }, [viewMonth, viewYear]);

  const canGoPrev = viewYear > today.getFullYear() || (viewYear === today.getFullYear() && viewMonth > today.getMonth());

  const handleSelect = (day: number) => {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (dateStr < todayStr) return;
    onChange(dateStr);
  };

  return (
    <div className="rounded-2xl border-2 border-gray-100 bg-white p-4 shadow-sm">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => {
            if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
            else setViewMonth(m => m - 1);
          }}
          disabled={!canGoPrev}
          className="flex h-10 w-10 items-center justify-center rounded-xl transition-all active:scale-90 disabled:opacity-30"
          style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="text-base font-bold text-gray-800">
          {MONTHS_PT[viewMonth]} {viewYear}
        </span>
        <button
          type="button"
          onClick={() => {
            if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
            else setViewMonth(m => m + 1);
          }}
          className="flex h-10 w-10 items-center justify-center rounded-xl transition-all active:scale-90"
          style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS_PT.map(d => (
          <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          if (day === null) return <div key={`e${i}`} />;
          const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isPast = dateStr < todayStr;
          const isSelected = dateStr === value;
          const isToday = dateStr === todayStr;
          return (
            <button
              key={i}
              type="button"
              disabled={isPast}
              onClick={() => handleSelect(day)}
              className={`relative flex h-11 w-full items-center justify-center rounded-xl text-sm font-medium transition-all duration-150 active:scale-90
                ${isPast ? 'text-gray-200 cursor-not-allowed' : 'hover:shadow-md cursor-pointer'}
                ${isToday && !isSelected ? 'font-bold' : ''}
              `}
              style={{
                backgroundColor: isSelected ? primaryColor : undefined,
                color: isSelected ? 'white' : isPast ? undefined : isToday ? primaryColor : '#374151',
                boxShadow: isSelected ? `0 4px 14px ${primaryColor}40` : undefined,
              }}
            >
              {day}
              {isToday && !isSelected && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full" style={{ backgroundColor: primaryColor }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected display */}
      {value && (
        <div className="mt-3 flex items-center justify-center gap-2 rounded-xl py-2 text-sm font-semibold" style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}>
          <CalendarDays className="h-4 w-4" />
          {(() => { const [y, m, d] = value.split('-'); return `${d}/${m}/${y}`; })()}
        </div>
      )}
    </div>
  );
}

interface Step {
  id: string;
  label: string;
  subtitle?: string;
  placeholder: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'terms' | 'schedule';
  required: boolean;
  icon: typeof User;
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
  const [isAnimating, setIsAnimating] = useState(false);
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
      subtitle: 'Precisamos saber como te chamar',
      placeholder: 'Digite seu nome completo',
      type: 'text',
      required: true,
      icon: User,
      validate: (v) => (!v.trim() || v.trim().length < 2) ? 'Nome deve ter pelo menos 2 caracteres' : null,
    },
    {
      id: 'phone',
      label: 'Qual seu WhatsApp?',
      subtitle: 'Para entrarmos em contato',
      placeholder: '(44) 99999-0000',
      type: 'tel',
      required: true,
      icon: Phone,
      validate: (v) => {
        const digits = v.replace(/\D/g, '');
        return (digits.length < 10 || digits.length > 11) ? 'Telefone inválido. Use DDD + número' : null;
      },
    },
    ...formConfig.custom_fields.filter(f => f.label.trim()).map((field, i) => ({
      id: `custom_${i}`,
      label: field.label,
      subtitle: field.required ? 'Campo obrigatório' : 'Opcional',
      placeholder: field.label,
      type: field.type === 'select' ? 'select' as const : field.type === 'textarea' ? 'textarea' as const : field.type === 'email' ? 'email' as const : 'text' as const,
      required: field.required,
      icon: MessageSquare,
      options: field.options,
      validate: field.required ? ((v: string) => !v.trim() ? `${field.label} é obrigatório` : null) : undefined,
    })),
    {
      id: 'schedule',
      label: 'Quando você gostaria de ser atendido?',
      subtitle: 'Escolha sua preferência de data e horário',
      placeholder: '',
      type: 'schedule',
      required: false,
      icon: CalendarDays,
    },
    {
      id: 'message',
      label: 'Descreva o que você precisa',
      subtitle: 'Quanto mais detalhes, melhor poderemos ajudá-lo',
      placeholder: 'Conte-nos mais detalhes sobre sua necessidade...',
      type: 'textarea',
      required: false,
      icon: MessageSquare,
    },
    {
      id: 'terms',
      label: 'Quase lá!',
      subtitle: 'Aceite os termos para finalizar sua solicitação',
      placeholder: '',
      type: 'terms',
      required: true,
      icon: FileCheck,
    },
  ];

  const totalSteps = steps.length;
  const step = steps[currentStep];
  const progress = ((currentStep + 1) / totalSteps) * 100;
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
    if (step.type === 'schedule') return true;
    if (step.required && !currentValue.trim()) return false;
    if (step.validate) return !step.validate(currentValue);
    return true;
  }, [step, currentValue, acceptedTerms]);

  const animateTransition = (direction: 'forward' | 'backward', cb: () => void) => {
    setSlideDir(direction);
    setIsAnimating(true);
    setTimeout(() => {
      cb();
      setIsAnimating(false);
    }, 150);
  };

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
      animateTransition('forward', () => setCurrentStep(prev => prev + 1));
    } else {
      handleSubmit();
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      animateTransition('backward', () => setCurrentStep(prev => prev - 1));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && step.type !== 'textarea') {
      e.preventDefault();
      goNext();
    }
  };



  const handleSubmit = async () => {
    setLoading(true);
    setPhase('sending');
    setSendingProgress(0);

    const interval = setInterval(() => {
      setSendingProgress(prev => {
        if (prev >= 85) { clearInterval(interval); return 85; }
        return prev + Math.random() * 12;
      });
    }, 350);

    const phoneDigits = (values.phone || '').replace(/\D/g, '');
    const customParts = formConfig.custom_fields
      .filter((f, i) => f.label.trim() && values[`custom_${i}`])
      .map((f, i) => `${f.label}: ${values[`custom_${i}`]}`);
    const scheduleParts = [];
    if (values.schedule_date) {
      const [y, m, d] = values.schedule_date.split('-');
      scheduleParts.push(`Data Preferencial: ${d}/${m}/${y}`);
    }
    if (values.schedule_period) scheduleParts.push(`Período: ${values.schedule_period}`);
    const fullMessage = [(values.message || '').trim(), ...customParts, ...scheduleParts].filter(Boolean).join('\n');

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('receive-lead', {
        body: {
          name: (values.name || '').trim(),
          phone: phoneDigits,
          message: fullMessage,
          origin_url: origin,
          user_id: searchParams.get('owner') || '',
          category_id: categoryId,
          utm_source: searchParams.get('utm_source') || '',
          utm_medium: searchParams.get('utm_medium') || '',
          utm_campaign: searchParams.get('utm_campaign') || '',
        },
      });

      if (invokeError) throw invokeError;
      
      clearInterval(interval);
      setSendingProgress(100);
      setTimeout(() => setPhase('done'), 800);
    } catch (err: any) {
      clearInterval(interval);
      console.error('Submission error:', err);
      
      let errorMsg = 'Erro ao enviar. Tente novamente.';
      
      // Try to extract the specific error from the function response
      if (err.context) {
        try {
          const body = await err.context.json();
          if (body && body.error) {
            errorMsg = body.error;
          }
        } catch (e) {
          console.error('Error parsing error response:', e);
        }
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      toast.error(errorMsg);
      setPhase('quiz');
      setLoading(false);
    }
  };

  const primaryColor = formConfig.primary_color;
  const lightenColor = (hex: string, amount: number) => {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, (num >> 16) + amount);
    const g = Math.min(255, ((num >> 8) & 0x00ff) + amount);
    const b = Math.min(255, (num & 0x0000ff) + amount);
    return `rgb(${r}, ${g}, ${b})`;
  };

  // ── Loading config ──
  if (configLoading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center" style={{ backgroundColor: formConfig.bg_color, backgroundImage: 'url(/images/form-bg.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: primaryColor }} />
          <p className="text-sm text-gray-400 animate-pulse">Carregando formulário...</p>
        </div>
      </div>
    );
  }

  // ── Sending phase ──
  if (phase === 'sending') {
    const sendingSteps = [
      { label: 'Verificando dados...', icon: Shield, threshold: 20 },
      { label: 'Registrando solicitação...', icon: FileCheck, threshold: 50 },
      { label: 'Notificando profissionais...', icon: Send, threshold: 80 },
      { label: 'Finalizado!', icon: CheckCircle, threshold: 100 },
    ];
    const activeIdx = sendingSteps.findIndex(s => sendingProgress <= s.threshold);
    const activeLabel = sendingSteps[activeIdx >= 0 ? activeIdx : sendingSteps.length - 1].label;

    return (
      <div className="flex min-h-[100dvh] items-center justify-center p-4" style={{ backgroundColor: formConfig.bg_color, backgroundImage: 'url(/images/form-bg.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="w-full max-w-md rounded-3xl bg-white p-8 sm:p-12 text-center shadow-2xl">
          {/* Progress ring */}
          <div className="relative mx-auto mb-8 h-28 w-28">
            <svg className="h-28 w-28 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#f1f5f9" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="42" fill="none"
                stroke={primaryColor}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 42}`}
                strokeDashoffset={`${2 * Math.PI * 42 * (1 - sendingProgress / 100)}`}
                className="transition-all duration-500 ease-out"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold" style={{ color: primaryColor }}>
              {Math.round(sendingProgress)}%
            </span>
          </div>

          {/* Sending steps timeline */}
          <div className="space-y-3 text-left mb-6">
            {sendingSteps.map((s, i) => {
              const done = sendingProgress > s.threshold;
              const active = activeIdx === i;
              return (
                <div key={i} className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-all duration-300 ${active ? 'bg-blue-50 font-medium' : done ? 'text-gray-400' : 'text-gray-300'}`}>
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${done ? 'bg-green-100 text-green-600' : active ? 'text-white' : 'bg-gray-100 text-gray-300'}`}
                    style={active ? { backgroundColor: primaryColor } : undefined}>
                    {done ? <Check className="h-3.5 w-3.5" /> : <s.icon className="h-3.5 w-3.5" />}
                  </div>
                  <span>{s.label}</span>
                </div>
              );
            })}
          </div>

          <p className="text-sm text-gray-400 animate-pulse">Aguarde um momento...</p>
        </div>
      </div>
    );
  }

  // ── Success phase ──
  if (phase === 'done') {
    return (
      <div className="relative flex min-h-[100dvh] items-center justify-center p-4 overflow-hidden" style={{ backgroundColor: formConfig.bg_color, backgroundImage: 'url(/images/form-bg.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        {/* Animated background loader */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.07]">
          <img
            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Ccircle fill='%23FF156D' stroke='%23FF156D' stroke-width='15' r='15' cx='35' cy='100'%3E%3Canimate attributeName='cx' calcMode='spline' dur='2' values='35;165;165;35;35' keySplines='0 .1 .5 1;0 .1 .5 1;0 .1 .5 1;0 .1 .5 1' repeatCount='indefinite' begin='0'%3E%3C/animate%3E%3C/circle%3E%3Ccircle fill='%23FF156D' stroke='%23FF156D' stroke-width='15' opacity='.8' r='15' cx='35' cy='100'%3E%3Canimate attributeName='cx' calcMode='spline' dur='2' values='35;165;165;35;35' keySplines='0 .1 .5 1;0 .1 .5 1;0 .1 .5 1;0 .1 .5 1' repeatCount='indefinite' begin='0.05'%3E%3C/animate%3E%3C/circle%3E%3Ccircle fill='%23FF156D' stroke='%23FF156D' stroke-width='15' opacity='.6' r='15' cx='35' cy='100'%3E%3Canimate attributeName='cx' calcMode='spline' dur='2' values='35;165;165;35;35' keySplines='0 .1 .5 1;0 .1 .5 1;0 .1 .5 1;0 .1 .5 1' repeatCount='indefinite' begin='.1'%3E%3C/animate%3E%3C/circle%3E%3Ccircle fill='%23FF156D' stroke='%23FF156D' stroke-width='15' opacity='.4' r='15' cx='35' cy='100'%3E%3Canimate attributeName='cx' calcMode='spline' dur='2' values='35;165;165;35;35' keySplines='0 .1 .5 1;0 .1 .5 1;0 .1 .5 1;0 .1 .5 1' repeatCount='indefinite' begin='.15'%3E%3C/animate%3E%3C/circle%3E%3Ccircle fill='%23FF156D' stroke='%23FF156D' stroke-width='15' opacity='.2' r='15' cx='35' cy='100'%3E%3Canimate attributeName='cx' calcMode='spline' dur='2' values='35;165;165;35;35' keySplines='0 .1 .5 1;0 .1 .5 1;0 .1 .5 1;0 .1 .5 1' repeatCount='indefinite' begin='.2'%3E%3C/animate%3E%3C/circle%3E%3C/svg%3E"
            alt=""
            className="w-[600px] h-[600px]"
          />
        </div>

        <div className="relative w-full max-w-md rounded-3xl bg-white/95 backdrop-blur-sm p-8 sm:p-12 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-500">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full animate-in zoom-in duration-700" style={{ backgroundColor: `${primaryColor}15` }}>
            <div className="flex h-16 w-16 items-center justify-center rounded-full animate-in spin-in-180 duration-700" style={{ backgroundColor: `${primaryColor}25` }}>
              <CheckCircle className="h-8 w-8" style={{ color: primaryColor }} />
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Enviado com sucesso! 🎉</h2>
          <p className="mt-4 text-gray-500 text-base">
            Recebemos sua solicitação, <span className="font-semibold text-gray-700">{values.name}</span>.
          </p>
          <p className="mt-1 text-sm text-gray-400">
            Um profissional entrará em contato pelo WhatsApp em breve.
          </p>
          <div className="mt-8 rounded-2xl border-2 p-5 text-left text-sm animate-in slide-in-from-bottom-4 duration-700 delay-300" style={{ borderColor: `${primaryColor}30`, backgroundColor: `${primaryColor}05` }}>
            <p className="font-semibold mb-3" style={{ color: primaryColor }}>Resumo da solicitação:</p>
            <div className="space-y-2 text-gray-600">
              <p className="flex items-center gap-2"><User className="h-4 w-4 text-gray-400" /> {values.name}</p>
              <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-gray-400" /> {values.phone}</p>
              {values.schedule_date && <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-gray-400" /> {values.schedule_date} {values.schedule_period && `— ${values.schedule_period}`}</p>}
              {values.message && <p className="flex items-center gap-2"><MessageSquare className="h-4 w-4 text-gray-400" /> {values.message}</p>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Quiz phase ──
  const StepIcon = step.icon;

  return (
    <div className="flex min-h-[100dvh] flex-col" style={{ backgroundColor: formConfig.bg_color, backgroundImage: 'url(/images/form-bg.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      {/* Header with timeline */}
      <div className="sticky top-0 z-10 w-full bg-white/80 backdrop-blur-lg border-b border-gray-100 shadow-sm">
        <div className="mx-auto max-w-lg px-4 sm:px-6 py-4">
          {/* Logo / Title */}
          <div className="flex items-center justify-between mb-4">
            {formConfig.logo_url ? (
              <img src={formConfig.logo_url} alt="Logo" className="h-8 object-contain" />
            ) : (
              <span className="text-base font-bold text-gray-800">{formConfig.title}</span>
            )}
            <span className="rounded-full px-3 py-1 text-xs font-semibold text-white" style={{ backgroundColor: primaryColor }}>
              {currentStep + 1} / {totalSteps}
            </span>
          </div>

          {/* Step timeline dots */}
          <div className="flex items-center gap-1">
            {steps.map((s, i) => {
              const completed = i < currentStep;
              const active = i === currentStep;
              return (
                <div key={s.id} className="flex-1 flex flex-col items-center">
                  <div
                    className={`h-2 w-full rounded-full transition-all duration-500 ease-out ${
                      completed ? '' : active ? '' : 'bg-gray-200'
                    }`}
                    style={{
                      backgroundColor: completed ? primaryColor : active ? lightenColor(primaryColor, 80) : undefined,
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="flex flex-1 items-center justify-center px-4 py-6 sm:p-8">
        <div
          key={currentStep}
          className={`w-full max-w-lg transition-all duration-300 ease-out ${
            isAnimating
              ? 'opacity-0 scale-95'
              : 'opacity-100 scale-100'
          }`}
          style={{
            transform: isAnimating
              ? slideDir === 'forward' ? 'translateX(20px)' : 'translateX(-20px)'
              : 'translateX(0)',
          }}
        >
          <div className="rounded-3xl bg-white p-6 sm:p-10 shadow-xl shadow-gray-200/50">
            {/* Step icon badge */}
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl text-white" style={{ backgroundColor: primaryColor }}>
                <StepIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: primaryColor }}>
                  Etapa {currentStep + 1}
                </p>
                {step.subtitle && <p className="text-xs text-gray-400">{step.subtitle}</p>}
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">{step.label}</h2>

            <div className="mt-6">
              {step.type === 'schedule' ? (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Data Preferencial
                    </label>
                    <MiniCalendar
                      value={values.schedule_date || ''}
                      onChange={(date) => setValues(prev => ({ ...prev, schedule_date: date }))}
                      primaryColor={primaryColor}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Período</label>
                    <div className="grid grid-cols-2 gap-2.5">
                      {[
                        { label: 'Manhã', emoji: '🌅' },
                        { label: 'Tarde', emoji: '☀️' },
                        { label: 'Noite', emoji: '🌙' },
                        { label: 'Qualquer', emoji: '📅' },
                      ].map((period) => (
                        <button
                          key={period.label}
                          type="button"
                          onClick={() => setValues(prev => ({ ...prev, schedule_period: period.label }))}
                          className="flex items-center justify-center gap-2 rounded-2xl border-2 p-4 text-base font-medium transition-all duration-200 hover:shadow-md active:scale-[0.98]"
                          style={{
                            borderColor: values.schedule_period === period.label ? primaryColor : '#e5e7eb',
                            backgroundColor: values.schedule_period === period.label ? `${primaryColor}10` : 'white',
                            color: values.schedule_period === period.label ? primaryColor : '#374151',
                          }}
                        >
                          <span className="text-xl">{period.emoji}</span>
                          {period.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-700">
                    <Info className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>A data é apenas uma preferência. Confirmaremos a disponibilidade exata pelo WhatsApp.</span>
                  </div>
                </div>
              ) : step.type === 'terms' ? (
                <div className="space-y-5">
                  <label
                    className="flex items-start gap-4 cursor-pointer rounded-2xl border-2 p-5 transition-all duration-200 hover:bg-gray-50 active:scale-[0.99]"
                    style={{ borderColor: acceptedTerms ? primaryColor : '#e5e7eb', backgroundColor: acceptedTerms ? `${primaryColor}05` : 'white' }}
                  >
                    <div
                      className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition-all duration-200"
                      style={{
                        borderColor: acceptedTerms ? primaryColor : '#d1d5db',
                        backgroundColor: acceptedTerms ? primaryColor : 'transparent',
                      }}
                    >
                      {acceptedTerms && <Check className="h-3.5 w-3.5 text-white" />}
                    </div>
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={e => setAcceptedTerms(e.target.checked)}
                      className="sr-only"
                    />
                    <span className="text-sm text-gray-600 leading-relaxed">
                      Li e aceito os{' '}
                      <a href="/termos" target="_blank" rel="noopener noreferrer" className="underline font-semibold" style={{ color: primaryColor }}>
                        Termos de Uso
                      </a>{' '}
                      e a{' '}
                      <a href="/privacidade" target="_blank" rel="noopener noreferrer" className="underline font-semibold" style={{ color: primaryColor }}>
                        Política de Privacidade (LGPD)
                      </a>
                    </span>
                  </label>
                  <div className="flex items-center gap-2 rounded-xl bg-gray-50 p-3 text-xs text-gray-400">
                    <Shield className="h-4 w-4" />
                    Seus dados estão protegidos conforme a LGPD
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
                  className="w-full rounded-2xl border-2 border-gray-200 bg-gray-50/50 px-5 py-4 text-base transition-all duration-200 focus:border-transparent focus:bg-white focus:outline-none focus:ring-2 resize-none"
                  style={{ '--tw-ring-color': primaryColor } as any}
                />
              ) : step.type === 'select' ? (
                <div className="space-y-2.5">
                  {step.options?.map((option, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => { setValue(step.id, option); setTimeout(goNext, 300); }}
                      className="w-full rounded-2xl border-2 p-4.5 text-left text-base font-medium transition-all duration-200 hover:shadow-md active:scale-[0.98]"
                      style={{
                        borderColor: currentValue === option ? primaryColor : '#e5e7eb',
                        backgroundColor: currentValue === option ? `${primaryColor}10` : 'white',
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
                  className="w-full rounded-2xl border-2 border-gray-200 bg-gray-50/50 px-5 py-4 sm:py-5 text-lg transition-all duration-200 focus:border-transparent focus:bg-white focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': primaryColor } as any}
                />
              )}

              {step.type !== 'select' && step.type !== 'terms' && step.type !== 'schedule' && (
                <p className="mt-3 text-center text-xs text-gray-400">
                  Pressione <kbd className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-gray-500">Enter ↵</kbd> para continuar
                </p>
              )}
            </div>

            {/* Navigation — stacked on mobile */}
            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={goBack}
                disabled={currentStep === 0}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-gray-200 px-6 py-4 text-base font-semibold text-gray-500 transition-all duration-200 hover:bg-gray-50 active:scale-[0.98] disabled:invisible sm:w-auto sm:py-3"
              >
                <ArrowLeft className="h-5 w-5" /> Voltar
              </button>

              <button
                type="button"
                onClick={goNext}
                disabled={!canProceed() || loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl px-8 py-4 sm:py-3.5 text-base font-bold text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:brightness-110 active:scale-[0.98] disabled:opacity-40 disabled:shadow-none sm:w-auto"
                style={{ backgroundColor: primaryColor }}
              >
                {currentStep === totalSteps - 1 ? (
                  <>{loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />} Enviar solicitação</>
                ) : (
                  <>Continuar <ArrowRight className="h-5 w-5" /></>
                )}
              </button>
            </div>
          </div>

          {/* Footer note */}
          <p className="mt-4 text-center text-[11px] text-gray-300">
            {formConfig.description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LeadFormPage;
