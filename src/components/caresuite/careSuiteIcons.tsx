/**
 * The icon set admins pick from for categories and icon-style items.
 * Stored as lucide's kebab-case names (https://lucide.dev/icons/) so the
 * patient app can render the same icon with any lucide package. The patient
 * app draws the tinted circle and card shade itself; icons stay plain.
 */
import { useEffect, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  HandHelping, HandHeart, HeartHandshake, Sparkles, Wrench, Hammer, ConciergeBell, Bell, Heart, ShieldPlus,
  Stethoscope, Utensils, Bed, BedDouble, BedSingle, Shirt, Trash2, Droplets, Droplet, SprayCan, ShowerHead, Bath,
  Toilet, AirVent, Fan, Thermometer, Snowflake, Lightbulb, Lamp, Tv, Monitor, Wifi, Plug, PlugZap, Power,
  BatteryCharging, Phone, GlassWater, CupSoda, Coffee, Milk, Sandwich, Soup, Cookie, Apple, Baby, Accessibility,
  Armchair, Footprints, Moon, Ear, BookOpen, Newspaper, Gamepad2, Music, DoorOpen, Key, Lock, Blinds, Sun, VolumeX,
  Wind, Scissors, Package, Gift, Flower2, Pill, Syringe, WashingMachine, Refrigerator, Microwave, CircleHelp,
} from 'lucide-react';

export const CARESUITE_ICONS: Record<string, LucideIcon> = {
  'hand-helping': HandHelping,
  'hand-heart': HandHeart,
  'heart-handshake': HeartHandshake,
  sparkles: Sparkles,
  wrench: Wrench,
  hammer: Hammer,
  'concierge-bell': ConciergeBell,
  bell: Bell,
  heart: Heart,
  'shield-plus': ShieldPlus,
  stethoscope: Stethoscope,
  utensils: Utensils,
  bed: Bed,
  'bed-double': BedDouble,
  'bed-single': BedSingle,
  shirt: Shirt,
  'trash-2': Trash2,
  droplets: Droplets,
  droplet: Droplet,
  'spray-can': SprayCan,
  'shower-head': ShowerHead,
  bath: Bath,
  toilet: Toilet,
  'air-vent': AirVent,
  fan: Fan,
  thermometer: Thermometer,
  snowflake: Snowflake,
  lightbulb: Lightbulb,
  lamp: Lamp,
  tv: Tv,
  monitor: Monitor,
  wifi: Wifi,
  plug: Plug,
  'plug-zap': PlugZap,
  power: Power,
  'battery-charging': BatteryCharging,
  phone: Phone,
  'glass-water': GlassWater,
  'cup-soda': CupSoda,
  coffee: Coffee,
  milk: Milk,
  sandwich: Sandwich,
  soup: Soup,
  cookie: Cookie,
  apple: Apple,
  baby: Baby,
  accessibility: Accessibility,
  armchair: Armchair,
  footprints: Footprints,
  moon: Moon,
  ear: Ear,
  'book-open': BookOpen,
  newspaper: Newspaper,
  'gamepad-2': Gamepad2,
  music: Music,
  'door-open': DoorOpen,
  key: Key,
  lock: Lock,
  blinds: Blinds,
  sun: Sun,
  'volume-x': VolumeX,
  wind: Wind,
  scissors: Scissors,
  package: Package,
  gift: Gift,
  'flower-2': Flower2,
  pill: Pill,
  syringe: Syringe,
  'washing-machine': WashingMachine,
  refrigerator: Refrigerator,
  microwave: Microwave,
  'circle-help': CircleHelp,
};

export const ICON_NAMES = Object.keys(CARESUITE_ICONS);

/** Readable label for the picker ("air-vent" → "Air vent"). */
export const iconLabel = (name: string) => {
  const s = name.replace(/-\d+$/, '').replace(/-/g, ' ');
  return s.charAt(0).toUpperCase() + s.slice(1);
};

// ---- the full lucide library, loaded on demand --------------------------------

let allIcons: Record<string, LucideIcon> | null = null;
let loading: Promise<Record<string, LucideIcon>> | null = null;

/** Load every lucide icon (separate chunk). Resolves immediately once loaded. */
export function loadAllIcons(): Promise<Record<string, LucideIcon>> {
  if (allIcons) return Promise.resolve(allIcons);
  loading ??= import('./lucideAll').then((m) => (allIcons = m.ALL_ICONS));
  return loading;
}

/** The full library, or null until it has loaded (starts loading when `enabled`). */
export function useAllIcons(enabled = true): Record<string, LucideIcon> | null {
  const [icons, setIcons] = useState(allIcons);
  useEffect(() => {
    if (!enabled || allIcons) return;
    let live = true;
    loadAllIcons().then((m) => live && setIcons(m));
    return () => {
      live = false;
    };
  }, [enabled]);
  return icons;
}

export function CareSuiteIcon({ name, size = 20, className, strokeWidth = 2 }: { name?: string; size?: number; className?: string; strokeWidth?: number }) {
  const curated = name ? CARESUITE_ICONS[name] : undefined;
  // names outside the suggested set come from the full library
  const all = useAllIcons(!!name && !curated);
  const Icon = curated || (name && all?.[name]) || CircleHelp;
  return <Icon size={size} className={className} strokeWidth={strokeWidth} />;
}

/**
 * An item or category icon: an uploaded single-colour SVG (drawn as a mask in
 * the current text colour, so it takes the category colour like any icon), or
 * a lucide icon by name. The SVG is never inserted into the page as markup.
 */
export function ItemIcon({ name, svg, size = 20 }: { name?: string; svg?: string; size?: number }) {
  if (svg) {
    const mask = `url("${svg}") center / contain no-repeat`;
    return <span aria-hidden className="inline-block shrink-0" style={{ width: size, height: size, background: 'currentColor', WebkitMask: mask, mask }} />;
  }
  return <CareSuiteIcon name={name} size={size} />;
}

/** Accept an uploaded icon: an SVG file, small, with no scripts or embedded content. Returns a data URL or an error message. */
export async function readIconSvg(file: File): Promise<{ ok: true; dataUrl: string } | { ok: false; error: string }> {
  const isSvg = file.type === 'image/svg+xml' || /\.svg$/i.test(file.name);
  if (!isSvg) return { ok: false, error: 'Upload an SVG file.' };
  if (file.size > 20 * 1024) return { ok: false, error: 'The SVG must be 20 KB or smaller.' };
  const text = await file.text();
  if (!/<svg[\s>]/i.test(text)) return { ok: false, error: 'That file is not a valid SVG.' };
  if (/<script|<foreignObject|\son\w+\s*=|javascript:|<image|<use[^>]+href=["']?(?!#)/i.test(text)) {
    return { ok: false, error: 'The SVG contains scripts or external content. Use a plain single-colour icon.' };
  }
  return { ok: true, dataUrl: `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(text)))}` };
}
