import { useState } from "react";
import { LogOut, Plus, Trash2, Check, Clock, GripVertical, Pencil, Eye, X } from "lucide-react";
import { useLocale } from "../../i18n";
import { useNurseStore, nurseActions } from "../../NurseDataStore";
import {
  PageHeader, StatusBadge, SectionCard, Toggle, Button, IconButton,
  ConfirmDialog, EmptyState, CheckIcon, cx, TONE,
} from "../ui";

export function DischargePlanTab({ role }: { role: "nurse" | "doctor" }) {
  const { t: tr } = useLocale();
  const store = useNurseStore();
  const isNurse = role === "nurse";

  // Inline add form
  const [newLabel, setNewLabel] = useState("");
  const [newLabelAr, setNewLabelAr] = useState("");
  const [newMinutes, setNewMinutes] = useState("");
  const [adding, setAdding] = useState(false);

  // Inline edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editLabelAr, setEditLabelAr] = useState("");

  // Delete confirmation
  const [confirmDelete, setConfirmDelete] = useState<any | null>(null);

  // Drag reorder
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const handleAdd = () => {
    if (!newLabel.trim()) return;
    nurseActions.addDischargePlanItem({
      id: `dp-${Date.now().toString(36)}`,
      labelKey: "",
      label: newLabel.trim(),
      labelAr: newLabelAr.trim(),
      done: false,
      minutes: Number(newMinutes) || 30,
    });
    setNewLabel("");
    setNewLabelAr("");
    setNewMinutes("");
    setAdding(false);
  };

  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: any, idx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    const items = [...store.dischargePlan];
    const [moved] = items.splice(dragIdx, 1);
    items.splice(idx, 0, moved);
    nurseActions.setDischargePlan(items);
    setDragIdx(idx);
  };
  const handleDragEnd = () => setDragIdx(null);

  const startEdit = (item: any) => {
    setEditingId(item.id);
    setEditLabel(item.label || (item.labelKey ? tr(item.labelKey) : ""));
    setEditLabelAr(item.labelAr || "");
  };
  const commitEdit = (id: string) => {
    nurseActions.updateDischargePlanItem(id, { label: editLabel, labelAr: editLabelAr });
    setEditingId(null);
  };

  const visible = store.sectionVisibility.discharge;
  const items = store.dischargePlan;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Discharge Plan"
        subtitle="Steps required before the patient can be safely discharged."
        badges={
          <>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#bfe6f3] bg-[#f5fcff] px-2.5 py-1">
              <Eye size={14} className="text-[#1d7da3]" />
              <span className="text-[12px] font-semibold text-[#16274D]">Visible to Patient</span>
              {isNurse ? (
                <Toggle
                  size="sm"
                  checked={visible}
                  onChange={(v: boolean) => nurseActions.setSectionVisible("discharge", v)}
                  label="Show Discharge Plan on patient terminal"
                />
              ) : (
                <StatusBadge tone={visible ? "success" : "neutral"}>{visible ? "On" : "Off"}</StatusBadge>
              )}
            </span>
            <StatusBadge tone="success" dot>HIS Synced</StatusBadge>
          </>
        }
        actions={
          isNurse && (
            <Button variant="primary" icon={<Plus size={16} />} onClick={() => setAdding((v) => !v)}>
              Add Step
            </Button>
          )
        }
      />

      <SectionCard title="Discharge Checklist" subtitle="Ordered steps toward safe discharge" icon={<LogOut size={16} />}>
        {items.length === 0 && !adding ? (
          <EmptyState
            icon={<LogOut size={22} />}
            title={tr("discharge.emptyHeader") || "No discharge plan available"}
            description={tr("discharge.emptyDesc") || undefined}
          />
        ) : (
          <div className="divide-y divide-[#f0f2f6]">
            {items.map((item: any, idx: number) => {
              const done = !!item.done;
              const active = !!item.active;
              const editing = editingId === item.id;
              const c = done ? TONE.success : active ? TONE.info : TONE.neutral;
              const name = tr("direction") === "rtl" && item.labelAr
                ? item.labelAr
                : (item.label || (item.labelKey ? tr(item.labelKey) : ""));

              if (editing) {
                return (
                  <div key={item.id} className="py-3">
                    <div className="rounded-[10px] border border-[#d8e1ec] bg-[#f7fbfe] p-3.5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11.5px] font-semibold text-[#6B7280]">Step (English)</label>
                          <input
                            autoFocus
                            value={editLabel}
                            onChange={(e) => setEditLabel(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") commitEdit(item.id); if (e.key === "Escape") setEditingId(null); }}
                            placeholder="English Label"
                            className="mt-1 w-full h-[38px] px-3 rounded-lg border border-[#d6dae6] text-[13.5px] text-[#16274D] outline-none focus:border-[#4EBEE3] focus-visible:ring-2 focus-visible:ring-[#4EBEE3]/30"
                          />
                        </div>
                        <div>
                          <label className="text-[11.5px] font-semibold text-[#6B7280]">Step (Arabic)</label>
                          <input
                            value={editLabelAr}
                            dir="rtl"
                            onChange={(e) => setEditLabelAr(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") commitEdit(item.id); if (e.key === "Escape") setEditingId(null); }}
                            placeholder="Arabic Label"
                            className="mt-1 w-full h-[38px] px-3 rounded-lg border border-[#d6dae6] text-[13.5px] text-[#16274D] outline-none focus:border-[#4EBEE3] focus-visible:ring-2 focus-visible:ring-[#4EBEE3]/30"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2 mt-3">
                        <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>Cancel</Button>
                        <Button variant="primary" size="sm" icon={<Check size={15} />} onClick={() => commitEdit(item.id)}>Save</Button>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={item.id}
                  draggable={isNurse}
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDragEnd={handleDragEnd}
                  className={cx(
                    "flex items-center gap-3 py-3 px-1 transition-opacity",
                    dragIdx === idx && "opacity-50",
                  )}
                >
                  {isNurse && (
                    <span className="text-[#c2cad6] hover:text-[#98a2b3] cursor-grab active:cursor-grabbing shrink-0" title="Drag to reorder">
                      <GripVertical size={16} />
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => isNurse && nurseActions.toggleDischargePlanItem(item.id)}
                    disabled={!isNurse}
                    aria-label={done ? "Mark step as not done" : "Mark step as done"}
                    className={cx(
                      "w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#4EBEE3] focus-visible:ring-offset-1",
                      isNurse ? "cursor-pointer" : "cursor-default",
                    )}
                    style={{
                      background: done ? TONE.success.dot : active ? TONE.info.dot : "transparent",
                      border: done || active ? "none" : `2px solid ${TONE.neutral.border}`,
                      color: "#fff",
                    }}
                  >
                    {done && <CheckIcon />}
                    {!done && active && <span className="w-2 h-2 rounded-full bg-white" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <span
                      className="text-[14px]"
                      style={{
                        fontWeight: active ? 600 : 500,
                        color: active ? TONE.info.fg : done ? "#98a2b3" : "#16274D",
                        textDecoration: done ? "line-through" : "none",
                      }}
                    >
                      {name || "—"}
                    </span>
                  </div>

                  <StatusBadge
                    tone={done ? "success" : active ? "info" : "neutral"}
                    icon={done ? <Check size={11} /> : <Clock size={11} />}
                    className="shrink-0"
                  >
                    {item.timeKey ? tr(item.timeKey) : `${item.minutes || 30} min`}
                  </StatusBadge>

                  {isNurse && (
                    <div className="flex items-center gap-1 shrink-0">
                      <IconButton label="Edit step" icon={<Pencil size={15} />} onClick={() => startEdit(item)} />
                      <IconButton
                        label="Delete step"
                        icon={<Trash2 size={15} />}
                        className="text-[#b42318] hover:bg-[#fdeceb]"
                        onClick={() => setConfirmDelete(item)}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {isNurse && adding && (
          <div className="mt-3 pt-3 border-t border-[#f0f2f6]">
            <div className="rounded-[10px] border border-[#d8e1ec] bg-[#f7fbfe] p-3.5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11.5px] font-semibold text-[#6B7280]">Step (English)</label>
                  <input
                    autoFocus
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") setAdding(false); }}
                    placeholder="New step (English)…"
                    className="mt-1 w-full h-[38px] px-3 rounded-lg border border-[#d6dae6] text-[13.5px] text-[#16274D] outline-none focus:border-[#4EBEE3] focus-visible:ring-2 focus-visible:ring-[#4EBEE3]/30"
                  />
                </div>
                <div>
                  <label className="text-[11.5px] font-semibold text-[#6B7280]">Step (Arabic)</label>
                  <input
                    value={newLabelAr}
                    dir="rtl"
                    onChange={(e) => setNewLabelAr(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") setAdding(false); }}
                    placeholder="الإضافة باللغة العربية…"
                    className="mt-1 w-full h-[38px] px-3 rounded-lg border border-[#d6dae6] text-[13.5px] text-[#16274D] outline-none focus:border-[#4EBEE3] focus-visible:ring-2 focus-visible:ring-[#4EBEE3]/30"
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-end gap-4 mt-3">
                <div>
                  <label className="text-[11.5px] font-semibold text-[#6B7280] block">Duration (min)</label>
                  <input
                    type="number"
                    value={newMinutes}
                    onChange={(e) => setNewMinutes(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") setAdding(false); }}
                    placeholder="30"
                    className="mt-1 w-24 h-[38px] px-3 rounded-lg border border-[#d6dae6] text-[13.5px] text-[#16274D] outline-none focus:border-[#4EBEE3] focus-visible:ring-2 focus-visible:ring-[#4EBEE3]/30"
                  />
                </div>
                <div className="flex items-center gap-2 ml-auto pb-0.5">
                  <Button variant="ghost" size="sm" icon={<X size={15} />} onClick={() => setAdding(false)}>Cancel</Button>
                  <Button variant="primary" size="sm" icon={<Plus size={15} />} disabled={!newLabel.trim()} onClick={handleAdd}>Add Step</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </SectionCard>

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete discharge step?"
        message="This will permanently remove the step from the discharge plan."
        tone="danger"
        confirmLabel="Delete"
        onConfirm={() => {
          if (confirmDelete) nurseActions.deleteDischargePlanItem(confirmDelete.id);
          setConfirmDelete(null);
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
