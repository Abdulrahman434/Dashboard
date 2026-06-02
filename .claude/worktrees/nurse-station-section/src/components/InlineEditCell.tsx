import { useState, useEffect, useRef } from 'react';

interface InlineEditCellProps {
  value: string;
  onSave: (newValue: string) => void;
  className?: string;
  dir?: 'ltr' | 'rtl';
  placeholder?: string;
  multiline?: boolean;
}

export default function InlineEditCell({
  value,
  onSave,
  className = '',
  dir = 'ltr',
  placeholder = '',
  multiline = false
}: InlineEditCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
    setEditValue(value);
  };

  const handleClick = () => {
    setIsEditing(true);
    setEditValue(value);
  };

  const handleSave = () => {
    if (editValue.trim() !== value) {
      onSave(editValue.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  if (isEditing) {
    const sharedProps = {
      ref: inputRef as any,
      value: editValue,
      onChange: (e: any) => setEditValue(e.target.value),
      onKeyDown: handleKeyDown,
      onBlur: handleBlur,
      dir,
      placeholder,
      className: `w-full px-2 py-1 border-2 border-[#4EBEE3] rounded bg-[#4EBEE3]/5 text-[14px] text-[#0f1729] font-['Poppins',sans-serif] focus:outline-none ${className}`
    };

    if (multiline) {
      return (
        <textarea
          {...sharedProps}
          rows={2}
        />
      );
    }

    return <input type="text" {...sharedProps} />;
  }

  return (
    <div
      onDoubleClick={handleDoubleClick}
      onClick={handleClick}
      className={`cursor-pointer hover:bg-[#4EBEE3]/5 px-2 py-1 rounded transition-colors ${className}`}
      dir={dir}
      title="Click to edit"
    >
      {value || <span className="text-gray-400 italic">{placeholder || 'Click to edit'}</span>}
    </div>
  );
}