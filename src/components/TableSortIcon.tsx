import { ArrowUpDown } from 'lucide-react';

type SortDirection = 'asc' | 'desc';

interface TableSortIconProps {
  field: string;
  currentField: string;
  direction: SortDirection;
}

/**
 * Reusable Table Sort Icon Component
 * Shows sorting direction indicator for table columns
 * Used across all tables in the CareInn system
 */
export default function TableSortIcon({ field, currentField, direction }: TableSortIconProps) {
  if (field !== currentField) {
    return <ArrowUpDown size={14} className="text-gray-400" />;
  }
  return (
    <ArrowUpDown 
      size={14} 
      className={`text-[#4EBEE3] ${direction === 'desc' ? 'transform rotate-180' : ''}`} 
    />
  );
}
