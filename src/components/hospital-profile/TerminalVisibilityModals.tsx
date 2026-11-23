/**
 * Terminal visibility dialogs for profile categories (moved unchanged from the
 * original Hospital Profile page). Terminals are sample data until the profile
 * is wired to the Device Manager.
 */
import { useState } from 'react';
import { X, Check, Search, Monitor, MonitorX, Tablet, ArrowUpDown } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export interface Terminal {
  id: string;
  deviceId: string;
  mrn: string;
  roomNo: string;
  bedNo: string;
  building: string;
  floor: string;
  poc: string;
  group: string;
  isConnected: boolean;
}

export const mockTerminals: Terminal[] = [
  { id: '1', deviceId: 'TRM-2401', mrn: 'MRN-78945', roomNo: '301', bedNo: 'A', building: 'Main Tower', floor: '3rd Floor', poc: 'Dr. Sarah Ahmed', group: 'Kids', isConnected: true },
  { id: '2', deviceId: 'TRM-2402', mrn: 'MRN-78946', roomNo: '302', bedNo: 'B', building: 'Main Tower', floor: '3rd Floor', poc: 'Dr. Sarah Ahmed', group: 'Kids', isConnected: true },
  { id: '3', deviceId: 'TRM-2403', mrn: 'MRN-78947', roomNo: '401', bedNo: 'A', building: 'West Wing', floor: '4th Floor', poc: 'Dr. Michael Chen', group: 'Adults', isConnected: false },
  { id: '4', deviceId: 'TRM-2404', mrn: 'MRN-78948', roomNo: '402', bedNo: 'B', building: 'West Wing', floor: '4th Floor', poc: 'Dr. Michael Chen', group: 'Adults', isConnected: true },
  { id: '5', deviceId: 'TRM-2405', mrn: 'MRN-78949', roomNo: '201', bedNo: 'C', building: 'East Wing', floor: '2nd Floor', poc: 'Dr. Emily Roberts', group: 'VIP', isConnected: true },
];


// Visibility Modal Component
interface VisibilityModalProps {
  onClose: () => void;
  category: { nameEn: string; visibleTerminals: string[] };
  terminals: Terminal[];
  onSave: (selectedTerminals: string[]) => void;
  isAddMode?: boolean;
}

type TerminalSortField = 'deviceId' | 'mrn' | 'roomNo' | 'bedNo' | 'building' | 'floor' | 'poc' | 'group' | 'isConnected';
type SortDirection = 'asc' | 'desc';

export function VisibilityModal({ onClose, category, terminals, onSave, isAddMode = false }: VisibilityModalProps) {
  const [selectedTerminals, setSelectedTerminals] = useState<string[]>(category.visibleTerminals);
  const [filterGroup, setFilterGroup] = useState<string>('all');
  const [filterConnection, setFilterConnection] = useState<string>('all');
  const [sortField, setSortField] = useState<TerminalSortField>('deviceId');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleTerminalSelect = (terminalId: string) => {
    setSelectedTerminals(prev =>
      prev.includes(terminalId) ? prev.filter(id => id !== terminalId) : [...prev, terminalId]
    );
  };

  const handleSelectAll = () => {
    const filtered = filteredAndSortedTerminals;
    const allFilteredSelected = filtered.every(t => selectedTerminals.includes(t.id));
    
    if (allFilteredSelected) {
      setSelectedTerminals(prev => prev.filter(id => !filtered.find(t => t.id === id)));
    } else {
      const newSelected = [...selectedTerminals];
      filtered.forEach(t => {
        if (!newSelected.includes(t.id)) {
          newSelected.push(t.id);
        }
      });
      setSelectedTerminals(newSelected);
    }
  };

  const handleSort = (field: TerminalSortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSave = () => {
    onSave(selectedTerminals);
    if (!isAddMode) {
      toast.success('Visibility settings updated');
    }
  };

  // Calculate statistics
  const totalTerminals = terminals.length;
  const connectedTerminals = terminals.filter(t => t.isConnected).length;
  const disconnectedTerminals = totalTerminals - connectedTerminals;

  // Get unique groups
  const groups = Array.from(new Set(terminals.map(t => t.group)));

  // Filter and sort terminals
  const filteredTerminals = terminals.filter(terminal => {
    const matchesGroup = filterGroup === 'all' || terminal.group === filterGroup;
    const matchesConnection = filterConnection === 'all' || 
      (filterConnection === 'connected' && terminal.isConnected) ||
      (filterConnection === 'disconnected' && !terminal.isConnected);
    return matchesGroup && matchesConnection;
  });

  const filteredAndSortedTerminals = [...filteredTerminals].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];
    
    if (typeof aVal === 'boolean') {
      aVal = aVal ? 1 : 0;
      bVal = bVal ? 1 : 0;
    }
    
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const SortIcon = ({ field }: { field: TerminalSortField }) => {
    if (sortField !== field) return null;
    return (
      <span className="ml-1">
        {sortDirection === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header - VisibilityModal (Single Category) */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-[19px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
            Set Visibility for {category.nameEn}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {/* All Terminals */}
            <button
              onClick={() => setFilterConnection('all')}
              className={`bg-white rounded-xl border-2 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 text-left ${
                filterConnection === 'all' ? 'border-[#4EBEE3] ring-2 ring-[#4EBEE3]/20' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between px-6 py-3">
                <div className="flex flex-col gap-1.5">
                  <div className="text-[13px] font-medium text-[#637381] font-['Poppins',sans-serif]">All Terminals</div>
                  <div className="text-[28px] font-semibold text-[#16274D] font-['Poppins',sans-serif] leading-none">{totalTerminals}</div>
                </div>
                <div className="flex items-center justify-center w-[52px] h-[52px] rounded-lg bg-[#4EBEE3]/10">
                  <Tablet size={22} className="text-[#4EBEE3] rotate-90" strokeWidth={2} />
                </div>
              </div>
            </button>

            {/* Connected */}
            <button
              onClick={() => setFilterConnection('connected')}
              className={`bg-white rounded-xl border-2 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 text-left ${
                filterConnection === 'connected' ? 'border-[#4EBEE3] ring-2 ring-[#4EBEE3]/20' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between px-6 py-3">
                <div className="flex flex-col gap-1.5">
                  <div className="text-[13px] font-medium text-[#637381] font-['Poppins',sans-serif]">Connected</div>
                  <div className="text-[28px] font-semibold text-[#16274D] font-['Poppins',sans-serif] leading-none">{connectedTerminals}</div>
                </div>
                <div className="flex items-center justify-center w-[52px] h-[52px] rounded-lg bg-[#4EBEE3]/10">
                  <Monitor size={22} className="text-[#4EBEE3]" strokeWidth={2} />
                </div>
              </div>
            </button>

            {/* Disconnected */}
            <button
              onClick={() => setFilterConnection('disconnected')}
              className={`bg-white rounded-xl border-2 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 text-left ${
                filterConnection === 'disconnected' ? 'border-[#4EBEE3] ring-2 ring-[#4EBEE3]/20' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between px-6 py-3">
                <div className="flex flex-col gap-1.5">
                  <div className="text-[13px] font-medium text-[#637381] font-['Poppins',sans-serif]">Disconnected</div>
                  <div className="text-[28px] font-semibold text-[#16274D] font-['Poppins',sans-serif] leading-none">{disconnectedTerminals}</div>
                </div>
                <div className="flex items-center justify-center w-[52px] h-[52px] rounded-lg bg-[#4EBEE3]/10">
                  <MonitorX size={22} className="text-[#4EBEE3]" strokeWidth={2} />
                </div>
              </div>
            </button>
          </div>

          {/* Filter by Group */}
          <div className="mb-6">
            <label className="block text-[13px] font-medium text-[#16274D] mb-2 font-['Poppins',sans-serif]">
              Filter by Group
            </label>
            <select
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-[13px] text-[#16274D] font-['Poppins',sans-serif] focus:outline-none focus:ring-2 focus:ring-[#4ebee3] focus:border-transparent"
            >
              <option value="all">All Groups</option>
              {groups.map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>

          {/* Terminals Table - Visibility Modal (Single Category) */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left w-12">
                      <input
                        type="checkbox"
                        checked={filteredAndSortedTerminals.length > 0 && filteredAndSortedTerminals.every(t => selectedTerminals.includes(t.id))}
                        onChange={handleSelectAll}
                        className="w-4 h-4 rounded border-2 border-gray-300 accent-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer"
                      />
                    </th>
                    <th
                      onClick={() => handleSort('deviceId')}
                      className="px-4 py-3 text-left text-[11px] font-semibold text-[#16274D] uppercase tracking-wider font-['Poppins',sans-serif] cursor-pointer hover:bg-gray-100"
                    >
                      Device ID <SortIcon field="deviceId" />
                    </th>
                    <th
                      onClick={() => handleSort('mrn')}
                      className="px-4 py-3 text-left text-[11px] font-semibold text-[#16274D] uppercase tracking-wider font-['Poppins',sans-serif] cursor-pointer hover:bg-gray-100"
                    >
                      MRN <SortIcon field="mrn" />
                    </th>
                    <th
                      onClick={() => handleSort('roomNo')}
                      className="px-4 py-3 text-left text-[11px] font-semibold text-[#16274D] uppercase tracking-wider font-['Poppins',sans-serif] cursor-pointer hover:bg-gray-100"
                    >
                      Room <SortIcon field="roomNo" />
                    </th>
                    <th
                      onClick={() => handleSort('bedNo')}
                      className="px-4 py-3 text-left text-[11px] font-semibold text-[#16274D] uppercase tracking-wider font-['Poppins',sans-serif] cursor-pointer hover:bg-gray-100"
                    >
                      Bed <SortIcon field="bedNo" />
                    </th>
                    <th
                      onClick={() => handleSort('building')}
                      className="px-4 py-3 text-left text-[11px] font-semibold text-[#16274D] uppercase tracking-wider font-['Poppins',sans-serif] cursor-pointer hover:bg-gray-100"
                    >
                      Building <SortIcon field="building" />
                    </th>
                    <th
                      onClick={() => handleSort('floor')}
                      className="px-4 py-3 text-left text-[11px] font-semibold text-[#16274D] uppercase tracking-wider font-['Poppins',sans-serif] cursor-pointer hover:bg-gray-100"
                    >
                      Floor <SortIcon field="floor" />
                    </th>
                    <th
                      onClick={() => handleSort('poc')}
                      className="px-4 py-3 text-left text-[11px] font-semibold text-[#16274D] uppercase tracking-wider font-['Poppins',sans-serif] cursor-pointer hover:bg-gray-100"
                    >
                      POC <SortIcon field="poc" />
                    </th>
                    <th
                      onClick={() => handleSort('group')}
                      className="px-4 py-3 text-left text-[11px] font-semibold text-[#16274D] uppercase tracking-wider font-['Poppins',sans-serif] cursor-pointer hover:bg-gray-100"
                    >
                      Group <SortIcon field="group" />
                    </th>
                    <th
                      onClick={() => handleSort('isConnected')}
                      className="px-4 py-3 text-center text-[11px] font-semibold text-[#16274D] uppercase tracking-wider font-['Poppins',sans-serif] cursor-pointer hover:bg-gray-100"
                    >
                      Status <SortIcon field="isConnected" />
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredAndSortedTerminals.map((terminal) => (
                    <tr key={terminal.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedTerminals.includes(terminal.id)}
                          onChange={() => handleTerminalSelect(terminal.id)}
                          className="w-4 h-4 rounded border-2 border-gray-300 accent-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3 text-[12px] text-[#16274D] font-['Poppins',sans-serif]">
                        {terminal.deviceId}
                      </td>
                      <td className="px-4 py-3 text-[12px] text-[#16274D] font-['Poppins',sans-serif]">
                        {terminal.mrn}
                      </td>
                      <td className="px-4 py-3 text-[12px] text-[#16274D] font-['Poppins',sans-serif]">
                        {terminal.roomNo}
                      </td>
                      <td className="px-4 py-3 text-[12px] text-[#16274D] font-['Poppins',sans-serif]">
                        {terminal.bedNo}
                      </td>
                      <td className="px-4 py-3 text-[12px] text-[#16274D] font-['Poppins',sans-serif]">
                        {terminal.building}
                      </td>
                      <td className="px-4 py-3 text-[12px] text-[#16274D] font-['Poppins',sans-serif]">
                        {terminal.floor}
                      </td>
                      <td className="px-4 py-3 text-[12px] text-[#16274D] font-['Poppins',sans-serif]">
                        {terminal.poc}
                      </td>
                      <td className="px-4 py-3 text-[12px] text-[#16274D] font-['Poppins',sans-serif]">
                        {terminal.group}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium font-['Poppins',sans-serif] ${
                          terminal.isConnected
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {terminal.isConnected ? 'Connected' : 'Disconnected'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50/50">
          <div className="text-[13px] text-[#16274D] font-['Poppins',sans-serif]">
            <span className="font-semibold">{selectedTerminals.length}</span> terminal{selectedTerminals.length !== 1 ? 's' : ''} selected
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border border-gray-300 text-[#16274D] rounded-lg text-[13px] font-medium font-['Poppins',sans-serif] hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-[#4ebee3] text-white rounded-lg text-[13px] font-medium font-['Poppins',sans-serif] hover:bg-[#3da5ca] transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Bulk Visibility Modal Component  
interface BulkVisibilityModalProps {
  onClose: () => void;
  categoryCount: number;
  terminals: Terminal[];
  onSave: (selectedTerminals: string[]) => void;
}

export function BulkVisibilityModal({ onClose, categoryCount, terminals, onSave }: BulkVisibilityModalProps) {
  const [selectedTerminals, setSelectedTerminals] = useState<string[]>([]);
  const [filterGroup, setFilterGroup] = useState<string>('all');
  const [filterConnection, setFilterConnection] = useState<string>('all');
  const [sortField, setSortField] = useState<TerminalSortField>('deviceId');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleTerminalSelect = (terminalId: string) => {
    setSelectedTerminals(prev =>
      prev.includes(terminalId) ? prev.filter(id => id !== terminalId) : [...prev, terminalId]
    );
  };

  const handleSelectAll = () => {
    const filtered = filteredAndSortedTerminals;
    const allFilteredSelected = filtered.every(t => selectedTerminals.includes(t.id));
    
    if (allFilteredSelected) {
      setSelectedTerminals(prev => prev.filter(id => !filtered.find(t => t.id === id)));
    } else {
      const newSelected = [...selectedTerminals];
      filtered.forEach(t => {
        if (!newSelected.includes(t.id)) {
          newSelected.push(t.id);
        }
      });
      setSelectedTerminals(newSelected);
    }
  };

  const handleSort = (field: TerminalSortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSave = () => {
    onSave(selectedTerminals);
    toast.success(`Visibility updated for ${categoryCount} categories`);
  };

  // Calculate statistics
  const totalTerminals = terminals.length;
  const connectedTerminals = terminals.filter(t => t.isConnected).length;
  const disconnectedTerminals = totalTerminals - connectedTerminals;

  // Get unique groups
  const groups = Array.from(new Set(terminals.map(t => t.group)));

  // Filter and sort terminals
  const filteredTerminals = terminals.filter(terminal => {
    const matchesGroup = filterGroup === 'all' || terminal.group === filterGroup;
    const matchesConnection = filterConnection === 'all' || 
      (filterConnection === 'connected' && terminal.isConnected) ||
      (filterConnection === 'disconnected' && !terminal.isConnected);
    return matchesGroup && matchesConnection;
  });

  const filteredAndSortedTerminals = [...filteredTerminals].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];
    
    if (typeof aVal === 'boolean') {
      aVal = aVal ? 1 : 0;
      bVal = bVal ? 1 : 0;
    }
    
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const SortIcon = ({ field }: { field: TerminalSortField }) => {
    if (sortField !== field) return null;
    return (
      <span className="ml-1">
        {sortDirection === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-[19px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
            Set Visibility for {categoryCount} Categor{categoryCount !== 1 ? 'ies' : 'y'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {/* All Terminals */}
            <button
              onClick={() => setFilterConnection('all')}
              className={`bg-white rounded-xl border-2 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 text-left ${
                filterConnection === 'all' ? 'border-[#4EBEE3] ring-2 ring-[#4EBEE3]/20' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between px-6 py-3">
                <div className="flex flex-col gap-1.5">
                  <div className="text-[13px] font-medium text-[#637381] font-['Poppins',sans-serif]">All Terminals</div>
                  <div className="text-[28px] font-semibold text-[#16274D] font-['Poppins',sans-serif] leading-none">{totalTerminals}</div>
                </div>
                <div className="flex items-center justify-center w-[52px] h-[52px] rounded-lg bg-[#4EBEE3]/10">
                  <Tablet size={22} className="text-[#4EBEE3] rotate-90" strokeWidth={2} />
                </div>
              </div>
            </button>

            {/* Connected */}
            <button
              onClick={() => setFilterConnection('connected')}
              className={`bg-white rounded-xl border-2 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 text-left ${
                filterConnection === 'connected' ? 'border-[#4EBEE3] ring-2 ring-[#4EBEE3]/20' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between px-6 py-3">
                <div className="flex flex-col gap-1.5">
                  <div className="text-[13px] font-medium text-[#637381] font-['Poppins',sans-serif]">Connected</div>
                  <div className="text-[28px] font-semibold text-[#16274D] font-['Poppins',sans-serif] leading-none">{connectedTerminals}</div>
                </div>
                <div className="flex items-center justify-center w-[52px] h-[52px] rounded-lg bg-[#4EBEE3]/10">
                  <Monitor size={22} className="text-[#4EBEE3]" strokeWidth={2} />
                </div>
              </div>
            </button>

            {/* Disconnected */}
            <button
              onClick={() => setFilterConnection('disconnected')}
              className={`bg-white rounded-xl border-2 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 text-left ${
                filterConnection === 'disconnected' ? 'border-[#4EBEE3] ring-2 ring-[#4EBEE3]/20' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between px-6 py-3">
                <div className="flex flex-col gap-1.5">
                  <div className="text-[13px] font-medium text-[#637381] font-['Poppins',sans-serif]">Disconnected</div>
                  <div className="text-[28px] font-semibold text-[#16274D] font-['Poppins',sans-serif] leading-none">{disconnectedTerminals}</div>
                </div>
                <div className="flex items-center justify-center w-[52px] h-[52px] rounded-lg bg-[#4EBEE3]/10">
                  <MonitorX size={22} className="text-[#4EBEE3]" strokeWidth={2} />
                </div>
              </div>
            </button>
          </div>

          {/* Filter by Group */}
          <div className="mb-6">
            <label className="block text-[13px] font-medium text-[#16274D] mb-2 font-['Poppins',sans-serif]">
              Filter by Group
            </label>
            <select
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-[13px] text-[#16274D] font-['Poppins',sans-serif] focus:outline-none focus:ring-2 focus:ring-[#4ebee3] focus:border-transparent"
            >
              <option value="all">All Groups</option>
              {groups.map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>

          {/* Terminals Table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left w-12">
                      <input
                        type="checkbox"
                        checked={filteredAndSortedTerminals.length > 0 && filteredAndSortedTerminals.every(t => selectedTerminals.includes(t.id))}
                        onChange={handleSelectAll}
                        className="w-4 h-4 rounded border-2 border-gray-300 accent-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer"
                      />
                    </th>
                    <th
                      onClick={() => handleSort('deviceId')}
                      className="px-4 py-3 text-left text-[11px] font-semibold text-[#16274D] uppercase tracking-wider font-['Poppins',sans-serif] cursor-pointer hover:bg-gray-100"
                    >
                      Device ID <SortIcon field="deviceId" />
                    </th>
                    <th
                      onClick={() => handleSort('mrn')}
                      className="px-4 py-3 text-left text-[11px] font-semibold text-[#16274D] uppercase tracking-wider font-['Poppins',sans-serif] cursor-pointer hover:bg-gray-100"
                    >
                      MRN <SortIcon field="mrn" />
                    </th>
                    <th
                      onClick={() => handleSort('roomNo')}
                      className="px-4 py-3 text-left text-[11px] font-semibold text-[#16274D] uppercase tracking-wider font-['Poppins',sans-serif] cursor-pointer hover:bg-gray-100"
                    >
                      Room <SortIcon field="roomNo" />
                    </th>
                    <th
                      onClick={() => handleSort('bedNo')}
                      className="px-4 py-3 text-left text-[11px] font-semibold text-[#16274D] uppercase tracking-wider font-['Poppins',sans-serif] cursor-pointer hover:bg-gray-100"
                    >
                      Bed <SortIcon field="bedNo" />
                    </th>
                    <th
                      onClick={() => handleSort('building')}
                      className="px-4 py-3 text-left text-[11px] font-semibold text-[#16274D] uppercase tracking-wider font-['Poppins',sans-serif] cursor-pointer hover:bg-gray-100"
                    >
                      Building <SortIcon field="building" />
                    </th>
                    <th
                      onClick={() => handleSort('floor')}
                      className="px-4 py-3 text-left text-[11px] font-semibold text-[#16274D] uppercase tracking-wider font-['Poppins',sans-serif] cursor-pointer hover:bg-gray-100"
                    >
                      Floor <SortIcon field="floor" />
                    </th>
                    <th
                      onClick={() => handleSort('poc')}
                      className="px-4 py-3 text-left text-[11px] font-semibold text-[#16274D] uppercase tracking-wider font-['Poppins',sans-serif] cursor-pointer hover:bg-gray-100"
                    >
                      POC <SortIcon field="poc" />
                    </th>
                    <th
                      onClick={() => handleSort('group')}
                      className="px-4 py-3 text-left text-[11px] font-semibold text-[#16274D] uppercase tracking-wider font-['Poppins',sans-serif] cursor-pointer hover:bg-gray-100"
                    >
                      Group <SortIcon field="group" />
                    </th>
                    <th
                      onClick={() => handleSort('isConnected')}
                      className="px-4 py-3 text-center text-[11px] font-semibold text-[#16274D] uppercase tracking-wider font-['Poppins',sans-serif] cursor-pointer hover:bg-gray-100"
                    >
                      Status <SortIcon field="isConnected" />
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredAndSortedTerminals.map((terminal) => (
                    <tr key={terminal.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedTerminals.includes(terminal.id)}
                          onChange={() => handleTerminalSelect(terminal.id)}
                          className="w-4 h-4 rounded border-2 border-gray-300 accent-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3 text-[12px] text-[#16274D] font-['Poppins',sans-serif]">
                        {terminal.deviceId}
                      </td>
                      <td className="px-4 py-3 text-[12px] text-[#16274D] font-['Poppins',sans-serif]">
                        {terminal.mrn}
                      </td>
                      <td className="px-4 py-3 text-[12px] text-[#16274D] font-['Poppins',sans-serif]">
                        {terminal.roomNo}
                      </td>
                      <td className="px-4 py-3 text-[12px] text-[#16274D] font-['Poppins',sans-serif]">
                        {terminal.bedNo}
                      </td>
                      <td className="px-4 py-3 text-[12px] text-[#16274D] font-['Poppins',sans-serif]">
                        {terminal.building}
                      </td>
                      <td className="px-4 py-3 text-[12px] text-[#16274D] font-['Poppins',sans-serif]">
                        {terminal.floor}
                      </td>
                      <td className="px-4 py-3 text-[12px] text-[#16274D] font-['Poppins',sans-serif]">
                        {terminal.poc}
                      </td>
                      <td className="px-4 py-3 text-[12px] text-[#16274D] font-['Poppins',sans-serif]">
                        {terminal.group}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium font-['Poppins',sans-serif] ${
                          terminal.isConnected
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {terminal.isConnected ? 'Connected' : 'Disconnected'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50/50">
          <div className="text-[13px] text-[#16274D] font-['Poppins',sans-serif]">
            <span className="font-semibold">{selectedTerminals.length}</span> terminal{selectedTerminals.length !== 1 ? 's' : ''} selected
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border border-gray-300 text-[#16274D] rounded-lg text-[13px] font-medium font-['Poppins',sans-serif] hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-[#4ebee3] text-white rounded-lg text-[13px] font-medium font-['Poppins',sans-serif] hover:bg-[#3da5ca] transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

