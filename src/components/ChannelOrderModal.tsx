import { useMemo, useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, sortableKeyboardCoordinates, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Tv, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { SingleSelectDropdown } from './UnifiedDropdown';
import { CHANNEL_GROUPS, orderedChannels, saveChannelOrder, type ChannelGroup } from '../services/channelOrder';

interface OrderChannel {
  id: string;
  nameEn: string;
  imageUrl: string;
  visibility: Record<ChannelGroup, boolean>;
}

function Card({ c, n }: { c: OrderChannel; n: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: c.id });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{ transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 20 : undefined }}
      aria-label={`${n}. ${c.nameEn}. Drag to move`}
      className={`relative flex flex-col items-center justify-between h-[118px] rounded-xl border bg-white px-3 pt-3 pb-2.5 select-none touch-none cursor-grab active:cursor-grabbing outline-none focus-visible:ring-2 focus-visible:ring-[#4EBEE3] transition-shadow ${
        isDragging ? 'border-[#4EBEE3] shadow-[0_12px_28px_rgba(22,39,77,.22)] scale-[1.03]' : 'border-[#e2e6ee] hover:border-[#c9d2e1] hover:shadow-sm'
      }`}
    >
      <span className="absolute top-2 left-2 min-w-[22px] h-[22px] px-1 rounded-full bg-[#4EBEE3] text-white text-[11.5px] font-semibold flex items-center justify-center tabular-nums">{n}</span>
      <GripVertical size={15} className="absolute top-2.5 right-2 text-[#9099ab]" aria-hidden />
      <div className="flex-1 w-full flex items-center justify-center pt-2">
        {c.imageUrl ? (
          <img src={c.imageUrl} alt="" draggable={false} className="max-h-[52px] max-w-[88%] object-contain" />
        ) : (
          <span className="w-11 h-11 rounded-lg bg-[#f3f4f6] flex items-center justify-center text-[#9099ab]"><Tv size={20} /></span>
        )}
      </div>
      <div className="w-full text-center text-[13px] font-semibold text-[#16274D] truncate pt-1.5 border-t border-[#f0f2f6]" title={c.nameEn}>
        {c.nameEn}
      </div>
    </div>
  );
}

/**
 * Order Channels: drag channel cards to set the TV display order for one
 * patient group at a time (General, Kids, VIP). Saved per group.
 */
export default function ChannelOrderModal({ channels, onClose }: { channels: OrderChannel[]; onClose: () => void }) {
  const [group, setGroup] = useState<ChannelGroup>('adults');
  const initial = useMemo(() => orderedChannels(channels, group).map((c) => c.id), [channels, group]);
  const [draft, setDraft] = useState<string[] | null>(null);
  const ids = draft ?? initial;
  const byId = new Map(channels.map((c) => [c.id, c]));
  const dirty = !!draft && draft.some((id, i) => id !== initial[i]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    setDraft(arrayMove(ids, ids.indexOf(String(active.id)), ids.indexOf(String(over.id))));
  };

  const switchGroup = (g: string) => {
    if (g === group) return;
    if (dirty && !confirm('Discard the unsaved order for this group?')) return;
    setDraft(null);
    setGroup(g as ChannelGroup);
  };
  const close = () => {
    if (dirty && !confirm('Discard the unsaved channel order?')) return;
    onClose();
  };
  const save = () => {
    saveChannelOrder(group, ids);
    toast.success(`Channel order saved for ${CHANNEL_GROUPS.find((g) => g.id === group)!.label}`);
    setDraft(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#16274D]/45 flex items-center justify-center p-4 font-['Poppins',sans-serif]" onClick={close}>
      <div role="dialog" aria-modal="true" aria-label="Order channels" className="w-full max-w-[860px] max-h-[88vh] flex flex-col bg-white rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e7e9f0]">
          <h3 className="text-[18px] font-semibold text-[#16274D]">Order Channels</h3>
          <button onClick={close} className="w-9 h-9 flex items-center justify-center rounded-[10px] text-[#5d6678] hover:bg-[#f7f8fb] cursor-pointer" title="Close" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="flex items-center justify-between gap-3 flex-wrap px-5 py-3.5">
          <p className="flex-1 min-w-[240px] text-[14px] text-[#16274D]">
            Drag channels to set the display order for the selected group.
            <span className="block text-[12.5px] text-[#6B7280]">Patients in this group see channels in this order on the TV. Use the keyboard: Space to pick up, arrows to move.</span>
          </p>
          <SingleSelectDropdown options={CHANNEL_GROUPS.map((g) => ({ value: g.id, label: g.label }))} value={group} onChange={switchGroup} className="min-w-[180px]" size="md" />
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-5">
          {ids.length === 0 ? (
            <div className="text-center py-14 text-[14px] text-[#5d6678]">No channels are visible to this group. Set channel visibility in the channel list.</div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <SortableContext items={ids} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(146px,1fr))] gap-3">
                  {ids.map((id, i) => {
                    const c = byId.get(id);
                    return c ? <Card key={id} c={c} n={i + 1} /> : null;
                  })}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-[#e7e9f0] bg-[#f7f8fb] rounded-b-2xl">
          <span className="text-[12.5px] text-[#6B7280]">{ids.length} channel{ids.length === 1 ? '' : 's'}{dirty ? ' · unsaved changes' : ''}</span>
          <div className="flex gap-2">
            <button onClick={close} className="h-[38px] px-4 rounded-[10px] border border-[#d6dae6] bg-white text-[13.5px] font-medium text-[#16274D] hover:bg-[#f3f4f6] cursor-pointer">Cancel</button>
            <button onClick={save} disabled={!dirty} className="h-[38px] px-5 rounded-[10px] bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white text-[13.5px] font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}
