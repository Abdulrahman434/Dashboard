import React, { useState } from 'react';
import { BookOpen, Plus, Edit2, Trash2, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useEducation } from '../hooks/useEducation';
import { educationService, type EducationMaterial, type ContentType, type EducationScope } from '../services/educationService';

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
/* Type icon helper                                            */
/* ─────────────────────────────────────────────────────────── */
function typeIcon(type: ContentType): string {
  if (type === 'PDF') return '📄';
  if (type === 'Video') return '▶';
  return '🔗';
}

/* ─────────────────────────────────────────────────────────── */
/* Content Type Badge                                          */
/* ─────────────────────────────────────────────────────────── */
function ContentTypeBadge({ type }: { type: ContentType }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[12px] font-medium font-['Poppins',sans-serif] bg-gray-100 text-gray-700"
    >
      {typeIcon(type)} {type}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* Scope Badge                                                 */
/* ─────────────────────────────────────────────────────────── */
function ScopeBadge({ scope }: { scope: EducationScope }) {
  if (scope === 'General') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium font-['Poppins',sans-serif] bg-[#F0F9FF] text-[#0369A1]">
        General
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium font-['Poppins',sans-serif] bg-gray-100 text-gray-600">
      Specific
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
/* Content label / placeholder helpers                         */
/* ─────────────────────────────────────────────────────────── */
function contentLabelEn(type: ContentType): string {
  if (type === 'PDF') return 'English PDF Link';
  if (type === 'Video') return 'English Video Link';
  return 'English URL';
}
function contentLabelAr(type: ContentType): string {
  if (type === 'PDF') return 'Arabic PDF Link (optional)';
  if (type === 'Video') return 'Arabic Video Link (optional)';
  return 'Arabic URL (optional)';
}
function contentPlaceholderEn(type: ContentType): string {
  if (type === 'PDF') return 'https://…/document-en.pdf';
  if (type === 'Video') return 'https://…/video-en.mp4 or YouTube URL';
  return 'https://…';
}
function contentPlaceholderAr(type: ContentType): string {
  if (type === 'PDF') return 'https://…/document-ar.pdf';
  if (type === 'Video') return 'https://…/video-ar.mp4 or YouTube URL';
  return 'https://…';
}

/* ─────────────────────────────────────────────────────────── */
/* Pill selector helper                                        */
/* ─────────────────────────────────────────────────────────── */
function PillButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-all font-['Poppins',sans-serif]"
      style={{
        backgroundColor: active ? '#E0F7FD' : '#F3F4F6',
        color: active ? '#4EBEE3' : '#6B7280',
        border: `1.5px solid ${active ? '#4EBEE3' : 'transparent'}`,
      }}
    >
      {label}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* Education Material add / edit modal                         */
/* ─────────────────────────────────────────────────────────── */
function EducationFormModal({
  editing,
  onClose,
}: {
  editing: EducationMaterial | null;
  onClose: () => void;
}) {
  const [nameEn, setNameEn] = useState(editing?.nameEn ?? '');
  const [nameAr, setNameAr] = useState(editing?.nameAr ?? '');
  const [contentType, setContentType] = useState<ContentType>(editing?.contentType ?? 'PDF');
  const [contentEn, setContentEn] = useState(editing?.contentEn ?? '');
  const [contentAr, setContentAr] = useState(editing?.contentAr ?? '');
  const [scope, setScope] = useState<EducationScope>(editing?.scope ?? 'General');
  const [error, setError] = useState('');

  const handleSave = () => {
    const trimmedEn = nameEn.trim();
    const trimmedAr = nameAr.trim();
    const trimmedContentEn = contentEn.trim();

    if (!trimmedEn) {
      setError('English name is required');
      return;
    }
    if (!trimmedAr) {
      setError('Arabic name is required');
      return;
    }
    if (!trimmedContentEn) {
      setError(`${contentLabelEn(contentType)} is required`);
      return;
    }
    if (educationService.isNameTaken(trimmedEn, editing?.id)) {
      setError('A material with this English name already exists');
      return;
    }

    if (editing) {
      educationService.update(editing.id, {
        nameEn: trimmedEn,
        nameAr: trimmedAr,
        contentType,
        contentEn: trimmedContentEn,
        contentAr: contentAr.trim(),
        scope,
      });
      toast.success('Material updated', { description: trimmedEn, duration: 2000 });
    } else {
      educationService.create({
        nameEn: trimmedEn,
        nameAr: trimmedAr,
        contentType,
        contentEn: trimmedContentEn,
        contentAr: contentAr.trim(),
        scope,
      });
      toast.success('Material added', { description: trimmedEn, duration: 2000 });
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-[#4EBEE3] rounded-lg p-2">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-[18px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
              {editing ? 'Edit Material' : 'Add Education Material'}
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
        <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
          {/* 1. English Name */}
          <Field label="English Name" required>
            <input
              type="text"
              value={nameEn}
              onChange={(e) => { setNameEn(e.target.value); setError(''); }}
              placeholder="e.g., Hand Hygiene Guide"
              className={inputClass}
              autoFocus
            />
          </Field>

          {/* 2. Arabic Name */}
          <Field label="Arabic Name" required>
            <input
              type="text"
              value={nameAr}
              onChange={(e) => { setNameAr(e.target.value); setError(''); }}
              placeholder="مثال: دليل نظافة اليدين"
              className={inputClass}
              style={{ direction: 'rtl', textAlign: 'right' }}
            />
          </Field>

          {/* 3. Content Type */}
          <Field label="Content Type" required>
            <div className="flex items-center gap-2 mt-1">
              {(['PDF', 'Video', 'URL'] as ContentType[]).map((ct) => (
                <PillButton
                  key={ct}
                  label={`${typeIcon(ct)} ${ct}`}
                  active={contentType === ct}
                  onClick={() => { setContentType(ct); setError(''); }}
                />
              ))}
            </div>
          </Field>

          {/* 4. English Content */}
          <Field label={contentLabelEn(contentType)} required>
            <input
              type="url"
              value={contentEn}
              onChange={(e) => { setContentEn(e.target.value); setError(''); }}
              placeholder={contentPlaceholderEn(contentType)}
              className={inputClass}
            />
          </Field>

          {/* 5. Arabic Content */}
          <Field label={contentLabelAr(contentType)}>
            <input
              type="url"
              value={contentAr}
              onChange={(e) => setContentAr(e.target.value)}
              placeholder={contentPlaceholderAr(contentType)}
              className={inputClass}
              style={{ direction: 'rtl', textAlign: 'right' }}
            />
          </Field>

          {/* 6. Scope */}
          <Field label="Scope" required>
            <div className="flex items-center gap-2 mt-1">
              <PillButton
                label="General"
                active={scope === 'General'}
                onClick={() => setScope('General')}
              />
              <PillButton
                label="Specific"
                active={scope === 'Specific'}
                onClick={() => setScope('Specific')}
              />
            </div>
            <p className="mt-2 text-[12px] text-[#6B7280] font-['Poppins',sans-serif]">
              {scope === 'General'
                ? 'Automatically shown to all patients (nurse can hide per patient)'
                : 'Nurse manually assigns to individual patients'}
            </p>
          </Field>

          {error && (
            <p className="text-[13px] text-red-600 font-['Poppins',sans-serif]">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[14px] text-[#64748B] hover:text-[#16274D] font-['Poppins',sans-serif] font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!nameEn.trim() || !nameAr.trim() || !contentEn.trim()}
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
export default function EducationMaterialsPage() {
  const { materials } = useEducation();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<EducationMaterial | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EducationMaterial | null>(null);

  const openAdd = () => {
    setEditingMaterial(null);
    setIsFormOpen(true);
  };

  const openEdit = (m: EducationMaterial) => {
    setEditingMaterial(m);
    setIsFormOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    educationService.remove(deleteTarget.id);
    toast.success('Material removed', { description: deleteTarget.nameEn, duration: 2000 });
    setDeleteTarget(null);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#4EBEE3]/10 shrink-0">
          <BookOpen size={20} className="text-[#4EBEE3]" strokeWidth={2} />
        </div>
        <div className="flex-1">
          <h1 className="text-[24px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">
            Education Materials
          </h1>
          <p className="text-[14px] text-[#6B7280] font-['Poppins',sans-serif]">
            Manage patient education resources — PDFs, videos, and links
          </p>
        </div>
        {materials.length > 0 && (
          <button
            onClick={openAdd}
            className={`px-4 py-2.5 ${PRIMARY} rounded-lg transition-colors flex items-center gap-2 font-['Poppins',sans-serif] text-[14px] font-medium`}
          >
            <Plus size={18} strokeWidth={2} />
            Add Material
          </button>
        )}
      </div>

      {/* Empty state */}
      {materials.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#4EBEE3]/30 shadow-sm p-12 flex flex-col items-center justify-center">
          <div className="bg-[#4EBEE3]/10 rounded-full p-6 mb-4">
            <BookOpen className="w-12 h-12 text-[#4EBEE3]" />
          </div>
          <h3 className="text-[18px] font-semibold text-[#16274D] font-['Poppins',sans-serif] mb-2">
            No education materials yet
          </h3>
          <p className="text-[14px] text-[#64748B] font-['Poppins',sans-serif] mb-6 text-center max-w-md">
            Add PDFs, videos, and links to share educational content with patients at the bedside.
          </p>
          <button
            onClick={openAdd}
            className={`${PRIMARY} px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-['Poppins',sans-serif]`}
          >
            <Plus className="w-4 h-4" />
            Add Material
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
                    English Name
                  </th>
                  <th className="px-6 py-3 text-right text-[13px] font-medium text-gray-600 font-['Poppins',sans-serif]">
                    Arabic Name
                  </th>
                  <th className="px-6 py-3 text-left text-[13px] font-medium text-gray-600 font-['Poppins',sans-serif]">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-[13px] font-medium text-gray-600 font-['Poppins',sans-serif]">
                    Scope
                  </th>
                  <th className="px-6 py-3 text-left text-[13px] font-medium text-gray-600 font-['Poppins',sans-serif] w-32">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {materials.map((m) => (
                  <tr
                    key={m.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="text-[14px] text-[#0f1729] font-['Poppins',sans-serif] font-medium">
                        {m.nameEn}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className="text-[14px] text-[#0f1729] font-['Poppins',sans-serif] font-medium"
                        style={{ direction: 'rtl', display: 'inline-block' }}
                      >
                        {m.nameAr}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <ContentTypeBadge type={m.contentType} />
                    </td>
                    <td className="px-6 py-4">
                      <ScopeBadge scope={m.scope} />
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
        <EducationFormModal editing={editingMaterial} onClose={() => setIsFormOpen(false)} />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Remove Education Material"
          message={`Are you sure you want to remove "${deleteTarget.nameEn}" from the education materials?`}
          confirmLabel="Remove"
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
