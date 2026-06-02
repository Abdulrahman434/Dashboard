import { useState, useEffect } from 'react';
import { X, Monitor, MonitorOff } from 'lucide-react';
import { SingleSelectDropdown } from './UnifiedDropdown';

interface Terminal {
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

interface UnifiedVisibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  itemName?: string; // Name of the item (e.g., "Channel Name", "Survey Title")
  terminals: Terminal[];
  currentSelection: string[];
  onSave: (selectedTerminals: string[]) => void;
}

export function UnifiedVisibilityModal({ 
  isOpen, 
  onClose, 
  title,
  itemName,
  terminals, 
  currentSelection, 
  onSave 
}: UnifiedVisibilityModalProps) {
  const [selectedTerminals, setSelectedTerminals] = useState<string[]>(currentSelection);
  const [filterGroup, setFilterGroup] = useState<string>('all');
  const [filterConnection, setFilterConnection] = useState<string>('all');

  // Update selection when currentSelection changes
  useEffect(() => {
    setSelectedTerminals(currentSelection);
  }, [currentSelection]);

  const handleTerminalSelect = (terminalId: string) => {
    setSelectedTerminals(prev =>
      prev.includes(terminalId) ? prev.filter(id => id !== terminalId) : [...prev, terminalId]
    );
  };

  const handleSelectAll = () => {
    const filtered = filteredTerminals;
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

  const handleSave = () => {
    onSave(selectedTerminals);
  };

  // Calculate statistics
  const totalTerminals = terminals.length;
  const connectedTerminals = terminals.filter(t => t.isConnected).length;
  const disconnectedTerminals = totalTerminals - connectedTerminals;

  // Fixed groups - always Kids, Adults, VIP
  const groups = ['Kids', 'Adults', 'VIP'];

  // Filter terminals
  const filteredTerminals = terminals.filter(terminal => {
    const matchesGroup = filterGroup === 'all' || terminal.group === filterGroup;
    const matchesConnection = filterConnection === 'all' || 
      (filterConnection === 'connected' && terminal.isConnected) ||
      (filterConnection === 'disconnected' && !terminal.isConnected);
    return matchesGroup && matchesConnection;
  });

  if (!isOpen) return null;

  const displayTitle = itemName ? `Set Visibility for ${itemName}` : (title || 'Set Visibility');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[1000px] max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-gray-200">
          <h3 className="text-[20px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
            {displayTitle}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        {/* Content */}
        <div className="p-7 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {/* All Terminals */}
            <button
              onClick={() => setFilterConnection('all')}
              className={`bg-white rounded-xl border-2 p-5 hover:border-[#4EBEE3] transition-all duration-200 text-left ${
                filterConnection === 'all' ? 'border-[#4EBEE3]' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <div className="text-[13px] font-medium text-[#637381] font-['Poppins',sans-serif] mb-2">All Terminals</div>
                  <div className="text-[36px] font-bold text-[#16274D] font-['Poppins',sans-serif] leading-none">{totalTerminals}</div>
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-[#4EBEE3]/10">
                  <Monitor size={24} className="text-[#4EBEE3]" strokeWidth={2} />
                </div>
              </div>
            </button>

            {/* Connected */}
            <button
              onClick={() => setFilterConnection('connected')}
              className={`bg-white rounded-xl border-2 p-5 hover:border-[#4EBEE3] transition-all duration-200 text-left ${
                filterConnection === 'connected' ? 'border-[#4EBEE3]' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <div className="text-[13px] font-medium text-[#637381] font-['Poppins',sans-serif] mb-2">Connected</div>
                  <div className="text-[36px] font-bold text-[#16274D] font-['Poppins',sans-serif] leading-none">{connectedTerminals}</div>
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-[#4EBEE3]/10">
                  <Monitor size={24} className="text-[#4EBEE3]" strokeWidth={2} />
                </div>
              </div>
            </button>

            {/* Disconnected */}
            <button
              onClick={() => setFilterConnection('disconnected')}
              className={`bg-white rounded-xl border-2 p-5 hover:border-[#4EBEE3] transition-all duration-200 text-left ${
                filterConnection === 'disconnected' ? 'border-[#4EBEE3]' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <div className="text-[13px] font-medium text-[#637381] font-['Poppins',sans-serif] mb-2">Disconnected</div>
                  <div className="text-[36px] font-bold text-[#16274D] font-['Poppins',sans-serif] leading-none">{disconnectedTerminals}</div>
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-[#4EBEE3]/10">
                  <MonitorOff size={24} className="text-[#4EBEE3]" strokeWidth={2} />
                </div>
              </div>
            </button>
          </div>

          {/* Filter Row */}
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-[14px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                Group:
              </label>
              <div className="w-[160px]">
                <SingleSelectDropdown
                  options={[
                    { value: 'all', label: 'All Groups' },
                    ...groups.map(g => ({ value: g, label: g }))
                  ]}
                  value={filterGroup}
                  onChange={(value) => setFilterGroup(value)}
                />
              </div>
            </div>
            <button
              onClick={handleSelectAll}
              className="text-[14px] font-medium text-[#4EBEE3] hover:text-[#3DA5CA] transition-colors font-['Poppins',sans-serif]"
            >
              Select All
            </button>
          </div>

          {/* Terminal List */}
          <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
            <div className="max-h-[340px] overflow-y-auto">
              {filteredTerminals.length === 0 ? (
                <div className="p-12 text-center">
                  <Monitor size={40} className="text-gray-300 mx-auto mb-3" strokeWidth={1.5} />
                  <p className="text-[14px] text-gray-500 font-['Poppins',sans-serif]">No terminals match the current filters</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-[#F9FAFB] border-b border-gray-200 sticky top-0">
                    <tr>
                      <th className="py-4 px-5 text-left w-[50px]">
                        <input
                          type="checkbox"
                          checked={filteredTerminals.length > 0 && filteredTerminals.every(t => selectedTerminals.includes(t.id))}
                          onChange={handleSelectAll}
                          className="w-[18px] h-[18px] rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer"
                          style={{ accentColor: '#4EBEE3' }}
                        />
                      </th>
                      <th className="py-4 px-5 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] whitespace-nowrap">
                        Device ID ↑
                      </th>
                      <th className="py-4 px-5 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] whitespace-nowrap">
                        MRN
                      </th>
                      <th className="py-4 px-5 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] whitespace-nowrap">
                        Room
                      </th>
                      <th className="py-4 px-5 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] whitespace-nowrap">
                        Bed
                      </th>
                      <th className="py-4 px-5 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] whitespace-nowrap">
                        Building
                      </th>
                      <th className="py-4 px-5 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] whitespace-nowrap">
                        Floor
                      </th>
                      <th className="py-4 px-5 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] whitespace-nowrap">
                        POC
                      </th>
                      <th className="py-4 px-5 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] whitespace-nowrap">
                        Group
                      </th>
                      <th className="py-4 px-5 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] whitespace-nowrap">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredTerminals.map(terminal => (
                      <tr key={terminal.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-5">
                          <input
                            type="checkbox"
                            checked={selectedTerminals.includes(terminal.id)}
                            onChange={() => handleTerminalSelect(terminal.id)}
                            className="w-[18px] h-[18px] rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-2 focus:ring-[#4EBEE3]/20 cursor-pointer"
                            style={{ accentColor: '#4EBEE3' }}
                          />
                        </td>
                        <td className="py-4 px-5 text-[14px] text-[#16274D] font-['Poppins',sans-serif]">
                          {terminal.deviceId}
                        </td>
                        <td className="py-4 px-5 text-[14px] text-[#637381] font-['Poppins',sans-serif]">
                          {terminal.mrn}
                        </td>
                        <td className="py-4 px-5 text-[14px] text-[#637381] font-['Poppins',sans-serif]">
                          {terminal.roomNo}
                        </td>
                        <td className="py-4 px-5 text-[14px] text-[#637381] font-['Poppins',sans-serif]">
                          {terminal.bedNo}
                        </td>
                        <td className="py-4 px-5 text-[14px] text-[#637381] font-['Poppins',sans-serif]">
                          {terminal.building}
                        </td>
                        <td className="py-4 px-5 text-[14px] text-[#637381] font-['Poppins',sans-serif]">
                          {terminal.floor}
                        </td>
                        <td className="py-4 px-5 text-[14px] text-[#637381] font-['Poppins',sans-serif]">
                          {terminal.poc}
                        </td>
                        <td className="py-4 px-5 text-[14px] text-[#637381] font-['Poppins',sans-serif]">
                          {terminal.group}
                        </td>
                        <td className="py-4 px-5">
                          <div className="flex items-center">
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

          {/* Selected Count - Bottom Left */}
          <div className="mt-5">
            <p className="text-[14px] text-[#637381] font-['Poppins',sans-serif]">
              Selected: <span className="font-semibold text-[#16274D]">{selectedTerminals.length}</span> of {totalTerminals} terminals
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-7 py-5 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 text-[#16274D] rounded-lg hover:bg-gray-50 transition-colors text-[14px] font-medium font-['Poppins',sans-serif]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-[#4EBEE3] text-white rounded-lg hover:bg-[#3DA5CA] transition-all text-[14px] font-medium shadow-sm font-['Poppins',sans-serif]"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}