import { useState, useCallback } from 'react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { useCRM } from '@/contexts/CRMContext';
import { KANBAN_COLUMNS, LeadStatus, Lead } from '@/types/crm';
import { KanbanColumn } from './KanbanColumn';
import { KanbanFilters } from './KanbanFilters';
import { LeadModal } from '@/components/leads/LeadModal';

export function KanbanBoard() {
  const { leads, updateLeadStatus } = useCRM();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [filters, setFilters] = useState({ category: '', professional: '', search: '' });

  const filteredLeads = leads.filter(l => {
    if (filters.category && l.category_id !== filters.category) return false;
    if (filters.professional && l.professional_id !== filters.professional) return false;
    if (filters.search && !l.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const onDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;
    const newStatus = result.destination.droppableId as LeadStatus;
    updateLeadStatus(result.draggableId, newStatus);
  }, [updateLeadStatus]);

  return (
    <div className="flex flex-col gap-4">
      <KanbanFilters filters={filters} setFilters={setFilters} />
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
      {selectedLead && (
        <LeadModal lead={selectedLead} onClose={() => setSelectedLead(null)} />
      )}
    </div>
  );
}
