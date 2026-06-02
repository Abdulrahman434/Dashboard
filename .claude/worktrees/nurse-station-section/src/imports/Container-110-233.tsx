import svgPaths from "./svg-acpuuqnwzz";
import { X, Upload } from 'lucide-react';
import { useState } from 'react';
import MultiSelectDropdown from '../components/MultiSelectDropdown';

// Updated: Image preview with thumbnail and X button to remove
interface UpdateWallpaperModalProps {
  onClose?: () => void;
  onSave?: () => void;
}

function Heading({ onClose }: { onClose?: () => void }) {
  return (
    <div className="h-[26.992px] relative shrink-0 w-[167.168px]" data-name="Heading 3">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[26.992px] relative w-[167.168px]">
        <p className="absolute font-['Poppins:SemiBold',sans-serif] leading-[27px] left-0 not-italic text-[#16274d] text-[18px] text-nowrap top-[0.63px] whitespace-pre">Update Wallpaper</p>
      </div>
    </div>
  );
}

function Icon() {
  return (
    <div className="h-[20px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-1/4" data-name="Vector">
        <div className="absolute inset-[-8.33%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
            <path d={svgPaths.p354ab980} id="Vector" stroke="var(--stroke-0, #6A7282)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-1/4" data-name="Vector">
        <div className="absolute inset-[-8.33%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
            <path d={svgPaths.p2a4db200} id="Vector" stroke="var(--stroke-0, #6A7282)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button({ onClick }: { onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="relative rounded-[10px] shrink-0 size-[31.992px] hover:bg-gray-100 transition-colors cursor-pointer" 
      data-name="Button"
    >
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col items-center justify-center pb-0 pt-0 px-0 relative size-[31.992px]">
        <X size={20} className="text-gray-500" strokeWidth={2} />
      </div>
    </button>
  );
}

function Container({ onClose }: { onClose?: () => void }) {
  return (
    <div className="h-[72.617px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0px_0px_0.625px] border-gray-200 border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-stretch flex h-[72.617px] items-center justify-between pb-[0.625px] pt-0 px-[23.994px] relative w-full">
          <Heading onClose={onClose} />
          <Button onClick={onClose} />
        </div>
      </div>
    </div>
  );
}

function Label() {
  return (
    <div className="h-[19.492px] relative shrink-0 w-full" data-name="Label">
      <p className="absolute font-['Poppins',sans-serif] leading-[19.5px] left-0 not-italic text-[#16274d] text-[13px] text-nowrap top-[1.63px] whitespace-pre font-medium">Image Upload</p>
    </div>
  );
}

function Container1() {
  const [wallpaperImage, setWallpaperImage] = useState<File | null>(null);
  const [wallpaperImageUrl, setWallpaperImageUrl] = useState<string>('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setWallpaperImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setWallpaperImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setWallpaperImageUrl('');
    }
  };

  const handleRemoveImage = () => {
    setWallpaperImage(null);
    setWallpaperImageUrl('');
  };

  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      {!wallpaperImageUrl ? (
        <label className="cursor-pointer block">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <div className="border-[1.875px] border-dashed border-[#d1d5dc] rounded-lg p-8 hover:border-[#4ebee3] transition-all duration-200">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center">
                <Upload size={40} className="text-[#99A1AF]" strokeWidth={2.5} />
              </div>
              <p className="text-[14px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                Click to upload wallpaper image
              </p>
              <p className="text-[12px] text-[#6a7282] font-['Poppins',sans-serif]">
                PNG, JPG up to 10MB
              </p>
            </div>
          </div>
        </label>
      ) : (
        <div className="flex items-center gap-3 p-3 border-2 border-[#4EBEE3]/30 rounded-lg bg-[#4EBEE3]/5">
          <img 
            src={wallpaperImageUrl} 
            alt="Wallpaper preview" 
            className="w-16 h-16 object-cover rounded-lg border border-gray-200"
          />
          <div className="flex-1">
            <p className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
              {wallpaperImage?.name}
            </p>
            <p className="text-[11px] text-[#6a7282] font-['Poppins',sans-serif]">
              Wallpaper image uploaded
            </p>
          </div>
          <button
            onClick={handleRemoveImage}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
            title="Remove image"
          >
            <X size={18} className="text-gray-400 group-hover:text-red-500" strokeWidth={2} />
          </button>
        </div>
      )}
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex flex-col gap-[7.998px] h-[190.215px] items-start relative shrink-0 w-full" data-name="Container">
      <Label />
      <Container1 />
    </div>
  );
}

function Label2() {
  return (
    <div className="h-[19.492px] relative shrink-0 w-full" data-name="Label">
      <p className="absolute font-['Poppins',sans-serif] leading-[19.5px] left-0 not-italic text-[#16274d] text-[13px] text-nowrap top-[1.63px] whitespace-pre font-medium">Select Group</p>
    </div>
  );
}

function Dropdown() {
  const [categories, setCategories] = useState<string[]>([]);

  return (
    <div className="relative shrink-0 w-full" data-name="Dropdown">
      <MultiSelectDropdown
        options={['Kids', 'Adults', 'VIP']}
        selectedValues={categories}
        onChange={setCategories}
        placeholder="Select groups"
      />
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex flex-col gap-[7.998px] h-[69.99px] items-start relative shrink-0 w-full" data-name="Container">
      <Label2 />
      <Dropdown />
    </div>
  );
}

function Label3() {
  return (
    <div className="basis-0 grow h-[19.492px] min-h-px min-w-px relative shrink-0" data-name="Label">
      <p className="absolute font-['Poppins:Medium',sans-serif] leading-[19.5px] left-0 not-italic text-[#16274d] text-[13px] text-nowrap top-[1.63px] whitespace-pre">Activate</p>
    </div>
  );
}

function Text2() {
  return (
    <div className="absolute content-stretch flex h-[21.006px] items-start left-[67.99px] top-[5.49px] w-[20.068px]" data-name="Text">
      <p className="font-['Poppins:Medium',sans-serif] leading-[21px] not-italic relative shrink-0 text-[#16274d] text-[14px] text-nowrap whitespace-pre">On</p>
    </div>
  );
}

function Text3() {
  return (
    <div className="bg-white relative rounded-[2.09715e+07px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] shrink-0 size-[23.994px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border size-[23.994px]" />
    </div>
  );
}

function Button1() {
  return (
    <div className="absolute bg-[#4ebee3] box-border content-stretch flex h-[31.992px] items-center left-0 pl-[28px] pr-0 py-0 rounded-[2.09715e+07px] top-0 w-[55.996px]" data-name="Button">
      <Text3 />
    </div>
  );
}

function Container4() {
  return (
    <div className="basis-0 grow h-[31.992px] min-h-px min-w-px relative shrink-0" data-name="Container">
      <Text2 />
      <Button1 />
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex gap-[447px] h-[32px] items-start relative shrink-0 w-full" data-name="Container">
      <Label3 />
      <Container4 />
    </div>
  );
}

function Container6() {
  return (
    <div className="h-[359px] relative shrink-0 w-full" data-name="Container">
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[15.996px] h-[359px] items-start pb-0 pt-[20px] px-[23.994px] relative w-full">
          <Container2 />
          <Container3 />
          <Container5 />
        </div>
      </div>
    </div>
  );
}

function Button2({ onClick }: { onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="h-[42.256px] relative rounded-[10px] shrink-0 w-[91.387px] hover:bg-gray-50 transition-colors cursor-pointer" 
      data-name="Button"
    >
      <div aria-hidden="true" className="absolute border-[#d1d5dc] border-[0.625px] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[42.256px] items-start px-[20.625px] py-[10.625px] relative w-[91.387px]">
        <p className="font-['Poppins:Medium',sans-serif] leading-[21px] not-italic relative shrink-0 text-[#16274d] text-[14px] text-center text-nowrap whitespace-pre">Cancel</p>
      </div>
    </button>
  );
}

function Button3({ onClick }: { onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="px-5 py-2.5 bg-[#4ebee3] text-white rounded-lg hover:bg-[#3da5ca] transition-all text-[14px] font-medium shadow-sm cursor-pointer font-['Poppins',sans-serif]" 
      data-name="Button"
    >
      Save
    </button>
  );
}

function Container7({ onClose, onSave }: { onClose?: () => void; onSave?: () => void }) {
  return (
    <div className="bg-[rgba(249,250,251,0.5)] h-[74.873px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0.625px_0px_0px] border-gray-200 border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center justify-end size-full">
        <div className="box-border content-stretch flex gap-[11.992px] h-[74.873px] items-center justify-end pb-0 pl-0 pr-[23.994px] pt-[0.625px] relative w-full">
          <Button2 onClick={onClose} />
          <Button3 onClick={onSave} />
        </div>
      </div>
    </div>
  );
}

export default function Container8({ onClose, onSave }: UpdateWallpaperModalProps = {}) {
  const handleSave = () => {
    if (onSave) {
      onSave();
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="bg-white box-border content-stretch flex flex-col items-start relative rounded-[14px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] size-full" data-name="Container">
      <Container onClose={onClose} />
      <Container6 />
      <Container7 onClose={onClose} onSave={handleSave} />
    </div>
  );
}