import svgPaths from "./svg-prv2asts9t";

function Heading() {
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

function Button() {
  return (
    <div className="relative rounded-[10px] shrink-0 size-[31.992px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col items-start pb-0 pt-[5.996px] px-[5.996px] relative size-[31.992px]">
        <Icon />
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="h-[72.617px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0px_0px_0.625px] border-gray-200 border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-stretch flex h-[72.617px] items-center justify-between pb-[0.625px] pt-0 px-[23.994px] relative w-full">
          <Heading />
          <Button />
        </div>
      </div>
    </div>
  );
}

function Label() {
  return (
    <div className="h-[19.492px] relative shrink-0 w-full" data-name="Label">
      <p className="absolute font-['Poppins:Medium',sans-serif] leading-[19.5px] left-0 not-italic text-[#16274d] text-[13px] text-nowrap top-[1.63px] whitespace-pre">Image Upload</p>
    </div>
  );
}

function Icon1() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[40px]" data-name="Icon">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-full overflow-clip relative rounded-[inherit] w-[40px]">
        <div className="absolute bottom-[37.5%] left-1/2 right-1/2 top-[12.5%]" data-name="Vector">
          <div className="absolute inset-[-7.81%_-1.25px]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 3 19">
              <path d="M1.25 1.25V17.251" id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
            </svg>
          </div>
        </div>
        <div className="absolute inset-[12.5%_29.17%_66.67%_29.17%]" data-name="Vector">
          <div className="absolute inset-[-18.75%_-7.5%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 10">
              <path d={svgPaths.p16cffbc0} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
            </svg>
          </div>
        </div>
        <div className="absolute inset-[62.5%_12.5%_12.5%_12.5%]" data-name="Vector">
          <div className="absolute inset-[-15.62%_-4.17%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 33 11">
              <path d={svgPaths.p185d300} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Text() {
  return (
    <div className="h-[21.006px] relative shrink-0 w-[230.049px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[21.006px] items-start relative w-[230.049px]">
        <p className="font-['Poppins:Medium',sans-serif] leading-[21px] not-italic relative shrink-0 text-[#16274d] text-[14px] text-nowrap whitespace-pre">Click to upload wallpaper image</p>
      </div>
    </div>
  );
}

function Text1() {
  return (
    <div className="h-[17.998px] relative shrink-0 w-[121.514px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[17.998px] items-start relative w-[121.514px]">
        <p className="font-['Poppins:Regular',sans-serif] leading-[18px] not-italic relative shrink-0 text-[#6a7282] text-[12px] text-nowrap whitespace-pre">PNG, JPG up to 10MB</p>
      </div>
    </div>
  );
}

function Label1() {
  return (
    <div className="content-stretch flex flex-col gap-[11.992px] h-[94.99px] items-center relative shrink-0 w-full" data-name="Label">
      <Icon1 />
      <Text />
      <Text1 />
    </div>
  );
}

function Container1() {
  return (
    <div className="h-[162.725px] relative rounded-[10px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#d1d5dc] border-[1.875px] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col h-[162.725px] items-start pb-[1.875px] pt-[33.867px] px-[33.867px] relative w-full">
          <Label1 />
        </div>
      </div>
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
      <p className="absolute font-['Poppins:Medium',sans-serif] leading-[19.5px] left-0 not-italic text-[#16274d] text-[13px] text-nowrap top-[1.63px] whitespace-pre">Category</p>
    </div>
  );
}

function Option() {
  return (
    <div className="absolute left-[-586.12px] size-0 top-[-562.83px]" data-name="Option">
      <p className="absolute font-['Poppins:Regular',sans-serif] leading-[normal] left-0 not-italic text-[#16274d] text-[14px] top-0 w-0">Select category</p>
    </div>
  );
}

function Option1() {
  return (
    <div className="absolute left-[-586.12px] size-0 top-[-562.83px]" data-name="Option">
      <p className="absolute font-['Poppins:Regular',sans-serif] leading-[normal] left-0 not-italic text-[#16274d] text-[14px] top-0 w-0">Children</p>
    </div>
  );
}

function Option2() {
  return (
    <div className="absolute left-[-586.12px] size-0 top-[-562.83px]" data-name="Option">
      <p className="absolute font-['Poppins:Regular',sans-serif] leading-[normal] left-0 not-italic text-[#16274d] text-[14px] top-0 w-0">Adults</p>
    </div>
  );
}

function Option3() {
  return (
    <div className="absolute left-[-586.12px] size-0 top-[-562.83px]" data-name="Option">
      <p className="absolute font-['Poppins:Regular',sans-serif] leading-[normal] left-0 not-italic text-[#16274d] text-[14px] top-0 w-0">VIP</p>
    </div>
  );
}

function Dropdown() {
  return (
    <div className="bg-[rgba(255,255,255,0)] h-[42.5px] relative rounded-[10px] shrink-0 w-full" data-name="Dropdown">
      <div aria-hidden="true" className="absolute border-[#6cc2e2] border-[0.625px] border-solid inset-0 pointer-events-none rounded-[10px] shadow-[0px_0px_0px_1.651px_rgba(78,190,227,0.41)]" />
      <Option />
      <Option1 />
      <Option2 />
      <Option3 />
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

function Button2() {
  return (
    <div className="h-[42.256px] relative rounded-[10px] shrink-0 w-[91.387px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[#d1d5dc] border-[0.625px] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[42.256px] items-start px-[20.625px] py-[10.625px] relative w-[91.387px]">
        <p className="font-['Poppins:Medium',sans-serif] leading-[21px] not-italic relative shrink-0 text-[#16274d] text-[14px] text-center text-nowrap whitespace-pre">Cancel</p>
      </div>
    </div>
  );
}

function Button3() {
  return (
    <div className="bg-[#4ebee3] h-[41.006px] relative rounded-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] shrink-0 w-[151.65px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[41.006px] items-start px-[20px] py-[10px] relative w-[151.65px]">
        <p className="font-['Poppins:Medium',sans-serif] leading-[21px] not-italic relative shrink-0 text-[14px] text-center text-nowrap text-white whitespace-pre">Save Wallpaper</p>
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="bg-[rgba(249,250,251,0.5)] h-[74.873px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0.625px_0px_0px] border-gray-200 border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center justify-end size-full">
        <div className="box-border content-stretch flex gap-[11.992px] h-[74.873px] items-center justify-end pb-0 pl-0 pr-[23.994px] pt-[0.625px] relative w-full">
          <Button2 />
          <Button3 />
        </div>
      </div>
    </div>
  );
}

export default function Container8() {
  return (
    <div className="bg-white box-border content-stretch flex flex-col items-start relative rounded-[14px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] size-full" data-name="Container">
      <Container />
      <Container6 />
      <Container7 />
    </div>
  );
}