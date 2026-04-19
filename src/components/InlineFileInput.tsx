import { useState, useEffect, useRef } from 'react';
import { Upload } from 'lucide-react';

interface InlineFileInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export default function InlineFileInput({
  value,
  onChange,
  className = '',
  placeholder = 'Upload PDF'
}: InlineFileInputProps) {
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(file.name);
      setIsEditing(false);
    }
  };

  const handleClick = () => {
    setIsEditing(true);
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 0);
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        className="hidden"
      />
      <div
        onClick={handleClick}
        className={`w-full px-3 py-2 border-2 border-transparent rounded-lg hover:border-[#4EBEE3]/30 cursor-pointer transition-all text-[14px] font-['Poppins',sans-serif] flex items-center gap-2 ${className}`}
      >
        {value ? (
          <span className="text-[#16274D] flex items-center gap-2">
            <Upload size={14} className="text-[#4EBEE3]" />
            {value}
          </span>
        ) : (
          <span className="text-gray-400 flex items-center gap-2">
            <Upload size={14} />
            {placeholder}
          </span>
        )}
      </div>
    </>
  );
}
