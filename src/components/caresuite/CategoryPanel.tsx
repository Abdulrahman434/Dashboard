import { Layers, LayoutList, FolderX } from 'lucide-react';
import type { TeamCategory } from '../../services/careSuiteService';
import CategorySidebar from '../CategorySidebar';
import { ItemIcon } from './careSuiteIcons';

export const ALL = '__all';
export const UNCATEGORIZED = '__none';

/**
 * Items Manager's category list on the shared CategorySidebar: All items, each
 * category in patient order (drag to reorder), then Uncategorized.
 */
export default function CategoryPanel({
  categories,
  counts,
  selected,
  onSelect,
  onCollapse,
  onReorder,
  onAdd,
  locked,
}: {
  categories: TeamCategory[];
  /** visible (non-archived) item count per category id, plus ALL and UNCATEGORIZED */
  counts: Record<string, number>;
  selected: string;
  onSelect: (id: string) => void;
  onCollapse: () => void;
  onReorder?: (orderedIds: string[]) => void;
  onAdd?: () => void;
  /** while an item reorder is unsaved, switching would drop it */
  locked?: boolean;
}) {
  return (
    <CategorySidebar
      title="Categories"
      selectedId={selected}
      onSelect={onSelect}
      onCollapse={onCollapse}
      onReorder={onReorder}
      onAdd={onAdd}
      locked={locked}
      lockedReason="Save or cancel the new item order first"
      allRow={{ id: ALL, label: 'All items', icon: <LayoutList size={17} />, count: counts[ALL] ?? 0 }}
      items={categories.map((c) => ({
        id: c.id,
        label: c.nameEn,
        icon: c.icon || c.iconSvg ? <ItemIcon name={c.icon} svg={c.iconSvg} size={17} /> : <Layers size={17} />,
        sublabel: c.active ? undefined : 'Hidden from patients',
        count: counts[c.id] ?? 0,
      }))}
      tailRows={
        (counts[UNCATEGORIZED] ?? 0) > 0
          ? [{ id: UNCATEGORIZED, label: 'Uncategorized', icon: <FolderX size={17} />, sublabel: 'Not shown to patients', count: counts[UNCATEGORIZED] }]
          : undefined
      }
    />
  );
}
