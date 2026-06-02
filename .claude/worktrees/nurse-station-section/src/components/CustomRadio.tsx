import svgPaths from "../imports/svg-qtxg3n8523";

interface CustomRadioProps {
  checked: boolean;
  onChange: () => void;
  label: string;
  name: string;
  disabled?: boolean;
}

export default function CustomRadio({ checked, onChange, label, name, disabled = false }: CustomRadioProps) {
  return (
    <label className={`flex items-center gap-3 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer group'}`}>
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only"
      />
      <div className="relative w-[13px] h-[13px] flex-shrink-0">
        {checked ? (
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 13">
            <g>
              <path d={svgPaths.p1a93600} stroke="#4EBEE3" />
              <path d={svgPaths.p3e941000} fill="#4EBEE3" />
            </g>
          </svg>
        ) : (
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 13">
            <path d={svgPaths.p1a93600} stroke="#D1D5DB" />
          </svg>
        )}
      </div>
      <span className={`text-[13px] font-medium font-['Poppins',sans-serif] ${disabled ? 'text-gray-400' : 'text-[#16274D] group-hover:text-[#4EBEE3]'} transition-colors`}>
        {label}
      </span>
    </label>
  );
}