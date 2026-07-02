import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Star } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { SingleSelectDropdown } from './UnifiedDropdown';

/**
 * DiningMenuPage — "Items and defaults" (step 4 of 7 of the menu builder).
 *
 * A faithful re-skin of the original mockup into the CareInn design language:
 * Poppins type, single brand colour (#4EBEE3), lucide icons, dashboard card
 * conventions. Everything is interactive — menu type, meal, day and course
 * selectors all drive the item list, include toggles, per-day availability
 * and the single default-per-day.
 */

// ---- Static menu model -----------------------------------------------------

type DayId = 'sat' | 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri';

const DAYS: { id: DayId; label: string }[] = [
  { id: 'sat', label: 'Sat' },
  { id: 'sun', label: 'Sun' },
  { id: 'mon', label: 'Mon' },
  { id: 'tue', label: 'Tue' },
  { id: 'wed', label: 'Wed' },
  { id: 'thu', label: 'Thu' },
  { id: 'fri', label: 'Fri' },
];

const MEALS = [
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
];

const MENU_TYPES = ['Regular', 'Diabetic', 'Soft diet', 'Renal', 'VIP'];

const ALL_DAYS: DayId[] = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'];
const NOT_WED: DayId[] = ['sat', 'sun', 'mon', 'tue', 'thu', 'fri'];

interface Dish {
  id: string;
  en: string;
  ar: string;
  available: DayId[]; // days this dish can appear on
}

interface Course {
  id: string;
  label: string;
  rule: string;
  dishes: Dish[];
}

const COURSES: Course[] = [
  {
    id: 'starters',
    label: 'Starters',
    rule: 'choose one, optional',
    dishes: [
      { id: 'lentil-soup', en: 'Lentil soup', ar: 'شوربة عدس', available: ALL_DAYS },
      { id: 'garden-salad', en: 'Garden salad', ar: 'سلطة خضراء', available: ALL_DAYS },
      { id: 'hummus', en: 'Hummus', ar: 'حمص', available: ALL_DAYS },
    ],
  },
  {
    id: 'mains',
    label: 'Mains',
    rule: 'choose two, required',
    dishes: [
      { id: 'grilled-chicken', en: 'Grilled chicken', ar: 'دجاج مشوي', available: ALL_DAYS },
      { id: 'baked-fish', en: 'Baked fish', ar: 'سمك بالفرن', available: ALL_DAYS },
      { id: 'beef-stew', en: 'Beef stew', ar: 'يخنة لحم', available: ALL_DAYS },
      { id: 'veg-biryani', en: 'Vegetable biryani', ar: 'برياني خضار', available: ALL_DAYS },
      { id: 'grilled-salmon', en: 'Grilled salmon', ar: 'سلمون مشوي', available: NOT_WED },
      { id: 'steamed-rice', en: 'Steamed rice', ar: 'أرز مطهو', available: NOT_WED },
    ],
  },
  {
    id: 'desserts',
    label: 'Desserts',
    rule: 'choose one, optional',
    dishes: [
      { id: 'fruit-salad', en: 'Fruit salad', ar: 'سلطة فواكه', available: ALL_DAYS },
      { id: 'rice-pudding', en: 'Rice pudding', ar: 'أرز بالحليب', available: ALL_DAYS },
      { id: 'jelly', en: 'Jelly', ar: 'جيلي', available: ALL_DAYS },
    ],
  },
];

// ---- Component -------------------------------------------------------------

export default function DiningMenuPage() {
  const [menuType, setMenuType] = useState('Regular');
  const [meal, setMeal] = useState('lunch');
  const [day, setDay] = useState<DayId>('wed');
  const [courseIdx, setCourseIdx] = useState(1); // Mains

  // Per-selection edit state. Keys scope include/default to meal+day+course so
  // each day genuinely holds its own dishes, as the mockup describes.
  const [includes, setIncludes] = useState<Record<string, boolean>>({});
  const [defaults, setDefaults] = useState<Record<string, string>>({
    'lunch:wed:mains': 'grilled-chicken',
  });

  const course = COURSES[courseIdx];
  const dayLabel = DAYS.find((d) => d.id === day)!.label;
  const scope = `${meal}:${day}:${course.id}`;

  const isAvailable = (dish: Dish) => dish.available.includes(day);
  const isIncluded = (dish: Dish) => {
    const key = `${scope}:${dish.id}`;
    return includes[key] ?? isAvailable(dish); // default: included when available
  };
  const includedCount = course.dishes.filter((d) => isAvailable(d) && isIncluded(d)).length;
  const defaultId = defaults[scope];

  const toggleInclude = (dish: Dish) => {
    if (!isAvailable(dish)) return;
    const key = `${scope}:${dish.id}`;
    const next = !isIncluded(dish);
    setIncludes((prev) => ({ ...prev, [key]: next }));
    // Turning off the current default clears it.
    if (!next && defaultId === dish.id) {
      setDefaults((prev) => {
        const copy = { ...prev };
        delete copy[scope];
        return copy;
      });
    }
  };

  const setDefault = (dish: Dish) => {
    setDefaults((prev) => ({ ...prev, [scope]: dish.id }));
  };

  const prevCourse = () => setCourseIdx((i) => (i - 1 + COURSES.length) % COURSES.length);
  const nextCourse = () => setCourseIdx((i) => (i + 1) % COURSES.length);

  return (
    <div className="p-8">
      <div className="max-w-[640px] mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden font-['Poppins',sans-serif]">
          {/* Wizard header */}
          <div className="px-5 py-4 border-b border-gray-200">
            <div className="text-[12px] text-gray-400">Step 4 of 7</div>
            <div className="text-[17px] font-medium text-[#16274D] mt-0.5">Items and defaults</div>
          </div>

          {/* Context bar: menu type + meal + day */}
          <div className="flex flex-wrap items-center gap-2.5 px-5 py-3 bg-[#F7F8FB] border-b border-gray-200">
            <span className="text-[13px] text-[#64748B]">Editing menu for</span>

            <div className="w-[130px]">
              <SingleSelectDropdown
                options={MENU_TYPES}
                value={menuType}
                onChange={setMenuType}
                className="text-[12px]"
              />
            </div>

            {/* Meal — segmented control */}
            <div className="inline-flex rounded-lg border border-gray-300 overflow-hidden">
              {MEALS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMeal(m.id)}
                  className={`px-3 py-1.5 text-[13px] transition-colors ${
                    meal === m.id
                      ? 'bg-[#4EBEE3] text-white font-medium'
                      : 'bg-white text-[#64748B] hover:bg-gray-50'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Day selector */}
            <div className="inline-flex flex-wrap rounded-lg border border-gray-300 overflow-hidden">
              {DAYS.map((d, i) => (
                <button
                  key={d.id}
                  onClick={() => setDay(d.id)}
                  className={`px-2.5 py-1.5 text-[13px] transition-colors ${i > 0 ? 'border-l border-gray-200' : ''} ${
                    day === d.id
                      ? 'bg-[#4EBEE3] text-white font-semibold'
                      : 'bg-white text-[#64748B] hover:bg-gray-50'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Course sub-nav */}
          <div className="flex items-center justify-between px-5 py-3 bg-[#F7F8FB] border-b border-gray-200">
            <button
              onClick={prevCourse}
              aria-label="Previous course"
              className="w-[30px] h-[30px] rounded-lg border border-gray-300 bg-white text-[#64748B] flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="text-[14px] font-semibold text-[#16274D]">
              {course.label}{' '}
              <span className="font-normal text-gray-400">
                · {course.rule} · {includedCount} on {dayLabel}
              </span>
            </div>
            <button
              onClick={nextCourse}
              aria-label="Next course"
              className="w-[30px] h-[30px] rounded-lg border border-gray-300 bg-white text-[#64748B] flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Item rows */}
          {course.dishes.map((dish) => {
            const available = isAvailable(dish);
            const included = available && isIncluded(dish);
            const isDefault = defaultId === dish.id;

            return (
              <div
                key={dish.id}
                className={`flex items-center gap-3 px-5 py-3 border-b border-gray-200 ${
                  available ? '' : 'opacity-60'
                }`}
              >
                {/* Include toggle */}
                <button
                  onClick={() => toggleInclude(dish)}
                  disabled={!available}
                  role="switch"
                  aria-checked={included}
                  aria-label={`Include ${dish.en}`}
                  className={`relative w-[34px] h-5 rounded-full flex-shrink-0 transition-colors ${
                    included ? 'bg-[#4EBEE3]' : 'bg-[#CBCED4]'
                  } ${available ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                      included ? 'left-4' : 'left-0.5'
                    }`}
                  />
                </button>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-medium text-[#16274D]">{dish.en}</div>
                  <div className="text-[13px] text-gray-400" dir="rtl" lang="ar">
                    {dish.ar}
                  </div>
                </div>

                {/* Default control / availability note */}
                {available ? (
                  <button
                    onClick={() => setDefault(dish)}
                    disabled={!included}
                    className={`flex items-center gap-1 text-[12.5px] transition-colors ${
                      isDefault
                        ? 'text-[#4EBEE3] font-semibold'
                        : included
                          ? 'text-gray-400 hover:text-[#4EBEE3]'
                          : 'text-gray-300 cursor-not-allowed'
                    }`}
                  >
                    <Star size={14} fill={isDefault ? 'currentColor' : 'none'} />
                    {isDefault ? 'default' : 'set default'}
                  </button>
                ) : (
                  <span className="text-[12px] text-gray-400">not on {dayLabel}</span>
                )}
              </div>
            );
          })}

          {/* Info banner */}
          <div className="flex items-start gap-2.5 px-5 py-3 border-b border-gray-200 bg-[#4EBEE3]/10 text-[#16274D] text-[13px]">
            <Calendar size={17} className="flex-shrink-0 mt-0.5 text-[#4EBEE3]" />
            <div>
              You're editing <b>{dayLabel === 'Wed' ? 'Wednesday' : dayLabel}</b>. Each day holds its own
              dishes; the rule ({course.rule}) is shared across the whole week. Copy a day onto others in the
              next step.
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-2 px-5 py-3.5 bg-[#F7F8FB]">
            <button
              onClick={() => toast('Back to step 3')}
              className="h-9 px-4 rounded-lg border border-gray-300 bg-white text-[14px] text-[#16274D] hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => toast.success('Menu saved', { description: 'Next: apply across the week' })}
              className="h-9 px-4 rounded-lg bg-[#4EBEE3] text-white text-[14px] font-medium hover:bg-[#3DA5CA] transition-colors"
            >
              Next: apply across
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
