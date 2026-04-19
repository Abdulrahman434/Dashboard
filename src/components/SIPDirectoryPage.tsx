import { useState } from 'react';
import { BookOpen, Plus, Trash2, Smartphone, Search, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import InlineInput from './InlineInput';
import { SingleSelectDropdown, MultiSelectDropdown } from './UnifiedDropdown';
import { useSIPContacts, SIPContact } from '../contexts/SIPContext';

interface Terminal {
  id: string;
  deviceId: string;
  room: string;
  bed: string;
  building: string;
  floor: string;
  poc: string;
  group: string;
  ipAddress: string;
  isAssigned: boolean;
}

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (contact: Omit<SIPContact, 'id'>) => void;
  editContact?: SIPContact | null;
  onUpdate?: (contact: SIPContact) => void;
}

function AddContactModal({ isOpen, onClose, onAdd, editContact, onUpdate }: AddContactModalProps) {
  const [nameEN, setNameEN] = useState(editContact?.nameEN || '');
  const [nameAR, setNameAR] = useState(editContact?.nameAR || '');
  const [extension, setExtension] = useState(editContact?.extension || '');
  const [isActive, setIsActive] = useState(editContact?.isActive ?? true);
  const [isEmergency, setIsEmergency] = useState(editContact?.isEmergency ?? false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nameEN.trim() || !extension.trim()) {
      toast.error('Name (EN) and Extension are required');
      return;
    }

    if (editContact && onUpdate) {
      onUpdate({
        ...editContact,
        nameEN: nameEN.trim(),
        nameAR: nameAR.trim(),
        extension: extension.trim(),
        isActive,
        isEmergency
      });
    } else {
      onAdd({
        nameEN: nameEN.trim(),
        nameAR: nameAR.trim(),
        extension: extension.trim(),
        isActive,
        isEmergency
      });
    }

    handleCancel();
  };

  const handleCancel = () => {
    setNameEN('');
    setNameAR('');
    setExtension('');
    setIsActive(true);
    setIsEmergency(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
        <h3 className="text-[19px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-6">
          {editContact ? 'Edit Contact' : 'Add New Contact'}
        </h3>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mb-6">
            {/* Name (EN) */}
            <div>
              <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
                Name (EN) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nameEN}
                onChange={(e) => setNameEN(e.target.value)}
                placeholder="e.g., Emergency Room"
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-[#4EBEE3] focus:outline-none text-[14px] text-[#16274D] font-['Poppins',sans-serif] transition-colors"
              />
            </div>

            {/* Name (AR) */}
            <div>
              <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
                Name (AR)
              </label>
              <input
                type="text"
                value={nameAR}
                onChange={(e) => setNameAR(e.target.value)}
                placeholder="e.g., غرفة الطوارئ"
                dir="rtl"
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-[#4EBEE3] focus:outline-none text-[14px] text-[#16274D] font-['Poppins',sans-serif] transition-colors"
              />
            </div>

            {/* Extension */}
            <div>
              <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-2">
                Extension <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={extension}
                onChange={(e) => setExtension(e.target.value)}
                placeholder="e.g., 9001"
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-[#4EBEE3] focus:outline-none text-[14px] text-[#16274D] font-['Poppins',sans-serif] transition-colors"
              />
            </div>

            {/* Activate Toggle */}
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif]">
                Activate
              </label>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isActive ? 'bg-[#4EBEE3]' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isActive ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 rounded-lg border-2 border-gray-200 text-[#16274D] font-['Poppins',sans-serif] text-[13px] font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white font-['Poppins',sans-serif] text-[13px] font-medium transition-colors"
            >
              {editContact ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface TerminalAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactName: string;
}

function TerminalAssignmentModal({ isOpen, onClose, contactName }: TerminalAssignmentModalProps) {
  const [terminals, setTerminals] = useState<Terminal[]>([
    { id: '1', deviceId: 'mt15gwjh896684016', room: '300A', bed: '01', building: '01', floor: '01', poc: '1A', group: 'Adults', ipAddress: '192.168.1.100', isAssigned: false },
    { id: '2', deviceId: 'mt15gwjh896684017', room: '300B', bed: '02', building: '02', floor: '02', poc: '2B', group: 'VIP', ipAddress: '192.168.1.101', isAssigned: true },
    { id: '3', deviceId: 'mt15gwjh896684018', room: '300C', bed: '03', building: '03', floor: '03', poc: '3C', group: 'Kids', ipAddress: '192.168.1.102', isAssigned: false },
    { id: '4', deviceId: 'mt15gwjh896684019', room: '300D', bed: '04', building: '01', floor: '04', poc: '4A', group: 'Adults', ipAddress: '192.168.1.103', isAssigned: false },
    { id: '5', deviceId: 'mt15gwjh896684020', room: '300E', bed: '01', building: '02', floor: '05', poc: '5B', group: 'VIP', ipAddress: '192.168.1.104', isAssigned: true },
    { id: '6', deviceId: 'mt15gwjh896684021', room: '301A', bed: '02', building: '03', floor: '01', poc: '6C', group: 'Kids', ipAddress: '192.168.1.105', isAssigned: false },
    { id: '7', deviceId: 'mt15gwjh896684022', room: '301B', bed: '03', building: '01', floor: '02', poc: '1A', group: 'Adults', ipAddress: '192.168.1.100', isAssigned: false },
    { id: '8', deviceId: 'mt15gwjh896684023', room: '301C', bed: '04', building: '02', floor: '03', poc: '2B', group: 'VIP', ipAddress: '192.168.1.106', isAssigned: false },
    { id: '9', deviceId: 'mt15gwjh896684024', room: '301D', bed: '01', building: '03', floor: '04', poc: '3C', group: 'Kids', ipAddress: '192.168.1.107', isAssigned: true },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedAssignmentStatus, setSelectedAssignmentStatus] = useState<string[]>([]);
  const [selectedTerminals, setSelectedTerminals] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  // Get unique groups
  const groups = Array.from(new Set(terminals.map(t => t.group)));
  const assignmentStatuses = ['Assigned', 'Not Assigned'];

  // Filter terminals
  const filteredTerminals = terminals.filter(terminal => {
    const matchesSearch = 
      terminal.deviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      terminal.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
      terminal.bed.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGroup = selectedGroups.length === 0 || selectedGroups.includes(terminal.group);
    
    const matchesAssignment = selectedAssignmentStatus.length === 0 || 
      (selectedAssignmentStatus.includes('Assigned') && terminal.isAssigned) ||
      (selectedAssignmentStatus.includes('Not Assigned') && !terminal.isAssigned);
    
    return matchesSearch && matchesGroup && matchesAssignment;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTerminals(new Set(filteredTerminals.map(t => t.id)));
    } else {
      setSelectedTerminals(new Set());
    }
  };

  const handleSelectTerminal = (terminalId: string, checked: boolean) => {
    const newSelected = new Set(selectedTerminals);
    if (checked) {
      newSelected.add(terminalId);
    } else {
      newSelected.delete(terminalId);
    }
    setSelectedTerminals(newSelected);
  };

  const handleBulkAssign = () => {
    if (selectedTerminals.size === 0) {
      toast.error('No terminals selected');
      return;
    }

    setTerminals(terminals.map(terminal => 
      selectedTerminals.has(terminal.id) 
        ? { ...terminal, isAssigned: true }
        : terminal
    ));

    toast.success('Terminals Assigned', {
      description: `${selectedTerminals.size} terminal(s) assigned to ${contactName}`,
      duration: 2000,
    });

    setSelectedTerminals(new Set());
  };

  const handleBulkRemove = () => {
    if (selectedTerminals.size === 0) {
      toast.error('No terminals selected');
      return;
    }

    setTerminals(terminals.map(terminal => 
      selectedTerminals.has(terminal.id) 
        ? { ...terminal, isAssigned: false }
        : terminal
    ));

    toast.success('Terminals Removed', {
      description: `${selectedTerminals.size} terminal(s) removed from ${contactName}`,
      duration: 2000,
    });

    setSelectedTerminals(new Set());
  };

  const handleToggleAssignment = (terminalId: string) => {
    setTerminals(terminals.map(terminal => 
      terminal.id === terminalId 
        ? { ...terminal, isAssigned: !terminal.isAssigned }
        : terminal
    ));

    const terminal = terminals.find(t => t.id === terminalId);
    if (terminal) {
      toast.success(terminal.isAssigned ? 'Assignment Removed' : 'Terminal Assigned', {
        description: terminal.isAssigned 
          ? `Removed ${contactName} from ${terminal.deviceId}`
          : `Assigned ${contactName} to ${terminal.deviceId}`,
        duration: 2000,
      });
    }
  };

  const allSelected = filteredTerminals.length > 0 && filteredTerminals.every(t => selectedTerminals.has(t.id));
  const someSelected = filteredTerminals.some(t => selectedTerminals.has(t.id)) && !allSelected;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl mx-4 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[19px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
              Set Emergency Extension to Terminals
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-[13px] text-[#6B7280] font-['Poppins',sans-serif]">
            Assign <span className="font-semibold text-[#16274D]">{contactName}</span> as emergency extension to CareInn15 terminals
          </p>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by Device ID, Room, or Bed..."
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-[#4EBEE3] focus:outline-none text-[14px] text-[#16274D] font-['Poppins',sans-serif] transition-colors"
                />
              </div>
            </div>

            {/* Group Filter */}
            <div className="w-56">
              <MultiSelectDropdown
                selectedValues={selectedGroups}
                onChange={setSelectedGroups}
                options={groups}
                placeholder="Filter by Group"
              />
            </div>

            {/* Assignment Status Filter */}
            <div className="w-56">
              <MultiSelectDropdown
                selectedValues={selectedAssignmentStatus}
                onChange={setSelectedAssignmentStatus}
                options={assignmentStatuses}
                placeholder="Filter by Assignment Status"
              />
            </div>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedTerminals.size > 0 && (
          <div className="px-6 py-3 bg-[#4EBEE3]/10 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-[#16274D] font-['Poppins',sans-serif] font-medium">
                {selectedTerminals.size} terminal(s) selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleBulkAssign}
                  className="px-4 py-2 rounded-lg bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white font-['Poppins',sans-serif] text-[13px] font-medium transition-colors"
                >
                  Assign Selected
                </button>
                <button
                  onClick={handleBulkRemove}
                  className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-['Poppins',sans-serif] text-[13px] font-medium transition-colors"
                >
                  Remove Selected
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={input => {
                      if (input) input.indeterminate = someSelected;
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-[#4EBEE3] focus:ring-offset-0 cursor-pointer accent-[#4EBEE3]"
                  />
                </th>
                <th className="px-6 py-4 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] whitespace-nowrap">
                  Device ID
                </th>
                <th className="px-6 py-4 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] whitespace-nowrap">
                  IP Address
                </th>
                <th className="px-6 py-4 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] whitespace-nowrap">
                  Room No
                </th>
                <th className="px-6 py-4 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] whitespace-nowrap">
                  Bed No
                </th>
                <th className="px-6 py-4 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] whitespace-nowrap">
                  Building
                </th>
                <th className="px-6 py-4 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] whitespace-nowrap">
                  Floor
                </th>
                <th className="px-6 py-4 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] whitespace-nowrap">
                  POC
                </th>
                <th className="px-6 py-4 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] whitespace-nowrap">
                  Group
                </th>
                <th className="px-6 py-4 text-center text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTerminals.map((terminal) => (
                <tr key={terminal.id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedTerminals.has(terminal.id)}
                      onChange={(e) => handleSelectTerminal(terminal.id, e.target.checked)}
                      className="w-4 h-4 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-[#4EBEE3] focus:ring-offset-0 cursor-pointer accent-[#4EBEE3]"
                    />
                  </td>
                  <td className="px-6 py-4 text-[14px] text-[#4EBEE3] font-['Poppins',sans-serif] font-medium">
                    {terminal.deviceId}
                  </td>
                  <td className="px-6 py-4 text-[14px] text-[#16274D] font-['Poppins',sans-serif]">
                    {terminal.ipAddress}
                  </td>
                  <td className="px-6 py-4 text-[14px] text-[#16274D] font-['Poppins',sans-serif]">
                    {terminal.room}
                  </td>
                  <td className="px-6 py-4 text-[14px] text-[#16274D] font-['Poppins',sans-serif]">
                    {terminal.bed}
                  </td>
                  <td className="px-6 py-4 text-[14px] text-[#16274D] font-['Poppins',sans-serif]">
                    {terminal.building}
                  </td>
                  <td className="px-6 py-4 text-[14px] text-[#16274D] font-['Poppins',sans-serif]">
                    {terminal.floor}
                  </td>
                  <td className="px-6 py-4 text-[14px] text-[#16274D] font-['Poppins',sans-serif]">
                    {terminal.poc}
                  </td>
                  <td className="px-6 py-4 text-[14px] text-[#16274D] font-['Poppins',sans-serif]">
                    {terminal.group}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {terminal.isAssigned ? (
                      <button
                        onClick={() => handleToggleAssignment(terminal.id)}
                        className="px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-['Poppins',sans-serif] text-[12px] font-medium transition-colors"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        onClick={() => handleToggleAssignment(terminal.id)}
                        className="px-3 py-1.5 rounded-lg bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white font-['Poppins',sans-serif] text-[12px] font-medium transition-colors"
                      >
                        Assign
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-[13px] text-[#6B7280] font-['Poppins',sans-serif]">
              {selectedTerminals.size > 0 && (
                <span>{selectedTerminals.size} terminal(s) selected</span>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg border-2 border-gray-200 text-[#16274D] font-['Poppins',sans-serif] text-[13px] font-medium hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              {selectedTerminals.size > 0 && (
                <button
                  onClick={handleBulkAssign}
                  className="px-4 py-2 rounded-lg bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white font-['Poppins',sans-serif] text-[13px] font-medium transition-colors"
                >
                  Assign Selected ({selectedTerminals.size})
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  contactNames: string[];
}

function DeleteConfirmModal({ isOpen, onClose, onConfirm, contactNames }: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
        <h3 className="text-[19px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-3">
          Delete Contact{contactNames.length > 1 ? 's' : ''}
        </h3>
        <p className="text-[14px] text-[#16274D]/70 font-['Poppins',sans-serif] mb-6">
          Are you sure you want to delete {contactNames.length > 1 ? `${contactNames.length} contacts` : `"${contactNames[0]}"`}? This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border-2 border-gray-200 text-[#16274D] font-['Poppins',sans-serif] text-[13px] font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-[#EF4444] hover:bg-[#DC2626] text-white font-['Poppins',sans-serif] text-[13px] font-medium transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SIPDirectoryPage() {
  const { contacts, addContact, deleteContact, updateContact } = useSIPContacts();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    contactIds: string[];
    contactNames: string[];
  }>({
    isOpen: false,
    contactIds: [],
    contactNames: []
  });
  const [terminalAssignmentModal, setTerminalAssignmentModal] = useState<{
    isOpen: boolean;
    contactId: string | null;
    contactName: string;
  }>({
    isOpen: false,
    contactId: null,
    contactName: ''
  });

  const handleAddContact = (newContact: Omit<SIPContact, 'id'>) => {
    addContact(newContact);
    toast.success('Contact Added', {
      description: `${newContact.nameEN} has been added successfully`,
      duration: 2000,
    });
  };

  const handleDeleteContact = (contactId: string, contactName: string) => {
    setDeleteModal({
      isOpen: true,
      contactIds: [contactId],
      contactNames: [contactName]
    });
  };

  const handleBulkDelete = () => {
    if (selectedContacts.size === 0) {
      toast.error('No contacts selected');
      return;
    }

    const contactNames = contacts
      .filter(c => selectedContacts.has(c.id))
      .map(c => c.nameEN);

    setDeleteModal({
      isOpen: true,
      contactIds: Array.from(selectedContacts),
      contactNames
    });
  };

  const confirmDelete = () => {
    deleteModal.contactIds.forEach(id => deleteContact(id));
    
    toast.success('Contact(s) Deleted', {
      description: `${deleteModal.contactIds.length} contact(s) deleted successfully`,
      duration: 2000,
    });

    setSelectedContacts(new Set());
    setDeleteModal({ isOpen: false, contactIds: [], contactNames: [] });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedContacts(new Set(contacts.map(c => c.id)));
    } else {
      setSelectedContacts(new Set());
    }
  };

  const handleSelectContact = (contactId: string, checked: boolean) => {
    const newSelected = new Set(selectedContacts);
    if (checked) {
      newSelected.add(contactId);
    } else {
      newSelected.delete(contactId);
    }
    setSelectedContacts(newSelected);
  };

  const handleOpenTerminalAssignment = (contactId: string, contactName: string) => {
    setTerminalAssignmentModal({
      isOpen: true,
      contactId,
      contactName
    });
  };

  const handleUpdateField = (id: string, field: keyof SIPContact, value: string | boolean) => {
    updateContact(id, { [field]: value });
  };

  const allSelected = contacts.length > 0 && contacts.every(c => selectedContacts.has(c.id));
  const someSelected = contacts.some(c => selectedContacts.has(c.id)) && !allSelected;

  // Empty state
  if (contacts.length === 0) {
    return (
      <div className="h-full overflow-auto p-8">
        {/* Page Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-[#4EBEE3]/10 flex items-center justify-center">
            <BookOpen size={20} className="text-[#4EBEE3]" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-[24px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
              SIP Directory
            </h2>
            <p className="text-[14px] text-[#6B7280] font-['Poppins',sans-serif]">
              Manage contact directory for SIP calling system
            </p>
          </div>
        </div>

        {/* Empty State */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-[#4EBEE3]/10 flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-[#4EBEE3]" />
          </div>
          <h3 className="text-[16px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-2">
            No contacts have been added yet!
          </h3>
          <p className="text-[13px] text-[#6B7280] font-['Poppins',sans-serif] mb-6 text-center max-w-md">
            Get started by adding your first contact to the SIP directory.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg font-['Poppins',sans-serif] text-[14px] font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add New Contact
          </button>
        </div>

        {/* Add Contact Modal */}
        <AddContactModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddContact}
        />
      </div>
    );
  }

  // Table view
  return (
    <div className="h-full overflow-auto p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#4EBEE3]/10 flex items-center justify-center">
            <BookOpen size={20} className="text-[#4EBEE3]" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-[24px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
              SIP Directory
            </h2>
            <p className="text-[14px] text-[#6B7280] font-['Poppins',sans-serif]">
              Manage contact directory for SIP calling system
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          {selectedContacts.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-['Poppins',sans-serif] text-[14px] font-medium transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete ({selectedContacts.size})
            </button>
          )}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white rounded-lg font-['Poppins',sans-serif] text-[14px] font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add New Contact
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={input => {
                      if (input) input.indeterminate = someSelected;
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-[#4EBEE3] focus:ring-offset-0 cursor-pointer accent-[#4EBEE3]"
                  />
                </th>
                <th className="px-6 py-4 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] whitespace-nowrap">
                  Name (EN)
                </th>
                <th className="px-6 py-4 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] whitespace-nowrap">
                  Name (AR)
                </th>
                <th className="px-6 py-4 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] whitespace-nowrap">
                  Extension
                </th>
                <th className="px-6 py-4 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] whitespace-nowrap">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-[13px] font-semibold text-[#16274D] font-['Poppins',sans-serif] whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact.id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedContacts.has(contact.id)}
                      onChange={(e) => handleSelectContact(contact.id, e.target.checked)}
                      className="w-4 h-4 rounded border-2 border-gray-300 text-[#4EBEE3] focus:ring-[#4EBEE3] focus:ring-offset-0 cursor-pointer accent-[#4EBEE3]"
                    />
                  </td>
                  <td className="px-6 py-3">
                    <InlineInput
                      value={contact.nameEN}
                      onChange={(value) => handleUpdateField(contact.id, 'nameEN', value)}
                      placeholder="Name (EN)"
                    />
                  </td>
                  <td className="px-6 py-3">
                    <InlineInput
                      value={contact.nameAR}
                      onChange={(value) => handleUpdateField(contact.id, 'nameAR', value)}
                      placeholder="Name (AR)"
                      dir="rtl"
                    />
                  </td>
                  <td className="px-6 py-3">
                    <InlineInput
                      value={contact.extension}
                      onChange={(value) => handleUpdateField(contact.id, 'extension', value)}
                      placeholder="Extension"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleUpdateField(contact.id, 'isActive', !contact.isActive)}
                      className={`inline-flex px-3 py-1 rounded-full text-[12px] font-medium font-['Poppins',sans-serif] transition-all cursor-pointer hover:shadow-md ${
                        contact.isActive
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {contact.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenTerminalAssignment(contact.id, contact.nameEN)}
                        className="text-[#4EBEE3] hover:text-[#3DA5CA] transition-colors"
                        title="Set as Emergency Extension to Terminals"
                      >
                        <Smartphone className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteContact(contact.id, contact.nameEN)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        title="Delete Contact"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Contact Modal */}
      <AddContactModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddContact}
      />

      {/* Terminal Assignment Modal */}
      <TerminalAssignmentModal
        isOpen={terminalAssignmentModal.isOpen}
        onClose={() => setTerminalAssignmentModal({ isOpen: false, contactId: null, contactName: '' })}
        contactName={terminalAssignmentModal.contactName}
      />

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, contactIds: [], contactNames: [] })}
        onConfirm={confirmDelete}
        contactNames={deleteModal.contactNames}
      />
    </div>
  );
}