/**
 * Shared left-hand category panel (CareSuite Items Manager, Hospital Profile,
 * Channels). One look everywhere; each page switches on what it needs:
 * an "All" row, counts, a status line, drag-to-reorder, Add, collapse.
 */
import type { ReactNode } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, PanelLeftClose, Plus } from 'lucide-react';
import { restrictToVerticalAxis } from './caresuite/restrictToVerticalAxis';

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

export interface SidebarItem {
  id: string;
  label: string;
  icon?: ReactNode;
  /** small line under the label, e.g. "Text only" or "Hidden from patients" */
  sublabel?: string;
  /** warn = amber (e.g. "No content yet") */
  sublabelTone?: 'muted' | 'warn';
  count?: number;
}

interface Props {
  title: string;
  /** shown at the right of the header when there is no collapse button, e.g. "Patient order" */
  hint?: string;
  items: SidebarItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  /** pinned row above the list, e.g. All items */
  allRow?: SidebarItem;
  /** pinned rows below the list, e.g. Uncategorized */
  tailRows?: SidebarItem[];
  /** enables drag handles; receives the new order of `items` ids */
  onReorder?: (orderedIds: string[]) => void;
  onAdd?: () => void;
  addLabel?: string;
  onCollapse?: () => void;
  /** freezes selection and reordering (e.g. while an unsaved edit is open) */
  locked?: boolean;
  lockedReason?: string;
  width?: number;
}

function Row({ item, on, locked, lockedReason, onSelect, handle }: { item: SidebarItem; on: boolean; locked?: boolean; lockedReason?: string; onSelect: () => void; handle?: ReactNode }) {
  const disabled = locked && !on;
  return (
    <div className={cx('flex items-center rounded-lg border transition-colors', on ? 'bg-[#eaf7fc] border-[#4EBEE3]' : 'border-transparent hover:bg-[#f7f8fb]', disabled && 'opacity-50')}>
      {handle}
      <button
        type="button"
        onClick={() => !on && !locked && onSelect()}
        disabled={disabled}
        aria-current={on ? 'true' : undefined}
        title={disabled ? lockedReason : undefined}
        className={cx('flex-1 min-w-0 flex items-center gap-2.5 py-2 text-left', handle ? 'pr-2.5' : 'px-2.5', disabled ? 'cursor-not-allowed' : 'cursor-pointer')}
      >
        {item.icon && <span className={cx('shrink-0', on ? 'text-[#1d7da3]' : 'text-[#5d6678]')}>{item.icon}</span>}
        <span className="min-w-0 flex-1">
          <span className={cx('block text-[13.5px] leading-snug [overflow-wrap:anywhere]', on ? 'font-semibold text-[#16274D]' : 'text-[#19233a]')}>{item.label}</span>
          {item.sublabel && <span className={cx('block text-[12px]', item.sublabelTone === 'warn' ? 'text-[#b9770b]' : 'text-[#9099ab]')}>{item.sublabel}</span>}
        </span>
        {item.count !== undefined && <span className="shrink-0 text-[12px] tabular-nums text-[#5d6678] bg-[#f3f4f6] rounded-full px-2 py-0.5">{item.count}</span>}
      </button>
    </div>
  );
}

function SortableRow(props: { item: SidebarItem; on: boolean; locked?: boolean; lockedReason?: string; onSelect: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: props.item.id, disabled: props.locked });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Translate.toString(transform), transition, position: 'relative', zIndex: isDragging ? 10 : undefined }} className={cx(isDragging && 'rounded-lg bg-white shadow-lg')}>
      <Row
        {...props}
        handle={
          <button
            type="button"
            {...attributes}
            {...listeners}
            disabled={props.locked}
            className="self-stretch px-1.5 text-[#9099ab] cursor-grab active:cursor-grabbing hover:text-[#16274D] disabled:opacity-40 disabled:cursor-not-allowed"
            title={props.locked ? props.lockedReason : 'Drag to reorder'}
            aria-label={`Reorder ${props.item.label}`}
          >
            <GripVertical size={15} />
          </button>
        }
      />
    </div>
  );
}

export default function CategorySidebar({
  title, hint, items, selectedId, onSelect, allRow, tailRows, onReorder, onAdd, addLabel = 'Add category', onCollapse, locked, lockedReason = 'Finish or cancel the current change first', width = 216,
}: Props) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const ids = items.map((i) => i.id);
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id || !onReorder) return;
    onReorder(arrayMove(ids, ids.indexOf(String(active.id)), ids.indexOf(String(over.id))));
  };
  const row = (item: SidebarItem) => <Row key={item.id} item={item} on={item.id === selectedId} locked={locked} lockedReason={lockedReason} onSelect={() => onSelect(item.id)} />;

  return (
    <nav aria-label={title} className="shrink-0 self-start bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden font-['Poppins',sans-serif]" style={{ width }}>
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-gray-200">
        <span className="font-semibold text-[14px] text-[#16274D]">{title}</span>
        {onCollapse ? (
          <button onClick={onCollapse} className="p-1 rounded-md text-[#9099ab] hover:text-[#16274D] hover:bg-[#f3f4f6] cursor-pointer" title={`Hide ${title.toLowerCase()}`} aria-label={`Hide ${title.toLowerCase()}`}>
            <PanelLeftClose size={16} />
          </button>
        ) : (
          hint && <span className="text-[12px] text-[#9099ab]">{hint}</span>
        )}
      </div>
      <div className="p-2 space-y-0.5">
        {allRow && (
          <>
            {row(allRow)}
            <div className="border-t border-gray-100 !my-1.5" />
          </>
        )}
        {onReorder ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
            <SortableContext items={ids} strategy={verticalListSortingStrategy}>
              {items.map((item) => (
                <SortableRow key={item.id} item={item} on={item.id === selectedId} locked={locked} lockedReason={lockedReason} onSelect={() => onSelect(item.id)} />
              ))}
            </SortableContext>
          </DndContext>
        ) : (
          items.map(row)
        )}
        {tailRows?.map(row)}
        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
            disabled={locked}
            className="w-full !mt-1.5 flex items-center gap-2 px-2.5 py-2 rounded-lg text-[13px] font-medium text-[#1d7da3] hover:bg-[#eaf7fc] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus size={15} /> {addLabel}
          </button>
        )}
      </div>
    </nav>
  );
}
