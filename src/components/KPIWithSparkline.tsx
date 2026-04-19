import { TrendingUp, TrendingDown } from 'lucide-react';

interface KPIWithSparklineProps {
  label: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down';
  sparklineData: number[];
  valueColor?: string;
  labelSize?: string;
  valueSize?: string;
}

export function KPIWithSparkline({
  label,
  value,
  change,
  trend,
  sparklineData,
  valueColor = '#16274D',
  labelSize = '11px',
  valueSize = '14px'
}: KPIWithSparklineProps) {
  const isPositive = trend === 'up';
  const trendColor = isPositive ? '#10B981' : '#EF4444';

  return (
    <div className="flex items-center justify-between">
      <span className="font-['Poppins',sans-serif]" style={{ fontSize: labelSize, color: '#6B7280' }}>
        {label}
      </span>
      <div className="flex items-center gap-1">
        <span
          className="font-semibold font-['Poppins',sans-serif]"
          style={{ fontSize: valueSize, color: valueColor }}
        >
          {value}
        </span>
        <span
          className="text-[9px] font-semibold font-['Poppins',sans-serif] flex items-center gap-0.5"
          style={{ color: trendColor }}
        >
          {Math.abs(change).toFixed(1)}% 
          {isPositive ? (
            <TrendingUp size={10} strokeWidth={2.5} />
          ) : (
            <TrendingDown size={10} strokeWidth={2.5} />
          )}
        </span>
      </div>
    </div>
  );
}
