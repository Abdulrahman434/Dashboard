import { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

// Hook to detect when element becomes visible
export function useIntersectionObserver(options = {}) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasAnimated) {
        setIsVisible(true);
        setHasAnimated(true);
      }
    }, {
      threshold: 0.2,
      ...options
    });

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [hasAnimated, options]);

  return [ref, isVisible] as const;
}

// Darker hover colors
const getDarkerColor = (color: string) => {
  const colorMap: {[key: string]: string} = {
    '#4EBEE3': '#3DA5CA', // CareInn blue -> darker
    '#16274D': '#0f1b37', // Dark blue -> darker
    '#3DA5CA': '#2d8fb3', // Medium blue -> darker
    '#5BC7E8': '#4ab3d4', // Light blue -> darker
    '#2B3E5F': '#1f2d45', // Navy -> darker
  };
  return colorMap[color] || color;
};

interface BarChartAnimatedProps {
  data: any[];
  totalAssets: number;
}

export function BarChartAnimated({ data, totalAssets }: BarChartAnimatedProps) {
  const [ref, isVisible] = useIntersectionObserver();
  const [activeBar, setActiveBar] = useState<number | null>(null);

  const CustomBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200">
          <p className="text-[11px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-1">
            {payload[0].payload.name}
          </p>
          <p className="text-[10px] text-[#4EBEE3] font-['Poppins',sans-serif]">
            Engagement: {payload[0].value}
          </p>
          <p className="text-[10px] text-[#16274D] font-['Poppins',sans-serif]">
            Patient Services: {payload[1]?.value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div ref={ref} style={{ width: '100%', height: '100%', minHeight: '160px' }}>
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={160}>
        <BarChart 
          data={data} 
          barSize={24}
          onMouseMove={(state) => {
            if (state.isTooltipActive) {
              setActiveBar(state.activeTooltipIndex ?? null);
            } else {
              setActiveBar(null);
            }
          }}
          onMouseLeave={() => setActiveBar(null)}
        >
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 10, fill: '#6B7280', fontFamily: 'Poppins' }}
            axisLine={{ stroke: '#E5E7EB' }}
            tickLine={false}
          />
          <Tooltip content={<CustomBarTooltip />} cursor={false} />
          <Bar 
            dataKey="engagement" 
            fill="#4EBEE3" 
            radius={[4, 4, 0, 0]} 
            animationDuration={isVisible ? 800 : 0}
            animationBegin={0}
            isAnimationActive={isVisible}
            onMouseEnter={(data, index) => setActiveBar(index)}
            onMouseLeave={() => setActiveBar(null)}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`}
                fill={activeBar === index ? getDarkerColor('#4EBEE3') : '#4EBEE3'}
              />
            ))}
          </Bar>
          <Bar 
            dataKey="patient" 
            fill="#16274D" 
            radius={[4, 4, 0, 0]} 
            animationDuration={isVisible ? 800 : 0}
            animationBegin={200}
            isAnimationActive={isVisible}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`}
                fill={activeBar === index ? getDarkerColor('#16274D') : '#16274D'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface PieChartAnimatedProps {
  data: any[];
  innerRadius?: number;
  outerRadius?: number;
}

export function PieChartAnimated({ data, innerRadius = 32, outerRadius = 55 }: PieChartAnimatedProps) {
  const [ref, isVisible] = useIntersectionObserver();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  return (
    <div ref={ref} style={{ width: '100%', height: '100%', minHeight: '160px' }}>
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={160}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            dataKey="value"
            animationBegin={0}
            animationDuration={isVisible ? 800 : 0}
            isAnimationActive={isVisible}
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={activeIndex === index ? getDarkerColor(entry.color) : entry.color}
                style={{ 
                  transition: 'fill 0.2s ease',
                  cursor: 'pointer'
                }}
              />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

interface LineChartAnimatedProps {
  data: any[];
}

export function LineChartAnimated({ data }: LineChartAnimatedProps) {
  const [ref, isVisible] = useIntersectionObserver();

  const CustomLineTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200">
          <p className="text-[11px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-1">
            {payload[0].payload.time}
          </p>
          <p className="text-[10px] text-[#4EBEE3] font-['Poppins',sans-serif]">
            Notifications: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div ref={ref} style={{ width: '100%', height: '100%', minHeight: '160px' }}>
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={160}>
        <LineChart data={data}>
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 9, fill: '#89898A' }}
            axisLine={false}
          />
          <Tooltip content={<CustomLineTooltip />} />
          <Line 
            type="monotone" 
            dataKey="count" 
            stroke="#4EBEE3" 
            strokeWidth={2}
            dot={false}
            animationDuration={isVisible ? 1000 : 0}
            animationBegin={0}
            isAnimationActive={isVisible}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}