import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';
import type { FormConfig } from './FormEditor';

interface FormPreviewProps {
  config: FormConfig;
  categoryName: string;
}

export function FormPreview({ config, categoryName }: FormPreviewProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <ExternalLink className="h-4 w-4" /> Preview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="rounded-2xl p-8 transition-colors"
          style={{ backgroundColor: config.bg_color }}
        >
          <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
            {config.logo_url && (
              <img src={config.logo_url} alt="Logo" className="mx-auto mb-4 h-12 object-contain" />
            )}
            <h3 className="text-2xl font-bold" style={{ color: '#1e293b' }}>{config.title}</h3>
            <p className="mt-1 text-sm" style={{ color: '#64748b' }}>{config.description}</p>

            <div className="mt-6 space-y-3">
              <input
                placeholder="Seu nome"
                disabled
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm"
              />
              <input
                placeholder="WhatsApp (ex: (44) 99999-0000)"
                disabled
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm"
              />

              {config.custom_fields.filter(f => f.label.trim()).map((field, i) => {
                if (field.type === 'textarea') {
                  return (
                    <textarea
                      key={i}
                      placeholder={field.label}
                      disabled
                      rows={3}
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm resize-none"
                    />
                  );
                }
                if (field.type === 'select') {
                  return (
                    <select key={i} disabled className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-400">
                      <option>{field.label}</option>
                      {field.options?.map((o, j) => <option key={j}>{o}</option>)}
                    </select>
                  );
                }
                return (
                  <input
                    key={i}
                    type={field.type === 'url' ? 'url' : field.type === 'email' ? 'email' : 'text'}
                    placeholder={field.type === 'url' ? `${field.label} (https://...)` : field.label}
                    disabled
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm"
                  />
                );
              })}

              <textarea
                placeholder="Descreva o que precisa..."
                disabled
                rows={3}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm resize-none"
              />

              <button
                disabled
                className="w-full rounded-lg py-3 text-sm font-semibold text-white transition-colors"
                style={{ backgroundColor: config.primary_color }}
              >
                Enviar
              </button>
            </div>
            <p className="mt-3 text-center text-[10px] text-gray-400">{categoryName}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
