import { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useCRM } from '@/contexts/CRMContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Save, Plus, Trash2, Bell, Building2, Palette, Smartphone, AlertCircle } from 'lucide-react';

interface UserSettings {
  company_name: string;
  company_logo: string;
  company_phone: string;
  notification_sound: boolean;
  notification_push: boolean;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

const isInIframe = (() => {
  try { return window.self !== window.top; } catch { return true; }
})();
const isPreviewHost =
  typeof window !== 'undefined' &&
  (window.location.hostname.includes('id-preview--') ||
    window.location.hostname.includes('lovableproject.com'));
const pushSupported =
  typeof window !== 'undefined' &&
  'serviceWorker' in navigator &&
  'PushManager' in window &&
  'Notification' in window;

const SettingsPage = () => {
  const { user, categories } = useCRM();
  const [settings, setSettings] = useState<UserSettings>({
    company_name: '',
    company_logo: '',
    company_phone: '',
    notification_sound: true,
    notification_push: false,
  });
  const [saving, setSaving] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('217 91% 60%');
  const [addingCat, setAddingCat] = useState(false);
  const [pushActive, setPushActive] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from('user_settings').select('*').eq('user_id', user.id).maybeSingle().then(({ data }) => {
      if (data) {
        setSettings({
          company_name: (data as any).company_name || '',
          company_logo: (data as any).company_logo || '',
          company_phone: (data as any).company_phone || '',
          notification_sound: (data as any).notification_sound ?? true,
          notification_push: (data as any).notification_push ?? false,
        });
      }
    });
  }, [user]);

  // Detecta se este device já está inscrito
  useEffect(() => {
    if (!pushSupported || isInIframe || isPreviewHost) return;
    navigator.serviceWorker.getRegistration().then(async (reg) => {
      if (!reg) return;
      const sub = await reg.pushManager.getSubscription();
      setPushActive(!!sub);
    });
  }, []);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('user_settings').upsert({
      user_id: user.id,
      ...settings,
    } as any, { onConflict: 'user_id' });
    setSaving(false);
    if (error) toast.error('Erro ao salvar configurações');
    else toast.success('Configurações salvas!');
  };

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    setAddingCat(true);
    const { error } = await supabase.from('categories').insert({
      name: newCatName.trim(),
      color: newCatColor,
    });
    setAddingCat(false);
    if (error) toast.error('Erro ao criar categoria');
    else {
      toast.success('Categoria criada!');
      setNewCatName('');
      window.location.reload();
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) toast.error('Erro ao remover categoria (pode ter leads vinculados)');
    else {
      toast.success('Categoria removida!');
      window.location.reload();
    }
  };

  const handleEnablePush = useCallback(async () => {
    if (!pushSupported) {
      toast.error('Seu navegador não suporta push notifications');
      return;
    }
    if (isInIframe || isPreviewHost) {
      toast.error('Push só funciona no app publicado, não no preview do editor');
      return;
    }
    setPushBusy(true);
    try {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') {
        toast.error('Permissão negada pelo navegador');
        return;
      }
      const reg = await navigator.serviceWorker.ready;

      // Pega public key
      const { data: keyData, error: keyErr } = await supabase.functions.invoke('vapid-public-key');
      if (keyErr || !keyData?.publicKey) {
        toast.error('Erro ao obter chave do servidor');
        return;
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(keyData.publicKey).buffer as ArrayBuffer,
      });

      const subJson: any = sub.toJSON();
      const { error: subErr } = await supabase.functions.invoke('push-subscribe', {
        body: {
          endpoint: sub.endpoint,
          p256dh: subJson.keys?.p256dh,
          auth: subJson.keys?.auth,
          user_agent: navigator.userAgent,
        },
      });
      if (subErr) {
        toast.error('Erro ao registrar este dispositivo');
        return;
      }
      setPushActive(true);
      setSettings((s) => ({ ...s, notification_push: true }));
      toast.success('Push notifications ativadas neste dispositivo!');
    } catch (e: any) {
      toast.error('Erro: ' + (e?.message || 'desconhecido'));
    } finally {
      setPushBusy(false);
    }
  }, []);

  const handleDisablePush = useCallback(async () => {
    if (!pushSupported) return;
    setPushBusy(true);
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        await supabase.functions.invoke('push-unsubscribe', { body: { endpoint: sub.endpoint } });
        await sub.unsubscribe();
      }
      setPushActive(false);
      toast.success('Push desativado neste dispositivo');
    } catch (e: any) {
      toast.error('Erro ao desativar');
    } finally {
      setPushBusy(false);
    }
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
          <p className="text-sm text-muted-foreground">Gerencie sua empresa, notificações e categorias</p>
        </div>

        {/* Company */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" /> Dados da Empresa</CardTitle>
            <CardDescription>Informações que aparecem nos formulários e relatórios</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nome da empresa</Label>
              <Input value={settings.company_name} onChange={e => setSettings(s => ({ ...s, company_name: e.target.value }))} placeholder="Minha Empresa" />
            </div>
            <div className="space-y-2">
              <Label>URL do logo</Label>
              <Input value={settings.company_logo} onChange={e => setSettings(s => ({ ...s, company_logo: e.target.value }))} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input value={settings.company_phone} onChange={e => setSettings(s => ({ ...s, company_phone: e.target.value }))} placeholder="(11) 99999-9999" />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" /> Notificações</CardTitle>
            <CardDescription>Configure alertas para novos leads</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Som de notificação</Label>
              <Switch checked={settings.notification_sound} onCheckedChange={v => setSettings(s => ({ ...s, notification_sound: v }))} />
            </div>

            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <Smartphone className="h-5 w-5 mt-0.5 text-primary" />
                  <div>
                    <p className="font-medium text-sm">Push Notifications (PWA)</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Receba alertas mesmo com a aba/app fechado. Funciona no celular após instalar o app.
                    </p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${pushActive ? 'bg-green-500/10 text-green-600' : 'bg-muted text-muted-foreground'}`}>
                  {pushActive ? 'Ativo neste device' : 'Desativado'}
                </span>
              </div>

              {(isInIframe || isPreviewHost) && (
                <div className="flex items-start gap-2 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 p-2.5 text-xs">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Push só funciona no app publicado (orcamentoszap.lovable.app), não dentro do preview do editor.</span>
                </div>
              )}

              <div className="flex gap-2">
                {!pushActive ? (
                  <Button onClick={handleEnablePush} disabled={pushBusy || !pushSupported} size="sm" className="gap-2">
                    <Bell className="h-4 w-4" />
                    {pushBusy ? 'Ativando...' : 'Ativar neste dispositivo'}
                  </Button>
                ) : (
                  <Button onClick={handleDisablePush} disabled={pushBusy} size="sm" variant="outline" className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    {pushBusy ? 'Desativando...' : 'Desativar neste dispositivo'}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5" /> Categorias</CardTitle>
            <CardDescription>Gerencie as categorias de serviço</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {categories.map(cat => (
                <div key={cat.id} className="flex items-center justify-between rounded-lg border px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: `hsl(${cat.color})` }} />
                    <span className="text-sm font-medium">{cat.name}</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteCategory(cat.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="Nova categoria..." className="flex-1" />
              <Input value={newCatColor} onChange={e => setNewCatColor(e.target.value)} placeholder="HSL: 217 91% 60%" className="w-40" />
              <Button onClick={handleAddCategory} disabled={addingCat || !newCatName.trim()} size="sm" className="gap-1">
                <Plus className="h-4 w-4" /> Adicionar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" /> {saving ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </AppLayout>
  );
};

export default SettingsPage;
