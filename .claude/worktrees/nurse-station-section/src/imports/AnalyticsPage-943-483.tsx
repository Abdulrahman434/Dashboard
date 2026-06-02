import svgPaths from "./svg-y9f8r3y271";

function Heading() {
  return (
    <div className="h-[19.492px] relative shrink-0 w-[94.785px]" data-name="Heading 4">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid h-[19.492px] relative w-[94.785px]">
        <p className="absolute font-['Poppins:SemiBold',sans-serif] leading-[19.5px] left-0 not-italic text-[#16274d] text-[13px] text-nowrap top-[1.63px] whitespace-pre">Housekeeping</p>
      </div>
    </div>
  );
}

function Icon() {
  return (
    <div className="relative shrink-0 size-[17.998px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g clipPath="url(#clip0_943_487)" id="Icon">
          <path d={svgPaths.p148e9d00} id="Vector" stroke="var(--stroke-0, #4EBEE3)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.49984" />
          <path d="M8.99902 16.499V8.99902" id="Vector_2" stroke="var(--stroke-0, #4EBEE3)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.49984" />
          <path d={svgPaths.p4635c00} id="Vector_3" stroke="var(--stroke-0, #4EBEE3)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.49984" />
          <path d={svgPaths.p8ffe80} id="Vector_4" stroke="var(--stroke-0, #4EBEE3)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.49984" />
        </g>
        <defs>
          <clipPath id="clip0_943_487">
            <rect fill="white" height="17.998" width="17.998" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex h-[19.492px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Heading />
      <Icon />
    </div>
  );
}

function Text() {
  return (
    <div className="h-[19.492px] relative shrink-0 w-[32.08px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid h-[19.492px] relative w-[32.08px]">
        <p className="absolute font-['Poppins:Regular',sans-serif] leading-[19.5px] left-0 not-italic text-[13px] text-gray-500 text-nowrap top-[1.63px] whitespace-pre">Total</p>
      </div>
    </div>
  );
}

function Text1() {
  return (
    <div className="h-[23.994px] relative shrink-0 w-[30.068px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid h-[23.994px] relative w-[30.068px]">
        <p className="absolute font-['Poppins:SemiBold',sans-serif] leading-[24px] left-0 not-italic text-[#16274d] text-[16px] text-nowrap top-[0.63px] whitespace-pre">245</p>
      </div>
    </div>
  );
}

function Icon1() {
  return (
    <div className="absolute left-[28.13px] size-[11.992px] top-[2.25px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g clipPath="url(#clip0_943_493)" id="Icon">
          <path d={svgPaths.pde4a300} id="Vector" stroke="var(--stroke-0, #10B981)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.24919" />
          <path d={svgPaths.p11b2e580} id="Vector_2" stroke="var(--stroke-0, #10B981)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.24919" />
        </g>
        <defs>
          <clipPath id="clip0_943_493">
            <rect fill="white" height="11.9922" width="11.9922" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Text2() {
  return (
    <div className="basis-0 grow h-[16.494px] min-h-px min-w-px relative shrink-0" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid h-[16.494px] relative w-full">
        <p className="absolute font-['Poppins:SemiBold',sans-serif] leading-[16.5px] left-0 not-italic text-[11px] text-emerald-500 top-[0.63px] w-[27px]">8.5%</p>
        <Icon1 />
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="h-[23.994px] relative shrink-0 w-[76.191px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[5.996px] h-[23.994px] items-center relative w-[76.191px]">
        <Text1 />
        <Text2 />
      </div>
    </div>
  );
}

function KpiWithSparkline() {
  return (
    <div className="content-stretch flex h-[23.994px] items-center justify-between relative shrink-0 w-full" data-name="KPIWithSparkline">
      <Text />
      <Container1 />
    </div>
  );
}

function Text3() {
  return (
    <div className="h-[19.492px] relative shrink-0 w-[73.379px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid h-[19.492px] relative w-[73.379px]">
        <p className="absolute font-['Poppins:Regular',sans-serif] leading-[19.5px] left-0 not-italic text-[13px] text-gray-500 text-nowrap top-[1.63px] whitespace-pre">Completed</p>
      </div>
    </div>
  );
}

function Text4() {
  return (
    <div className="h-[21.006px] relative shrink-0 w-[25.43px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex h-[21.006px] items-start relative w-[25.43px]">
        <p className="font-['Poppins:SemiBold',sans-serif] leading-[21px] not-italic relative shrink-0 text-[#16274d] text-[14px] text-nowrap whitespace-pre">238</p>
      </div>
    </div>
  );
}

function Icon2() {
  return (
    <div className="absolute left-[26.32px] size-[11.992px] top-[2.25px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g clipPath="url(#clip0_943_493)" id="Icon">
          <path d={svgPaths.pde4a300} id="Vector" stroke="var(--stroke-0, #10B981)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.24919" />
          <path d={svgPaths.p11b2e580} id="Vector_2" stroke="var(--stroke-0, #10B981)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.24919" />
        </g>
        <defs>
          <clipPath id="clip0_943_493">
            <rect fill="white" height="11.9922" width="11.9922" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Text5() {
  return (
    <div className="basis-0 grow h-[16.494px] min-h-px min-w-px relative shrink-0" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid h-[16.494px] relative w-full">
        <p className="absolute font-['Poppins:SemiBold',sans-serif] leading-[16.5px] left-0 not-italic text-[11px] text-emerald-500 top-[0.63px] w-[25px]">7.2%</p>
        <Icon2 />
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="h-[21.006px] relative shrink-0 w-[69.736px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[5.996px] h-[21.006px] items-center relative w-[69.736px]">
        <Text4 />
        <Text5 />
      </div>
    </div>
  );
}

function KpiWithSparkline1() {
  return (
    <div className="content-stretch flex h-[21.006px] items-center justify-between relative shrink-0 w-full" data-name="KPIWithSparkline">
      <Text3 />
      <Container2 />
    </div>
  );
}

function Text6() {
  return (
    <div className="h-[19.492px] relative shrink-0 w-[60px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid h-[19.492px] relative w-[60px]">
        <p className="absolute font-['Poppins:Regular',sans-serif] leading-[19.5px] left-0 not-italic text-[13px] text-gray-500 text-nowrap top-[1.63px] whitespace-pre">Avg Time</p>
      </div>
    </div>
  );
}

function Text7() {
  return (
    <div className="basis-0 grow h-[21.006px] min-h-px min-w-px relative shrink-0" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex h-[21.006px] items-start relative w-full">
        <p className="font-['Poppins:SemiBold',sans-serif] leading-[21px] not-italic relative shrink-0 text-[#16274d] text-[14px] text-nowrap whitespace-pre">18 min</p>
      </div>
    </div>
  );
}

function Icon3() {
  return (
    <div className="absolute left-[27.65px] size-[11.992px] top-[2.25px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g clipPath="url(#clip0_943_497)" id="Icon">
          <path d={svgPaths.p13686ee0} id="Vector" stroke="var(--stroke-0, #EF4444)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.24919" />
          <path d={svgPaths.p73bb180} id="Vector_2" stroke="var(--stroke-0, #EF4444)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.24919" />
        </g>
        <defs>
          <clipPath id="clip0_943_497">
            <rect fill="white" height="11.9922" width="11.9922" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Text8() {
  return (
    <div className="h-[16.494px] relative shrink-0 w-[39.639px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid h-[16.494px] relative w-[39.639px]">
        <p className="absolute font-['Poppins:SemiBold',sans-serif] leading-[16.5px] left-0 not-italic text-[11px] text-red-500 top-[0.63px] w-[26px]">5.3%</p>
        <Icon3 />
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="h-[21.006px] relative shrink-0 w-[90.859px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[5.996px] h-[21.006px] items-center relative w-[90.859px]">
        <Text7 />
        <Text8 />
      </div>
    </div>
  );
}

function KpiWithSparkline2() {
  return (
    <div className="content-stretch flex h-[21.006px] items-center justify-between relative shrink-0 w-full" data-name="KPIWithSparkline">
      <Text6 />
      <Container3 />
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex flex-col gap-[7.998px] h-[82.002px] items-start relative shrink-0 w-full" data-name="Container">
      <KpiWithSparkline />
      <KpiWithSparkline1 />
      <KpiWithSparkline2 />
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <div className="bg-white relative rounded-[14px] size-full" data-name="AnalyticsPage">
      <div aria-hidden="true" className="absolute border-[0.625px] border-[rgba(78,190,227,0.3)] border-solid inset-0 pointer-events-none rounded-[14px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]" />
      <div className="size-full">
        <div className="content-stretch flex flex-col gap-[11.992px] items-start pb-[0.625px] pt-[20.625px] px-[20.625px] relative size-full">
          <Container />
          <Container4 />
        </div>
      </div>
    </div>
  );
}