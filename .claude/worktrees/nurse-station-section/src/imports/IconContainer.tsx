import svgPaths from "./svg-dxdh56hil0";

function IconsSolidIcRadioOn() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="icons/solid/ic-radio-on">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="icons/solid/ic-radio-on">
          <path clipRule="evenodd" d={svgPaths.p27863c80} fill="var(--fill-0, #00B8D9)" fillRule="evenodd" id="primary-shape" />
        </g>
      </svg>
    </div>
  );
}

export default function IconContainer() {
  return (
    <div className="relative rounded-[500px] size-full" data-name="icon container">
      <div className="size-full">
        <div className="box-border content-stretch flex items-start p-[8px] relative size-full">
          <IconsSolidIcRadioOn />
        </div>
      </div>
    </div>
  );
}