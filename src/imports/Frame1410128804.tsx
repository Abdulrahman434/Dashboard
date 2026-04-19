import svgPaths from "./svg-qtxg3n8523";

function Group() {
  return (
    <div className="absolute h-[10.051px] left-0 top-0 w-[10.545px]">
      <div className="absolute inset-[-9.95%_-9.48%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13 13">
          <g id="Group 1000004796">
            <path d={svgPaths.p1a93600} id="Ellipse 2" stroke="var(--stroke-0, #4EBEE3)" />
            <path d={svgPaths.p3e941000} fill="var(--fill-0, #4EBEE3)" id="Ellipse 3" />
          </g>
        </svg>
      </div>
    </div>
  );
}

export default function Frame() {
  return (
    <div className="relative size-full">
      <Group />
    </div>
  );
}