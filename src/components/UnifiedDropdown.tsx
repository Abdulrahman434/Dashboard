import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';

// ============================================
// SINGLE SELECT DROPDOWN (No Checkboxes)
// ============================================

interface SingleSelectDropdownProps {
  options: string[] | { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function SingleSelectDropdown({ 
  options, 
  value, 
  onChange, 
  placeholder = "Select option",
  className = "",
  disabled = false
}: SingleSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  // Menu is portalled to <body> so an ancestor with overflow:hidden/auto — a
  // modal body, a scrolling card — can't clip it. Position is measured from the
  // trigger and the menu flips above when there isn't room below.
  const [menuRect, setMenuRect] = useState<{ top: number; bottom: number; left: number; width: number } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const compact = className.includes('text-[12px]');
  const maxMenuH = compact ? 200 : 280;

  const measure = () => {
    const el = dropdownRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setMenuRect({ top: r.top, bottom: r.bottom, left: r.left, width: r.width });
  };

  const toggleOpen = () => {
    if (disabled) return;
    if (!isOpen) measure();
    setIsOpen(o => !o);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const t = event.target as Node;
      // The menu lives outside dropdownRef now, so it must be checked too —
      // otherwise mousedown closes the menu before the option's click lands.
      if (dropdownRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setIsOpen(false);
    };
    // Any scroll (including the modal body's) would detach the fixed menu from
    // its trigger, so close instead of trying to track it.
    const handleScroll = () => setIsOpen(false);

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isOpen]);

  const normalizedOptions = options.map(opt =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const selectedOption = normalizedOptions.find(opt => opt.value === value);
  const displayText = selectedOption?.label || placeholder;

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  // Flip up when the space below can't hold the menu but the space above can.
  const spaceBelow = menuRect ? window.innerHeight - menuRect.bottom - 8 : 0;
  const spaceAbove = menuRect ? menuRect.top - 8 : 0;
  const openUp = !!menuRect && spaceBelow < Math.min(maxMenuH, 160) && spaceAbove > spaceBelow;
  const availableH = Math.max(120, Math.min(maxMenuH, openUp ? spaceAbove : spaceBelow));

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={toggleOpen}
        disabled={disabled}
        className={`w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/50 focus:border-[#4EBEE3] transition-all bg-white flex items-center justify-between font-['Poppins',sans-serif] ${
          disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'cursor-pointer hover:border-gray-400'
        } ${!value ? 'text-gray-400' : 'text-[#16274D]'} ${className.includes('text-[12px]') ? 'text-[12px]' : 'text-[14px]'}`}
      >
        <span className="truncate">{displayText}</span>
        <ChevronDown 
          size={className.includes('text-[12px]') ? 14 : 16} 
          className={`text-gray-500 transition-transform flex-shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown Menu — portalled so it overlays, never clipped */}
      {isOpen && menuRect && createPortal(
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            left: menuRect.left,
            width: menuRect.width,
            ...(openUp
              ? { bottom: window.innerHeight - menuRect.top + 4 }
              : { top: menuRect.bottom + 4 }),
            maxHeight: availableH,
          }}
          className="z-[60] bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden font-['Poppins',sans-serif]"
        >
          <div className="overflow-y-auto" style={{ maxHeight: availableH }}>
            {normalizedOptions.map((option) => {
              const isSelected = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-gray-50 transition-colors ${
                    isSelected ? 'bg-[#4EBEE3]/5' : ''
                  }`}
                >
                  <span className={`${compact ? 'text-[12px]' : 'text-[14px]'} ${isSelected ? 'text-[#4EBEE3] font-medium' : 'text-[#16274D]'}`}>
                    {option.label}
                  </span>
                  {isSelected && <Check size={compact ? 14 : 16} className="text-[#4EBEE3]" strokeWidth={2.5} />}
                </button>
              );
            })}
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}

// ============================================
// MULTI SELECT DROPDOWN (With Checkboxes)
// ============================================

interface MultiSelectDropdownProps {
  options: string[] | { value: string; label: string }[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  showSelectAll?: boolean;
}

export function MultiSelectDropdown({ 
  options, 
  selectedValues, 
  onChange, 
  placeholder = "Select options",
  className = "",
  disabled = false,
  showSelectAll = true
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const normalizedOptions = options.map(opt => 
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const handleSelectAll = () => {
    if (selectedValues.length === normalizedOptions.length) {
      onChange([]);
    } else {
      onChange(normalizedOptions.map(opt => opt.value));
    }
  };

  const handleToggleOption = (optionValue: string) => {
    if (selectedValues.includes(optionValue)) {
      onChange(selectedValues.filter(v => v !== optionValue));
    } else {
      onChange([...selectedValues, optionValue]);
    }
  };

  // Display selected values comma-separated
  const displayText = selectedValues.length === 0 
    ? placeholder 
    : normalizedOptions
        .filter(opt => selectedValues.includes(opt.value))
        .map(opt => opt.label)
        .join(', ');

  const allSelected = selectedValues.length === normalizedOptions.length && normalizedOptions.length > 0;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3]/50 focus:border-[#4EBEE3] transition-all text-[14px] bg-white flex items-center justify-between font-['Poppins',sans-serif] ${
          disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'cursor-pointer hover:border-gray-400'
        } ${selectedValues.length === 0 ? 'text-gray-400' : 'text-[#16274D]'}`}
      >
        <span className="truncate">{displayText}</span>
        <ChevronDown 
          size={16} 
          className={`text-gray-500 transition-transform flex-shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-[280px] overflow-hidden font-['Poppins',sans-serif]">
          <div className="overflow-y-auto max-h-[280px]">
            {/* Select All Option */}
            {showSelectAll && normalizedOptions.length > 1 && (
              <button
                type="button"
                onClick={handleSelectAll}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100"
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                  allSelected 
                    ? 'bg-[#4EBEE3] border-[#4EBEE3]' 
                    : 'bg-white border-gray-300'
                }`}>
                  {allSelected && <Check size={14} className="text-white" strokeWidth={3} />}
                </div>
                <span className="text-[14px] text-[#16274D] font-medium">
                  Select All
                </span>
              </button>
            )}

            {/* Options */}
            {normalizedOptions.map((option) => {
              const isSelected = selectedValues.includes(option.value);
              
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleToggleOption(option.value)}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    isSelected 
                      ? 'bg-[#4EBEE3] border-[#4EBEE3]' 
                      : 'bg-white border-gray-300'
                  }`}>
                    {isSelected && <Check size={14} className="text-white" strokeWidth={3} />}
                  </div>
                  <span className="text-[14px] text-[#16274D]">
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Legacy export for backward compatibility
export default MultiSelectDropdown;