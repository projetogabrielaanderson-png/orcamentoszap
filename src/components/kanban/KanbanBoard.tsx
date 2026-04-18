import { useState, useCallback } from 'react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { useCRM } from '@/contexts/CRMContext';
import { KANBAN_COLUMNS, LeadStatus, Lead, STATUS_CONFIG } from '@/types/crm';
import { KanbanColumn } from './KanbanColumn';
import { KanbanFilters } from './KanbanFilters';
import { LeadModal } from '@/components/leads/LeadModal';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { LeadCard } from './LeadCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ArrowRight } from 'lucide-react';

export function KanbanBoard() {
  const { leads, updateLeadStatus } = useCRM();
  const isMobile = useIsMobile();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [filters, setFilters] = useState({ category: '', professional: '', search: '', dateFrom: '', dateTo: '', utmSource: '' });
  const [activeTab, setActiveTab] = useState<LeadStatus>('new');

  const filteredLeads = leads.filter(l => {
    if (filters.category && l.category_id !== filters.category) return false;
    if (filters.professional && l.professional_id !== filters.professional) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!l.name.toLowerCase().includes(q) && !l.phone.includes(q)) return false;
    }
    if (filters.utmSource && l.utm_source !== filters.utmSource) return false;
    if (filters.dateFrom && l.created_at < filters.dateFrom) return false;
    if (filters.dateTo && l.created_at > filters.dateTo + 'T23:59:59') return false;
    return true;
  });

  const onDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;
    const newStatus = result.destination.droppableId as LeadStatus;
    updateLeadStatus(result.draggableId, newStatus);
  }, [updateLeadStatus]);

  const countByStatus = (s: LeadStatus) => filteredLeads.filter(l => l.status === s).length;

  return (
    <div className="flex flex-col gap-3 md:gap-4">
      <KanbanFilters filters={filters} setFilters={setFilters} />

      {isMobile ? (
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as LeadStatus)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-auto">
            {KANBAN_COLUMNS.map(s => (
              <TabsTrigger key={s} value={s} className="flex-col gap-1 py-2 text-xs data-[state=active]:bg-background">
                <span className="leading-tight">{STATUS_CONFIG[s].label}</span>
                <Badge variant="secondary" className="h-4 min-w-[20px] px-1 text-[10px]">
                  {countByStatus(s)}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
          {KANBAN_COLUMNS.map(s => {
            const colLeads = filteredLeads.filter(l => l.status === s);
            return (
              <TabsContent key={s} value={s} className="mt-3 space-y-2">
                {colLeads.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                    Nenhum lead nesta etapa
                  </div>
                ) : (
                  colLeads.map(lead => (
                    <div key={lead.id} className="space-y-1.5">
                      <LeadCard lead={lead} onClick={() => setSelectedLead(lead)} isNew={s === 'new'} />
                      <div className="flex justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground">
                              <ArrowRight className="h-3 w-3" /> Mover
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {(['new', 'in_progress', 'waiting', 'done'] as LeadStatus[])
                              .filter(target => target !== s)
                              .map(target => (
                                <DropdownMenuItem
                                  key={target}
                                  onClick={() => updateLeadStatus(lead.id, target)}
                                >
                                  {STATUS_CONFIG[target].label}
                                </DropdownMenuItem>
                              ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
            {KANBAN_COLUMNS.map(status => (
              <KanbanColumn
                key={status}
                status={status}
                leads={filteredLeads.filter(l => l.status === status)}
                onLeadClick={setSelectedLead}
              />
            ))}
          </div>
        </DragDropContext>
      )}

      {selectedLead && (
        <LeadModal lead={selectedLead} onClose={() => setSelectedLead(null)} />
      )}
    </div>
  );
}
