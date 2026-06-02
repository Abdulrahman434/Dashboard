import { useState, useRef } from 'react';
import { Upload, Tv } from 'lucide-react';

interface InlineImageUploadProps {
  imageUrl: string;
  onImageChange: (imageUrl: string) => void;
  altText?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function InlineImageUpload({
  imageUrl,
  onImageChange,
  altText = 'Image',
  size = 'md'
}: InlineImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        onImageChange(result);
        setIsUploading(false);
      };
      reader.onerror = () => {
        setImageError(true);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="relative group">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      
      <div
        onClick={handleClick}
        className={`${sizeClasses[size]} rounded-lg border-2 border-transparent hover:border-[#4EBEE3] transition-all cursor-pointer relative overflow-hidden`}
      >
        {imageUrl && !imageError ? (
          <img 
            src={imageUrl} 
            alt={altText}
            className="w-full h-full object-contain rounded-lg"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
            <Tv size={20} className="text-gray-400" strokeWidth={1.5} />
          </div>
        )}
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
          <Upload size={16} className="text-white" strokeWidth={2} />
        </div>
        
        {/* Loading overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
            <div className="w-4 h-4 border-2 border-[#4EBEE3] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}