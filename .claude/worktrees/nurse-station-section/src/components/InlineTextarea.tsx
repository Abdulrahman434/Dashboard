import { useState, useEffect, useRef } from 'react';

interface InlineTextareaProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  dir?: 'ltr' | 'rtl';
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
}

export default function InlineTextarea({
  value,
  onChange,
  className = '',
  dir = 'ltr',
  placeholder = '',
  rows = 3,
  disabled = false
}: InlineTextareaProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    if (editValue !== value) {
      onChange(editValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setEditValue(value);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <textarea
        ref={textareaRef}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        rows={rows}
        className={`w-full px-3 py-2 border-2 border-[#4EBEE3] rounded-lg focus:outline-none text-[14px] text-[#16274D] font-['Poppins',sans-serif] resize-none ${className}`}
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
      } transition-all text-[14px] font-['Poppins',sans-serif] ${className}`}
      style={{ 
        whiteSpace: 'pre-wrap', 
        wordWrap: 'break-word',
        minHeight: `${rows * 1.5 + 1}rem`,
        lineHeight: '1.5',
        display: 'flex',
        alignItems: 'center'
      }}
      dir={dir}
    >
      {value ? (
        <span className="text-[#16274D]">{value}</span>
      ) : (
        <span className="text-gray-400">{placeholder || 'Click to edit'}</span>
      )}
    </div>
  );
}
