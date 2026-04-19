import { useState, useEffect, useRef } from 'react';

interface InlineSelectProps {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  className?: string;
  width?: string;
  colorize?: boolean; // New prop to enable color-coded badges
}

export default function InlineSelect({
  value,
  options,
  onChange,
  className = '',
  width = 'w-full',
  colorize = false
}: InlineSelectProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const selectRef = useRef<HTMLSelectElement>(null);

  // Get color for channel type
  const getTypeColor = (type: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      'Entertainment': { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
      'Kids': { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-200' },
      'Religious': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
      'Music': { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
      'News': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
      'Sports': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
      'Documentary': { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-200' },
      'Movies': { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' },
      'Series': { bg: 'bg-violet-100', text: 'text-violet-700', border: 'border-violet-200' },
      'Educational': { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-200' },
    };
    
    // Return color or default brand color for unknown types
    return colors[type] || { bg: 'bg-[#4EBEE3]/10', text: 'text-[#4EBEE3]', border: 'border-[#4EBEE3]/20' };
  };

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && selectRef.current) {
      selectRef.current.focus();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    if (editValue !== value) {
      onChange(editValue);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    setEditValue(newValue);
    onChange(newValue);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setEditValue(value);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <select
        ref={selectRef}
        value={editValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`${width} px-3 py-2 pr-8 border-2 border-[#4EBEE3] rounded-lg focus:outline-none text-[14px] text-[#16274D] font-['Poppins',sans-serif] bg-white appearance-none cursor-pointer ${className}`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23666' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 8px center',
          backgroundSize: '10px'
        }}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={`${width} px-3 py-2 border-2 border-transparent rounded-lg hover:border-[#4EBEE3]/30 cursor-pointer transition-all text-center ${className}`}
    >
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[13px] font-medium font-['Poppins',sans-serif] ${colorize ? getTypeColor(value).bg : 'bg-[#4EBEE3]/10'} ${colorize ? getTypeColor(value).text : 'text-[#4EBEE3]'} ${colorize ? getTypeColor(value).border : 'border-[#4EBEE3]/20'}`}>
        {value}
      </span>
    </div>
  );
}