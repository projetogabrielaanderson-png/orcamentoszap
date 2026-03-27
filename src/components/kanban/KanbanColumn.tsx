import { Droppable, Draggable } from '@hello-pangea/dnd';
import { LeadStatus, Lead, STATUS_CONFIG } from '@/types/crm';
import { LeadCard } from './LeadCard';

interface KanbanColumnProps {
  status: LeadStatus;
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
}

export function KanbanColumn({ status, leads, onLeadClick }: KanbanColumnProps) {
  const config = STATUS_CONFIG[status];

  return (
    <div className="flex w-72 shrink-0 flex-col rounded-xl bg-muted/50 lg:w-80">
      <div className="flex items-center gap-2 p-4 pb-2">
        <div className={`h-2.5 w-2.5 rounded-full bg-${config.color}`} style={{ backgroundColor: `hsl(var(--${config.color}))` }} />
        <h3 className="text-sm font-semibold">{config.label}</h3>
        <span className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
          {leads.length}
        </span>
      </div>
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`min-h-[200px] flex-1 space-y-2 p-2 pt-0 transition-colors ${
              snapshot.isDraggingOver ? 'bg-primary/5 rounded-b-xl' : ''
            }`}
          >
            {leads.map((lead, index) => (
              <Draggable key={lead.id} draggableId={lead.id} index={index}>
                {(prov, snap) => (
                  <div
                    ref={prov.innerRef}
                    {...prov.draggableProps}
                    {...prov.dragHandleProps}
                    className={snap.isDragging ? 'rotate-2 scale-105' : ''}
                    style={prov.draggableProps.style}
                  >
                    <LeadCard lead={lead} onClick={() => onLeadClick(lead)} isNew={status === 'new'} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
