/**
 * Channel display order, one order per patient group (as in production's
 * "Order Channels"). The TV lists a group's channels in this order. A group
 * contains the channels visible to it (`channel.visibility[group]`); channels
 * not yet ordered (new ones) follow at the end in channel-list order.
 *
 * INTERIM PERSISTENCE: localStorage. // TODO(backend)
 */

const ORDER_KEY = 'careinn_channel_order';
export const CHANNEL_ORDER_EVENT = 'careinn:channel-order-changed';

export type ChannelGroup = 'adults' | 'kids' | 'vip';
export const CHANNEL_GROUPS: { id: ChannelGroup; label: string }[] = [
  { id: 'adults', label: 'General' },
  { id: 'kids', label: 'Kids' },
  { id: 'vip', label: 'VIP' },
];

interface Orderable {
  id: string;
  visibility: Record<ChannelGroup, boolean>;
}

function readAll(): Partial<Record<ChannelGroup, string[]>> {
  if (typeof window === 'undefined') return {};
  try {
    const v = JSON.parse(localStorage.getItem(ORDER_KEY) || '{}');
    return v && typeof v === 'object' && !Array.isArray(v) ? v : {};
  } catch {
    return {};
  }
}

export function channelsForGroup<T extends Orderable>(channels: T[], group: ChannelGroup): T[] {
  return channels.filter((c) => c.visibility?.[group]);
}

/** The group's channels in display order. */
export function orderedChannels<T extends Orderable>(channels: T[], group: ChannelGroup): T[] {
  const visible = channelsForGroup(channels, group);
  const saved = readAll()[group];
  if (!Array.isArray(saved)) return visible;
  const pos = new Map(saved.map((id, i) => [id, i]));
  return visible
    .map((c, i) => ({ c, k: pos.has(c.id) ? pos.get(c.id)! : saved.length + i }))
    .sort((a, b) => a.k - b.k)
    .map(({ c }) => c);
}

export function saveChannelOrder(group: ChannelGroup, orderedIds: string[]): void {
  const all = readAll();
  all[group] = orderedIds;
  localStorage.setItem(ORDER_KEY, JSON.stringify(all));
  window.dispatchEvent(new CustomEvent(CHANNEL_ORDER_EVENT));
}
