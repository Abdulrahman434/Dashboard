import svgPaths from "./svg-acmjk7rz42";

function Icon() {
  return (
    <div className="absolute bottom-0 right-[-40px] size-[120px]" data-name="icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 120 120">
        <g id="icon" opacity="0.08"></g>
      </svg>
    </div>
  );
}

function ChartSparkline() {
  return (
    <div className="relative shrink-0 size-[80px]" data-name="Chart/Sparkline">
      <div className="absolute inset-[2.5%]" data-name="bg">
        <div className="absolute inset-[-2.63%]" style={{ "--stroke-0": "rgba(145, 158, 171, 1)" } as React.CSSProperties}>
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 80 80">
            <circle cx="40" cy="40" id="bg" r="38" stroke="var(--stroke-0, #919EAB)" strokeOpacity="0.16" strokeWidth="4" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[2.5%]" data-name="stroke">
        <div className="absolute inset-[-5.26%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 84 84">
            <path d={svgPaths.p27987d80} id="stroke" stroke="var(--stroke-0, #DBF6FF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="8" />
          </svg>
        </div>
      </div>
      <div className="absolute flex flex-col font-['Public_Sans:SemiBold',sans-serif] font-semibold justify-center leading-[0] left-0 right-0 text-[14px] text-center text-white top-1/2 translate-y-[-50%]">
        <p className="leading-[22px]">87.1%</p>
      </div>
    </div>
  );
}

function BackgroundShapeCircle() {
  return (
    <div className="absolute left-1/2 size-[200px] top-1/2 translate-x-[-50%] translate-y-[-50%]" data-name="background/shape-circle">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 200 200">
        <g id="background/shape-circle" opacity="0.08"></g>
      </svg>
    </div>
  );
}

function Stack() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="stack">
      <ChartSparkline />
      <BackgroundShapeCircle />
    </div>
  );
}

function Text() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-center min-h-px min-w-px relative shrink-0 text-nowrap text-white whitespace-pre" data-name="text">
      <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[36px] relative shrink-0 text-[24px]">39</p>
      <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[22px] opacity-[0.64] relative shrink-0 text-[14px]">Total Services</p>
    </div>
  );
}

function AppWidget() {
  return (
    <div className="bg-[#4ebee3] relative rounded-[16px] shrink-0 w-full" data-name="App/Widget">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="box-border content-stretch flex gap-[24px] items-center p-[24px] relative w-full">
          <Icon />
          <Stack />
          <Text />
        </div>
      </div>
    </div>
  );
}

function Icon1() {
  return (
    <div className="absolute bottom-0 right-[-40px] size-[120px]" data-name="icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 120 120">
        <g id="icon" opacity="0.08"></g>
      </svg>
    </div>
  );
}

function ChartSparkline1() {
  return (
    <div className="relative shrink-0 size-[80px]" data-name="Chart/Sparkline">
      <div className="absolute inset-[2.5%]" data-name="bg">
        <div className="absolute inset-[-2.63%]" style={{ "--stroke-0": "rgba(145, 158, 171, 1)" } as React.CSSProperties}>
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 80 80">
            <circle cx="40" cy="40" id="bg" r="38" stroke="var(--stroke-0, #919EAB)" strokeOpacity="0.16" strokeWidth="4" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[2.5%]" data-name="stroke">
        <div className="absolute inset-[-5.26%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 84 84">
            <path d={svgPaths.p27987d80} id="stroke" stroke="url(#paint0_linear_237_264)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="8" />
            <defs>
              <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_237_264" x1="4" x2="80" y1="4" y2="80">
                <stop stopColor="#61F3F3" />
                <stop offset="1" stopColor="#00B8D9" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
      <div className="absolute flex flex-col font-['Public_Sans:SemiBold',sans-serif] font-semibold justify-center leading-[0] left-0 right-0 text-[14px] text-center text-white top-1/2 translate-y-[-50%]">
        <p className="leading-[22px]">78.0%</p>
      </div>
    </div>
  );
}

function BackgroundShapeCircle1() {
  return (
    <div className="absolute left-1/2 size-[200px] top-1/2 translate-x-[-50%] translate-y-[-50%]" data-name="background/shape-circle">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 200 200">
        <g id="background/shape-circle" opacity="0.08"></g>
      </svg>
    </div>
  );
}

function Stack1() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="stack">
      <ChartSparkline1 />
      <BackgroundShapeCircle1 />
    </div>
  );
}

function Text1() {
  return (
    <div className="basis-0 content-stretch flex flex-col grow items-start justify-center min-h-px min-w-px relative shrink-0 text-nowrap text-white whitespace-pre" data-name="text">
      <p className="font-['Public_Sans:Bold',sans-serif] font-bold leading-[36px] relative shrink-0 text-[24px]">37</p>
      <p className="font-['Public_Sans:SemiBold',sans-serif] font-semibold leading-[22px] opacity-[0.64] relative shrink-0 text-[14px]">Total Channels</p>
    </div>
  );
}

function AppWidget1() {
  return (
    <div className="bg-[#16274d] relative rounded-[16px] shrink-0 w-full" data-name="App/Widget">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="box-border content-stretch flex gap-[24px] items-center p-[24px] relative w-full">
          <Icon1 />
          <Stack1 />
          <Text1 />
        </div>
      </div>
    </div>
  );
}

export default function Stack2() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative size-full" data-name="stack">
      <AppWidget />
      <AppWidget1 />
    </div>
  );
}