import React, { useState } from 'react';
import { Users2, Plus, Edit2, Trash2, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useStaff } from '../hooks/useStaff';
import { staffService, type StaffMember } from '../services/staffService';

const PRIMARY = 'bg-[#4EBEE3] hover:bg-[#3DA5CA] text-white';

const inputClass =
  "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4EBEE3] focus:border-transparent font-['Poppins',sans-serif] text-[14px]";

/* ─────────────────────────────────────────────────────────── */
/* Shared Field wrapper                                        */
/* ─────────────────────────────────────────────────────────── */
function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-[#16274D] font-['Poppins',sans-serif] mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* Avatar — initials fallback                                  */
/* ─────────────────────────────────────────────────────────── */
function Avatar({
  name,
  image,
  type,
  size = 40,
}: {
  name: string;
  image: string;
  type: 'Doctor' | 'Nurse';
  size?: number;
}) {
  const bg = type === 'Doctor' ? '#8B5CF6' : '#4EBEE3';
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  return (
    <div
      style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}
    >
      {image ? (
        <img src={image} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: bg,
            color: 'white',
            fontWeight: 700,
            fontSize: size * 0.4,
            fontFamily: "'Poppins', sans-serif",
          }}
        >
          {initial}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* Type badge                                                  */
/* ─────────────────────────────────────────────────────────── */
function TypeBadge({ type }: { type: 'Doctor' | 'Nurse' }) {
  const isDoctor = type === 'Doctor';
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium font-['Poppins',sans-serif]"
      style={{
        backgroundColor: isDoctor ? '#EDE9FE' : '#E0F7FD',
        color: isDoctor ? '#8B5CF6' : '#4EBEE3',
      }}
    >
      {type}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* Confirm delete dialog                                       */
/* ─────────────────────────────────────────────────────────── */
function ConfirmDialog({
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 bg-black/50 z-[110] flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-[18px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
            {title}
          </h2>
        </div>
        <div className="px-6 py-5">
          <p className="text-[14px] text-[#16274D] font-['Poppins',sans-serif]">{message}</p>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border-2 border-gray-300 text-[#16274D] rounded-lg hover:bg-gray-50 transition-colors font-['Poppins',sans-serif] text-[14px] font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-['Poppins',sans-serif] text-[14px] font-medium"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* Staff add / edit modal                                      */
/* ─────────────────────────────────────────────────────────── */
function StaffFormModal({
  editing,
  onClose,
}: {
  editing: StaffMember | null;
  onClose: () => void;
}) {
  const [name, setName] = useState(editing?.name ?? '');
  const [department, setDepartment] = useState(editing?.department ?? '');
  const [type, setType] = useState<'Doctor' | 'Nurse'>(editing?.type ?? 'Nurse');
  const [image, setImage] = useState(editing?.image ?? '');
  const [error, setError] = useState('');

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Name is required');
      return;
    }
    if (staffService.isNameTaken(trimmed, editing?.id)) {
      setError('A staff member with this name already exists');
      return;
    }
    if (editing) {
      staffService.update(editing.id, { name: trimmed, department, type, image });
      toast.success('Staff member updated', { description: trimmed, duration: 2000 });
    } else {
      staffService.create({ name: trimmed, department, type, image });
      toast.success('Staff member added', { description: trimmed, duration: 2000 });
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-[#4EBEE3] rounded-lg p-2">
              <Users2 className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-[18px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
              {editing ? 'Edit Staff Member' : 'Add Staff Member'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <Field label="Name" required>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              placeholder="e.g., Dr. Sarah Al-Amri"
              className={inputClass}
              autoFocus
            />
          </Field>

          <Field label="Department">
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g., Cardiology"
              className={inputClass}
            />
          </Field>

          <Field label="Type" required>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'Doctor' | 'Nurse')}
              className={inputClass}
            >
              <option value="Nurse">Nurse</option>
              <option value="Doctor">Doctor</option>
            </select>
          </Field>

          <Field label="Image URL (optional)">
            <div className="flex items-center gap-3">
              {/* Live avatar preview */}
              <Avatar name={name || '?'} image={image} type={type} size={40} />
              <input
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className={inputClass}
              />
            </div>
          </Field>

          {error && (
            <p className="text-[13px] text-red-600 font-['Poppins',sans-serif]">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[14px] text-[#64748B] hover:text-[#16274D] font-['Poppins',sans-serif] font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className={`${PRIMARY} px-6 py-2 rounded-lg font-['Poppins',sans-serif] text-[14px] font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed`}
          >
            {editing ? 'Update' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* Main page                                                   */
/* ─────────────────────────────────────────────────────────── */
export default function StaffListPage() {
  const { staff } = useStaff();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<StaffMember | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StaffMember | null>(null);

  const openAdd = () => {
    setEditingMember(null);
    setIsFormOpen(true);
  };

  const openEdit = (m: StaffMember) => {
    setEditingMember(m);
    setIsFormOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    staffService.remove(deleteTarget.id);
    toast.success('Staff member removed', { description: deleteTarget.name, duration: 2000 });
    setDeleteTarget(null);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#4EBEE3]/10 shrink-0">
          <Users2 size={20} className="text-[#4EBEE3]" strokeWidth={2} />
        </div>
        <div className="flex-1">
          <h1 className="text-[24px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
            Staff List
          </h1>
          <p className="text-[14px] text-[#6B7280] font-['Poppins',sans-serif]">
            Manage hospital staff — nurses and doctors
          </p>
        </div>
        {staff.length > 0 && (
          <button
            onClick={openAdd}
            className={`px-4 py-2.5 ${PRIMARY} rounded-lg transition-colors flex items-center gap-2 font-['Poppins',sans-serif] text-[14px] font-medium`}
          >
            <Plus size={18} strokeWidth={2} />
            Add Staff Member
          </button>
        )}
      </div>

      {/* Empty state */}
      {staff.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#4EBEE3]/30 shadow-sm p-12 flex flex-col items-center justify-center">
          <div className="bg-[#4EBEE3]/10 rounded-full p-6 mb-4">
            <Users2 className="w-12 h-12 text-[#4EBEE3]" />
          </div>
          <h3 className="text-[18px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-2">
            No staff members yet
          </h3>
          <p className="text-[14px] text-[#64748B] font-['Poppins',sans-serif] mb-6 text-center max-w-md">
            Add nurses and doctors to the staff list so they can be assigned to patient care teams.
          </p>
          <button
            onClick={openAdd}
            className={`${PRIMARY} px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-['Poppins',sans-serif]`}
          >
            <Plus className="w-4 h-4" />
            Add Staff Member
          </button>
        </div>
      ) : (
        /* Table */
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-[13px] font-medium text-gray-600 font-['Poppins',sans-serif]">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-[13px] font-medium text-gray-600 font-['Poppins',sans-serif]">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-[13px] font-medium text-gray-600 font-['Poppins',sans-serif]">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-[13px] font-medium text-gray-600 font-['Poppins',sans-serif]">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-[13px] font-medium text-gray-600 font-['Poppins',sans-serif] w-32">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {staff.map((m) => (
                  <tr
                    key={m.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <Avatar name={m.name} image={m.image} type={m.type} size={40} />
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[14px] text-[#0f1729] font-['Poppins',sans-serif] font-medium">
                        {m.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[14px] text-[#6B7280] font-['Poppins',sans-serif]">
                        {m.department || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <TypeBadge type={m.type} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(m)}
                          className="text-[#4EBEE3] hover:text-[#3DA5CA] transition-colors p-2 rounded-lg hover:bg-[#4EBEE3]/10"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(m)}
                          className="text-red-500 hover:text-red-700 transition-colors p-2 rounded-lg hover:bg-red-50"
                          title="Delete"
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
      )}

      {/* Modals */}
      {isFormOpen && (
        <StaffFormModal editing={editingMember} onClose={() => setIsFormOpen(false)} />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Remove Staff Member"
          message={`Are you sure you want to remove "${deleteTarget.name}" from the staff list?`}
          confirmLabel="Remove"
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
