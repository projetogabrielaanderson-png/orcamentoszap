import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useCRM } from '@/contexts/CRMContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Save, Plus, Trash2, Bell, Building2, Palette } from 'lucide-react';

interface UserSettings {
  company_name: string;
  company_logo: string;
  company_phone: string;
  notification_sound: boolean;
  notification_push: boolean;
}

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

  const handleRequestPush = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        setSettings(s => ({ ...s, notification_push: true }));
        toast.success('Notificações push ativadas!');
      } else {
        toast.error('Permissão negada pelo navegador');
      }
    }
  };

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
            <div className="flex items-center justify-between">
              <div>
                <Label>Notificações push no navegador</Label>
                <p className="text-xs text-muted-foreground mt-1">Receba alertas mesmo com a aba minimizada</p>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={settings.notification_push} onCheckedChange={v => setSettings(s => ({ ...s, notification_push: v }))} />
                {'Notification' in window && Notification.permission !== 'granted' && (
                  <Button variant="outline" size="sm" onClick={handleRequestPush}>Permitir</Button>
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
