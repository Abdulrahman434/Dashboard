/**
 * Drag-to-reorder table rows (dnd-kit), shared by Categories Manager and
 * Manage Items. Only the grip handle starts a drag, so clicks on the rest of
 * the row keep working.
 */
import type { ReactNode } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from './restrictToVerticalAxis';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { cx } from './careSuiteAtoms';

export function SortableRows({
  ids,
  onReorder,
  children,
}: {
  ids: string[];
  onReorder: (orderedIds: string[]) => void;
  children: ReactNode;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from < 0 || to < 0) return;
    onReorder(arrayMove(ids, from, to));
  };
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  );
}

/** A sortable <tr>. `handle` renders the grip cell; pass `disabled` to freeze the row. */
export function SortableTr({
  id,
  disabled,
  className,
  onClick,
  children,
}: {
  id: string;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
  children: (handle: ReactNode) => ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled });
  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    position: 'relative' as const,
    zIndex: isDragging ? 10 : undefined,
  };
  const handle = (
    <button
      type="button"
      {...attributes}
      {...listeners}
      onClick={(e) => e.stopPropagation()}
      disabled={disabled}
      title={disabled ? undefined : 'Drag to reorder'}
      className={cx(
        'p-1 rounded-md text-[#9099ab] transition-colors',
        disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-grab active:cursor-grabbing hover:bg-[#eef1f7] hover:text-[#16274D]',
      )}
    >
      <GripVertical size={16} />
    </button>
  );
  return (
    <tr
      ref={setNodeRef}
      style={style}
      onClick={onClick}
      className={cx(className, isDragging && 'bg-white shadow-[0_6px_18px_rgba(22,39,77,.14)]')}
    >
      {children(handle)}
    </tr>
  );
}

/** 1-based order badge used in both tables. */
export function OrderBadge({ n }: { n: number }) {
  return (
    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#eaf7fc] text-[#1d7da3] text-[13px] font-semibold">
      {n}
    </span>
  );
}
