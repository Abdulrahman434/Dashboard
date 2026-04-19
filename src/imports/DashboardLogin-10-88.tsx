import svgPaths from "./svg-c7usyrwz2w";
import imgArtboard12 from "figma:asset/263c78397adc34b66bfa165f658db4cf1b5f3bd3.png";
import imgCareInnLogo1 from "figma:asset/1497971121f9fe3238b7a912b02a205098173242.png";

function Frame2() {
  return (
    <div className="absolute h-[1080px] left-0 top-0 w-[726px]">
      <div className="absolute h-[1080px] left-0 top-0 w-[726px]" data-name="Artboard 1 2">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgArtboard12} />
      </div>
      <div className="absolute bg-white h-[149px] left-[242px] top-[844px] w-[242px]" />
      <p className="absolute font-['Inter:Bold',sans-serif] font-bold h-[99px] leading-[1.1] left-[363px] not-italic text-[#16274d] text-[40px] text-center top-[871px] tracking-[-1.6px] translate-x-[-50%] w-[226px]">
        <span>{`Healthcare `}</span>
        <span className="text-[#4ebee3]">Redefined</span>
      </p>
    </div>
  );
}

function Text() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start justify-center not-italic relative shrink-0 w-full" data-name="text">
      <p className="font-['Inter:Bold',sans-serif] font-bold leading-[1.1] relative shrink-0 text-[#232323] text-[40px] tracking-[-1.6px] w-full">Welcome!</p>
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.5] relative shrink-0 text-[#969696] text-[18px] w-full">Please login to continue to your account.</p>
    </div>
  );
}

function Label() {
  return (
    <div className="absolute bg-white box-border content-stretch flex gap-[10px] items-center left-[12px] px-[4px] py-0 top-[-10.5px]" data-name="label">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[1.5] not-italic relative shrink-0 text-[#9a9a9a] text-[14px] text-nowrap whitespace-pre">Email</p>
    </div>
  );
}

function Input() {
  return (
    <div className="relative rounded-[10px] shrink-0 w-full" data-name="input">
      <div aria-hidden="true" className="absolute border-[#d9d9d9] border-[1.5px] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-stretch flex gap-[2px] items-center p-[16px] relative w-full">
          <Label />
        </div>
      </div>
    </div>
  );
}

function Label1() {
  return (
    <div className="absolute bg-white box-border content-stretch flex gap-[10px] items-center left-[12px] px-[4px] py-0 top-[-10.5px]" data-name="label">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[1.5] not-italic relative shrink-0 text-[#9a9a9a] text-[14px] text-nowrap whitespace-pre">Password</p>
    </div>
  );
}

function EyeOff() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="eye-off">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="eye-off">
          <path d={svgPaths.pef77800} id="Icon" stroke="var(--stroke-0, #9A9A9A)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Input1() {
  return (
    <div className="relative rounded-[10px] shrink-0 w-full" data-name="input">
      <div aria-hidden="true" className="absolute border-[#d9d9d9] border-[1.5px] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="flex flex-row items-center justify-end size-full">
        <div className="box-border content-stretch flex gap-[10px] items-center justify-end p-[16px] relative w-full">
          <Label1 />
          <EyeOff />
        </div>
      </div>
    </div>
  );
}

function CheckboxMaterialDesign() {
  return (
    <div className="relative shrink-0 size-[18.406px]" data-name="& Checkbox / Material Design">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19 19">
        <g id="& Checkbox / Material Design">
          <path clipRule="evenodd" d={svgPaths.p6e98580} fill="var(--fill-0, #636366)" fillRule="evenodd" id="Shape" />
        </g>
      </svg>
    </div>
  );
}

function Keep() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0" data-name="keep">
      <CheckboxMaterialDesign />
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[1.5] not-italic relative shrink-0 text-[#232323] text-[15px] text-nowrap whitespace-pre">Keep me logged in</p>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-[#4ebee3] relative rounded-[10px] shrink-0 w-full" data-name="button">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="box-border content-stretch flex gap-[8px] items-center justify-center px-[8px] py-[16px] relative w-full">
          <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[1.2] not-italic relative shrink-0 text-[18px] text-nowrap text-white tracking-[-0.18px] whitespace-pre">Sign in</p>
        </div>
      </div>
    </div>
  );
}

function Frame() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[30px] items-end left-[1197px] top-[356px] w-[446px]">
      <Text />
      <Input />
      <Input1 />
      <Keep />
      <Button />
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] min-w-full not-italic relative shrink-0 text-[#4ebee3] text-[15px] w-[min-content]">
        <p className="[text-decoration-skip-ink:none] [text-underline-position:from-font] decoration-solid leading-[normal] underline">{`Need Help? `}</p>
      </div>
    </div>
  );
}

function Frame1() {
  return (
    <div className="absolute content-stretch flex gap-[754px] h-[1080px] items-center justify-center left-0 top-0 w-[1920px]">
      <Frame2 />
      <Frame />
    </div>
  );
}

function Default() {
  return (
    <div className="absolute bg-white h-[1080px] left-0 overflow-clip top-0 w-[1920px]" data-name="Default">
      <Frame1 />
      <div className="absolute h-[61.037px] left-[1663px] top-[36px] w-[100px]" data-name="CareInn logo 1">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgCareInnLogo1} />
      </div>
      <div className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[1.1] left-[1188px] not-italic text-[#232323] text-[40px] top-[165px] tracking-[-1.6px] w-[689px]">
        <p className="mb-0">CareInn</p>
        <p>System Management Portal</p>
      </div>
    </div>
  );
}

export default function DashboardLogin() {
  return (
    <div className="relative size-full" data-name="Dashboard - Login">
      <Default />
    </div>
  );
}