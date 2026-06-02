import { useState } from 'react';
import { X, Monitor, MonitorOff, Tablet } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { SingleSelectDropdown } from './UnifiedDropdown';

// Terminal interface matching CareInn15 device structure
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

interface SetVisibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string; // e.g., "Set Visibility for 3 Items"
  terminals: Terminal[];
  currentSelection: string[]; // Array of terminal IDs
  onSave: (selectedTerminals: string[]) => void;
  successMessage?: string; // Custom success message
}

type TerminalSortField = 'deviceId' | 'mrn' | 'roomNo' | 'bedNo' | 'building' | 'floor' | 'poc' | 'group' | 'isConnected';
type SortDirection = 'asc' | 'desc';

export default function SetVisibilityModal({
  isOpen,
  onClose,
  title,
  terminals,
  currentSelection,
  onSave,
  successMessage = 'Visibility settings updated'
}: SetVisibilityModalProps) {
  const [selectedTerminals, setSelectedTerminals] = useState<string[]>(currentSelection);
  const [filterGroup, setFilterGroup] = useState<string>('all');
  const [filterConnection, setFilterConnection] = useState<string>('all');
  const [sortField, setSortField] = useState<TerminalSortField>('deviceId');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  if (!isOpen) return null;

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
    toast.success(successMessage, { duration: 2000 });
    onClose();
  };

  // Calculate statistics
  const totalTerminals = terminals.length;
  const connectedTerminals = terminals.filter(t => t.isConnected).length;
  const disconnectedTerminals = totalTerminals - connectedTerminals;

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
            {title}
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
                  <MonitorOff size={22} className="text-[#4EBEE3]" strokeWidth={2} />
                </div>
              </div>
            </button>
          </div>

          {/* Group Filter */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                Group:
              </label>
              <div className="w-[160px]">
                <SingleSelectDropdown
                  options={[
                    { value: 'all', label: 'All Groups' },
                    { value: 'Kids', label: 'Kids' },
                    { value: 'Adults', label: 'Adults' },
                    { value: 'VIP', label: 'VIP' }
                  ]}
                  value={filterGroup}
                  onChange={(value) => setFilterGroup(value)}
                />
              </div>
            </div>
            <button
              onClick={handleSelectAll}
              className="text-[13px] font-medium text-[#4EBEE3] hover:text-[#3DA5CA] transition-colors font-['Poppins',sans-serif]"
            >
              {filteredAndSortedTerminals.every(t => selectedTerminals.includes(t.id)) && filteredAndSortedTerminals.length > 0 ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          {/* Terminal List */}
          <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
            <div className="max-h-[300px] overflow-y-auto">
              {filteredAndSortedTerminals.length === 0 ? (
                <div className="p-12 text-center">
                  <Monitor size={40} className="text-gray-300 mx-auto mb-3" strokeWidth={1.5} />
                  <p className="text-[14px] text-gray-500 font-['Poppins',sans-serif]">No terminals match the current filters</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB] sticky top-0">
                    <tr>
                      <th className="py-3 px-4 text-left">
                        <input
                          type="checkbox"
                          checked={filteredAndSortedTerminals.length > 0 && filteredAndSortedTerminals.every(t => selectedTerminals.includes(t.id))}
                          onChange={handleSelectAll}
                          className="w-5 h-5 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer"
                          style={{ accentColor: '#4EBEE3' }}
                        />
                      </th>
                      <th 
                        className="py-3 px-4 text-left text-[12px] font-semibold text-[#16274D] font-['Poppins',sans-serif] cursor-pointer hover:bg-[#4EBEE3]/5"
                        onClick={() => handleSort('deviceId')}
                      >
                        Device ID<SortIcon field="deviceId" />
                      </th>
                      <th 
                        className="py-3 px-4 text-left text-[12px] font-semibold text-[#16274D] font-['Poppins',sans-serif] cursor-pointer hover:bg-[#4EBEE3]/5"
                        onClick={() => handleSort('mrn')}
                      >
                        MRN<SortIcon field="mrn" />
                      </th>
                      <th 
                        className="py-3 px-4 text-left text-[12px] font-semibold text-[#16274D] font-['Poppins',sans-serif] cursor-pointer hover:bg-[#4EBEE3]/5"
                        onClick={() => handleSort('roomNo')}
                      >
                        Room<SortIcon field="roomNo" />
                      </th>
                      <th 
                        className="py-3 px-4 text-left text-[12px] font-semibold text-[#16274D] font-['Poppins',sans-serif] cursor-pointer hover:bg-[#4EBEE3]/5"
                        onClick={() => handleSort('bedNo')}
                      >
                        Bed<SortIcon field="bedNo" />
                      </th>
                      <th 
                        className="py-3 px-4 text-left text-[12px] font-semibold text-[#16274D] font-['Poppins',sans-serif] cursor-pointer hover:bg-[#4EBEE3]/5"
                        onClick={() => handleSort('building')}
                      >
                        Building<SortIcon field="building" />
                      </th>
                      <th 
                        className="py-3 px-4 text-left text-[12px] font-semibold text-[#16274D] font-['Poppins',sans-serif] cursor-pointer hover:bg-[#4EBEE3]/5"
                        onClick={() => handleSort('floor')}
                      >
                        Floor<SortIcon field="floor" />
                      </th>
                      <th 
                        className="py-3 px-4 text-left text-[12px] font-semibold text-[#16274D] font-['Poppins',sans-serif] cursor-pointer hover:bg-[#4EBEE3]/5"
                        onClick={() => handleSort('poc')}
                      >
                        POC<SortIcon field="poc" />
                      </th>
                      <th 
                        className="py-3 px-4 text-left text-[12px] font-semibold text-[#16274D] font-['Poppins',sans-serif] cursor-pointer hover:bg-[#4EBEE3]/5"
                        onClick={() => handleSort('group')}
                      >
                        Group<SortIcon field="group" />
                      </th>
                      <th 
                        className="py-3 px-4 text-center text-[12px] font-semibold text-[#16274D] font-['Poppins',sans-serif] cursor-pointer hover:bg-[#4EBEE3]/5"
                        onClick={() => handleSort('isConnected')}
                      >
                        Status<SortIcon field="isConnected" />
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAndSortedTerminals.map((terminal) => (
                      <tr 
                        key={terminal.id}
                        className="hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                        onClick={() => handleTerminalSelect(terminal.id)}
                      >
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={selectedTerminals.includes(terminal.id)}
                            onChange={() => handleTerminalSelect(terminal.id)}
                            className="w-5 h-5 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer"
                            style={{ accentColor: '#4EBEE3' }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                        <td className="py-3 px-4 text-[13px] text-[#16274D] font-['Poppins',sans-serif]">
                          {terminal.deviceId}
                        </td>
                        <td className="py-3 px-4 text-[13px] text-[#16274D] font-['Poppins',sans-serif]">
                          {terminal.mrn}
                        </td>
                        <td className="py-3 px-4 text-[13px] text-[#16274D] font-['Poppins',sans-serif]">
                          {terminal.roomNo}
                        </td>
                        <td className="py-3 px-4 text-[13px] text-[#16274D] font-['Poppins',sans-serif]">
                          {terminal.bedNo}
                        </td>
                        <td className="py-3 px-4 text-[13px] text-[#16274D] font-['Poppins',sans-serif]">
                          {terminal.building}
                        </td>
                        <td className="py-3 px-4 text-[13px] text-[#16274D] font-['Poppins',sans-serif]">
                          {terminal.floor}
                        </td>
                        <td className="py-3 px-4 text-[13px] text-[#16274D] font-['Poppins',sans-serif]">
                          {terminal.poc}
                        </td>
                        <td className="py-3 px-4 text-[13px] text-[#16274D] font-['Poppins',sans-serif]">
                          {terminal.group}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center">
                            <div className={`w-2.5 h-2.5 rounded-full ${
                              terminal.isConnected ? 'bg-green-500' : 'bg-red-500'
                            }`}></div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Selected Count */}
          <div className="mt-4 text-[13px] text-gray-600 font-['Poppins',sans-serif]">
            Selected: <span className="font-semibold text-[#16274D]">{selectedTerminals.length}</span> of {totalTerminals} terminals
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border-2 border-gray-200 text-[#16274D] rounded-lg font-['Poppins',sans-serif] text-[14px] font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg font-['Poppins',sans-serif] text-[14px] font-medium transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}