/** Tests for per-group channel order — `npm test`. */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

const store = new Map<string, string>();
(globalThis as any).window = globalThis;
(globalThis as any).dispatchEvent = () => true;
(globalThis as any).localStorage = {
  getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
  setItem: (k: string, v: string) => void store.set(k, String(v)),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
};

import { orderedChannels, saveChannelOrder, channelsForGroup, CHANNEL_GROUPS } from './channelOrder.ts';

const ch = (id: string, vis: Partial<Record<'kids' | 'adults' | 'vip', boolean>> = {}) => ({ id, visibility: { kids: false, adults: true, vip: false, ...vis } });
const channels = [ch('a'), ch('b', { kids: true }), ch('c', { adults: false, kids: true }), ch('d', { vip: true })];

beforeEach(() => store.clear());

test('groups are General (adults), Kids and VIP', () => {
  assert.deepEqual(CHANNEL_GROUPS.map((g) => [g.id, g.label]), [['adults', 'General'], ['kids', 'Kids'], ['vip', 'VIP']]);
});

test('a group lists only channels visible to it, in channel-list order by default', () => {
  assert.deepEqual(channelsForGroup(channels, 'kids').map((c) => c.id), ['b', 'c']);
  assert.deepEqual(orderedChannels(channels, 'adults').map((c) => c.id), ['a', 'b', 'd']);
});

test('saved order is per group', () => {
  saveChannelOrder('adults', ['d', 'a', 'b']);
  saveChannelOrder('kids', ['c', 'b']);
  assert.deepEqual(orderedChannels(channels, 'adults').map((c) => c.id), ['d', 'a', 'b']);
  assert.deepEqual(orderedChannels(channels, 'kids').map((c) => c.id), ['c', 'b']);
});

test('new channels join the end; removed or hidden ones drop out', () => {
  saveChannelOrder('adults', ['d', 'x-deleted', 'a']);
  const withNew = [...channels, ch('e')];
  assert.deepEqual(orderedChannels(withNew, 'adults').map((c) => c.id), ['d', 'a', 'b', 'e']);
  saveChannelOrder('kids', ['c', 'a', 'b']); // 'a' is not visible to kids
  assert.deepEqual(orderedChannels(channels, 'kids').map((c) => c.id), ['c', 'b']);
});

test('corrupt stored order falls back to the default', () => {
  store.set('careinn_channel_order', '{not json');
  assert.deepEqual(orderedChannels(channels, 'adults').map((c) => c.id), ['a', 'b', 'd']);
});
