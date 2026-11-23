import { Info } from 'lucide-react';

/** Small "i" that shows its explanation on hover or keyboard focus — keeps forms short. */
export default function InfoTip({ text, align = 'left' }: { text: string; align?: 'left' | 'right' }) {
  return (
    <span className="relative inline-flex align-middle group/tip">
      <button
        type="button"
        aria-label={text}
        className="inline-flex text-[#9099ab] hover:text-[#4EBEE3] focus:text-[#4EBEE3] outline-none cursor-help"
        onClick={(e) => e.preventDefault()}
      >
        <Info size={14} />
      </button>
      <span
        role="tooltip"
        className={`pointer-events-none absolute z-[70] top-full mt-1.5 w-[240px] rounded-lg bg-[#16274D] text-white text-[12px] leading-snug font-normal normal-case tracking-normal px-3 py-2 shadow-lg opacity-0 transition-opacity group-hover/tip:opacity-100 group-focus-within/tip:opacity-100 ${
          align === 'right' ? 'right-0' : 'left-0'
        }`}
      >
        {text}
      </span>
    </span>
  );
}
