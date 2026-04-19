import { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown } from 'lucide-react';

interface MultiSelectDropdownProps {
  options: string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

export default function MultiSelectDropdown({ 
  options, 
  selectedValues, 
  onChange, 
  placeholder = "Select options" 
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

  const handleSelectAll = () => {
    if (selectedValues.length === options.length) {
      onChange([]);
    } else {
      onChange([...options]);
    }
  };

  const handleToggleOption = (option: string) => {
    if (selectedValues.includes(option)) {
      onChange(selectedValues.filter(v => v !== option));
    } else {
      onChange([...selectedValues, option]);
    }
  };

  // Display selected values comma-separated
  const displayText = selectedValues.length === 0 
    ? placeholder 
    : selectedValues.join(', ');

  const allSelected = selectedValues.length === options.length && options.length > 0;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ebee3]/50 focus:border-[#4ebee3] transition-all text-[14px] text-[#16274D] bg-white flex items-center justify-between font-['Poppins',sans-serif]"
      >
        <span className={selectedValues.length === 0 ? 'text-gray-400' : ''}>
          {displayText}
        </span>
        <ChevronDown 
          size={16} 
          className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-[280px] overflow-hidden font-['Poppins',sans-serif]">
          <div className="overflow-y-auto max-h-[280px]">
            {/* Select All Option */}
            <button
              type="button"
              onClick={handleSelectAll}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                allSelected 
                  ? 'bg-[#4ebee3] border-[#4ebee3]' 
                  : 'bg-white border-gray-300'
              }`}>
                {allSelected && <Check size={14} className="text-white" strokeWidth={3} />}
              </div>
              <span className="text-[14px] text-[#16274D] font-medium">
                Select All
              </span>
            </button>

            {/* Options */}
            {options.map((option) => {
              const isSelected = selectedValues.includes(option);
              
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleToggleOption(option)}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    isSelected 
                      ? 'bg-[#4ebee3] border-[#4ebee3]' 
                      : 'bg-white border-gray-300'
                  }`}>
                    {isSelected && <Check size={14} className="text-white" strokeWidth={3} />}
                  </div>
                  <span className="text-[14px] text-[#16274D]">
                    {option}
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