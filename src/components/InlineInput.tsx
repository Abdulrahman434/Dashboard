import { useState, useEffect, useRef } from 'react';

interface InlineInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  textAlign?: 'left' | 'center' | 'right';
  dir?: 'ltr' | 'rtl';
  type?: 'text' | 'number';
  placeholder?: string;
  disabled?: boolean;
  truncate?: boolean; // Add truncate option
}

export default function InlineInput({
  value,
  onChange,
  className = '',
  textAlign = 'left',
  dir = 'ltr',
  type = 'text',
  placeholder = '',
  disabled = false,
  truncate = false
}: InlineInputProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    if (editValue !== value) {
      onChange(editValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setEditValue(value);
      setIsEditing(false);
    }
  };

  const textAlignClass = textAlign === 'center' ? 'text-center' : textAlign === 'right' ? 'text-right' : 'text-left';

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type={type}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`w-full px-3 py-2 border-2 border-[#4EBEE3] rounded-lg focus:outline-none text-[14px] text-[#16274D] font-['Poppins',sans-serif] ${textAlignClass} ${className}`}
        dir={dir}
        placeholder={placeholder}
      />
    );
  }

  return (
    <div
      onClick={() => !disabled && setIsEditing(true)}
      className={`w-full px-3 py-2 border-2 border-transparent rounded-lg ${
        disabled 
          ? 'cursor-not-allowed opacity-60' 
          : 'hover:border-[#4EBEE3]/30 cursor-text'
      } transition-all text-[14px] font-['Poppins',sans-serif] ${textAlignClass} ${className}`}
      dir={dir}
      title={truncate ? value : undefined}
    >
      {value ? (
        <span className={`text-[#16274D] ${truncate ? 'block truncate' : ''}`}>{value}</span>
      ) : (
        <span className="text-gray-400">{placeholder || 'Click to edit'}</span>
      )}
    </div>
  );
}