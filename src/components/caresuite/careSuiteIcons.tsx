/**
 * The icon set admins pick from for categories and icon-style items.
 * Stored as lucide's kebab-case names (https://lucide.dev/icons/) so the
 * patient app can render the same icon with any lucide package. The patient
 * app draws the tinted circle and card shade itself; icons stay plain.
 */
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

export function CareSuiteIcon({ name, size = 20, className, strokeWidth = 2 }: { name?: string; size?: number; className?: string; strokeWidth?: number }) {
  const Icon = (name && CARESUITE_ICONS[name]) || CircleHelp;
  return <Icon size={size} className={className} strokeWidth={strokeWidth} />;
}
