import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { CheckCircle, Loader2, Send } from 'lucide-react';

const LeadFormPage = () => {
  const [searchParams] = useSearchParams();
  const origin = searchParams.get('origin') || '';

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const endpoint = `${supabaseUrl}/functions/v1/receive-lead`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      toast.error('Preencha nome e telefone.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          message: message.trim(),
          origin_url: origin,
          user_id: searchParams.get('owner') || '',
          category_id: searchParams.get('category_id') || '',
          utm_source: searchParams.get('utm_source') || '',
          utm_medium: searchParams.get('utm_medium') || '',
          utm_campaign: searchParams.get('utm_campaign') || '',
        }),
      });
      if (!res.ok) throw new Error('Erro ao enviar');
      setSubmitted(true);
    } catch {
      toast.error('Erro ao enviar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Enviado com sucesso!</h2>
          <p className="mt-2 text-gray-500">Entraremos em contato em breve pelo WhatsApp.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-gray-900">Solicite um Orçamento</h1>
        <p className="mt-1 text-sm text-gray-500">Preencha seus dados e entraremos em contato</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <Input
              placeholder="Seu nome"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="h-12"
            />
          </div>
          <div>
            <Input
              placeholder="WhatsApp (ex: 11999990000)"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
              className="h-12"
            />
          </div>
          <div>
            <textarea
              placeholder="Descreva o que precisa..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-input bg-background px-3 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <Button type="submit" className="h-12 w-full gap-2 text-base" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {loading ? 'Enviando...' : 'Enviar'}
          </Button>
        </form>

        {origin && (
          <p className="mt-4 text-center text-xs text-gray-400">
            Origem: {origin}
          </p>
        )}
      </div>
    </div>
  );
};

export default LeadFormPage;
