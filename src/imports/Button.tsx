import svgPaths from "./svg-od57rfgpx3";

function Icon() {
  return (
    <div className="absolute left-[8px] size-[17.998px] top-[8px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g clipPath="url(#clip0_52_1692)" id="Icon">
          <path d={svgPaths.p2857ce00} id="Vector" stroke="var(--stroke-0, #4EBEE3)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.34985" />
          <path d={svgPaths.p34145380} id="Vector_2" stroke="var(--stroke-0, #4EBEE3)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.34985" />
          <path d="M7.49935 6.74927H5.99935" id="Vector_3" stroke="var(--stroke-0, #4EBEE3)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.34985" />
          <path d="M11.9993 9.74894H5.99935" id="Vector_4" stroke="var(--stroke-0, #4EBEE3)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.34985" />
          <path d="M11.9993 12.7486H5.99935" id="Vector_5" stroke="var(--stroke-0, #4EBEE3)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.34985" />
        </g>
        <defs>
          <clipPath id="clip0_52_1692">
            <rect fill="white" height="17.998" width="17.998" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container() {
  return (
    <div className="absolute bg-[rgba(78,190,227,0.1)] left-[16px] rounded-[10px] size-[33.994px] top-[16px]" data-name="Container">
      <Icon />
    </div>
  );
}

function Container1() {
  return (
    <div className="h-[17px] relative shrink-0 w-[236px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[17px] overflow-clip relative rounded-[inherit] w-[236px]">
        <p className="absolute font-['Poppins:Medium',sans-serif] leading-[16.25px] left-0 not-italic text-[#16274d] text-[13px] text-nowrap top-[0.75px] whitespace-pre">Welcome Note</p>
      </div>
    </div>
  );
}

function Icon1() {
  return (
    <div className="relative shrink-0 size-[13.994px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g id="Icon">
          <path d="M2.91541 6.99707H11.0787" id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16618" />
          <path d={svgPaths.p360be80} id="Vector_2" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16618" />
        </g>
      </svg>
    </div>
  );
}

function Container2() {
  return (
    <div className="absolute box-border content-stretch flex h-[16.24px] items-center justify-between left-[16px] pl-0 pr-[63.994px] py-0 top-[61.98px] w-[252.617px]" data-name="Container">
      <Container1 />
      <Icon1 />
    </div>
  );
}

function Container3() {
  return (
    <div className="absolute bg-green-50 border-[#b9f8cf] border-[0.625px] border-solid h-[20.234px] left-[198.75px] rounded-[2.09715e+07px] top-[11.99px] w-[73.867px]" data-name="Container">
      <p className="absolute font-['Poppins:Medium',sans-serif] leading-[15px] left-[8px] not-italic text-[#008236] text-[10px] text-nowrap top-[1.99px] whitespace-pre">Configured</p>
    </div>
  );
}

export default function Button() {
  return (
    <div className="bg-white border-[0.625px] border-gray-200 border-solid relative rounded-[10px] size-full" data-name="Button">
      <Container />
      <Container2 />
      <Container3 />
    </div>
  );
}