import { useState, useEffect } from "react";
import { ClipboardList, Plus, Trash2, Check, Clock, Edit2, Save, Eye, ChevronLeft, ChevronRight, AlertCircle, RefreshCw } from "lucide-react";
import { useTheme } from "../../ThemeContext";
import { useLocale } from "../../i18n";
import { useNurseStore, nurseActions, type CarePlanItem } from "../../NurseDataStore";

type CarePlanMode = "daily" | "overall";

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function shiftDay(d: Date, delta: number): Date {
  const next = new Date(d);
  next.setDate(d.getDate() + delta);
  return next;
}

const toISO = (d: Date) => d.toISOString().split("T")[0];
const fromISO = (s: string) => new Date(s);

// Parse timeStr like "14:30" or "11:00 AM" or "09:00 AM" to determine auto status
function getAutoStatus(timeStr: string, periodMinutes: number): 'unchecked' | 'in-progress' | 'done' {
  if (!timeStr) return 'unchecked';
  
  let hours = 0;
  let minutes = 0;
  
  const ampmMatch = timeStr.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
  if (ampmMatch) {
    hours = parseInt(ampmMatch[1], 10);
    minutes = parseInt(ampmMatch[2], 10);
    const ampm = ampmMatch[3].toUpperCase();
    if (ampm === "PM" && hours < 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;
  } else {
    const normalMatch = timeStr.match(/^(\d+):(\d+)$/);
    if (normalMatch) {
      hours = parseInt(normalMatch[1], 10);
      minutes = parseInt(normalMatch[2], 10);
    } else {
      return 'unchecked';
    }
  }
  
  const now = new Date();
  const scheduled = new Date(now);
  scheduled.setHours(hours, minutes, 0, 0);
  
  const end = new Date(scheduled);
  end.setMinutes(scheduled.getMinutes() + (periodMinutes || 30));
  
  if (now < scheduled) {
    return 'unchecked';
  } else if (now >= scheduled && now < end) {
    return 'in-progress';
  } else {
    return 'done';
  }
}

export function CarePlanTab({ role }: { role: "nurse" | "doctor" }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLocale();
  const store = useNurseStore();
  const isNurse = role === "nurse";

  // Form states
  const [newLabel, setNewLabel] = useState("");
  const [newLabelAr, setNewLabelAr] = useState("");
  const [newTime, setNewTime] = useState("10:00 AM");
  const [newMinutes, setNewMinutes] = useState("30");
  const [newDay, setNewDay] = useState("1");
  const [newAutoFlag, setNewAutoFlag] = useState(false);

  // Edit states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editLabelAr, setEditLabelAr] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editMinutes, setEditMinutes] = useState("");
  const [editAutoFlag, setEditAutoFlag] = useState(false);

  // Re-run status simulation every 10 seconds to keep UI live
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick(prev => prev + 1), 10000);
    return () => clearInterval(timer);
  }, []);

  const mode = store.carePlanMode;
  const selectedDate = fromISO(store.carePlanSelectedDate);

  const handleModeChange = (newMode: "daily" | "overall") => {
    nurseActions.setCarePlanMode(newMode);
  };

  const today = new Date();
  const yesterday = shiftDay(today, -1);
  const tomorrow = shiftDay(today, 1);

  let dateLabel = "";
  if (isSameDay(selectedDate, today)) dateLabel = tr("careplan.today") || "Today";
  else if (isSameDay(selectedDate, yesterday)) dateLabel = tr("careplan.yesterday") || "Yesterday";
  else if (isSameDay(selectedDate, tomorrow)) dateLabel = tr("careplan.tomorrow") || "Tomorrow";
  else dateLabel = selectedDate.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });

  const handleAdd = () => {
    if (!newLabel.trim()) return;
    nurseActions.addCarePlanItem({
      id: `cp-${Date.now().toString(36)}`,
      labelKey: "",
      label: newLabel.trim(),
      labelAr: newLabelAr.trim(),
      done: false,
      minutes: mode === "daily" ? (Number(newMinutes) || 30) : undefined,
      period: Number(newMinutes) || 30,
      time: mode === "daily" ? newTime.trim() : undefined,
      autoFlag: mode === "daily" ? newAutoFlag : false,
      day: mode === "overall" ? (Number(newDay) || 1) : undefined,
      date: mode === "daily" ? store.carePlanSelectedDate : undefined,
    });
    setNewLabel("");
    setNewLabelAr("");
    setNewTime("10:00 AM");
    setNewMinutes("30");
    setNewDay("1");
    setNewAutoFlag(false);
  };

  const handleSaveEdit = (id: string) => {
    nurseActions.updateCarePlanItem(id, {
      label: editLabel.trim(),
      labelAr: editLabelAr.trim(),
      time: mode === "daily" ? editTime.trim() : undefined,
      period: Number(editMinutes) || 30,
      minutes: Number(editMinutes) || 30,
      autoFlag: mode === "daily" ? editAutoFlag : false,
    });
    setEditingId(null);
  };

  const filteredItems = store.carePlan.filter(item => {
    if (mode === "overall") return item.day !== undefined;
    return item.date === store.carePlanSelectedDate;
  });

  // Calculate live computed statuses for auto-flagged items
  const itemsToRender = filteredItems.map(item => {
    if (item.autoFlag && item.time) {
      const autoStatus = getAutoStatus(item.time, item.period || 30);
      return {
        ...item,
        status: autoStatus,
        done: autoStatus === 'done',
        active: autoStatus === 'in-progress'
      };
    }
    return item;
  });

  const handleToggleStatus = (item: CarePlanItem) => {
    if (!isNurse) return;
    
    // If the item is on auto-flag, we turn it off so they can manually cycle
    if (item.autoFlag) {
      nurseActions.updateCarePlanItem(item.id, { autoFlag: false });
    }
    
    nurseActions.toggleCarePlanItem(item.id);
  };

  return (
    <div className="space-y-5">
      {isNurse && (
        <div className="nurse-card flex items-center justify-between" style={{ marginBottom: 0 }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: t.primarySubtle }}>
              <Eye size={18} style={{ color: t.primary }} />
            </div>
            <div>
              <span style={{ fontSize: "14px", fontWeight: 700, color: t.textHeading, display: "block" }}>Show Section to Patient</span>
              <span style={{ fontSize: "12px", color: t.textMuted }}>Toggle visibility for "Care Plan" on the bedside screen</span>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={store.sectionVisibility.carePlan}
              onChange={(e) => nurseActions.setSectionVisible("carePlan", e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"
              style={{ backgroundColor: store.sectionVisibility.carePlan ? t.primary : "#E5E7EB" }} />
          </label>
        </div>
      )}

      <div className="nurse-card">
        <div className="flex items-center justify-between mb-4">
          <h3 style={{ color: t.textHeading, margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            <ClipboardList size={18} style={{ color: t.primary }} /> {tr("care.plan.title") || "My Care Plan"}
          </h3>
          
          {/* Daily / Overall Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => handleModeChange("daily")}
              className="px-4 py-1.5 rounded-md text-[13px] font-semibold transition-all"
              style={{
                backgroundColor: mode === "daily" ? t.primary : "transparent",
                color: mode === "daily" ? "#fff" : t.textMuted,
                border: "none",
                cursor: "pointer"
              }}
            >
              {tr("careplan.toggle.daily") || "Daily"}
            </button>
            <button
              onClick={() => handleModeChange("overall")}
              className="px-4 py-1.5 rounded-md text-[13px] font-semibold transition-all"
              style={{
                backgroundColor: mode === "overall" ? t.primary : "transparent",
                color: mode === "overall" ? "#fff" : t.textMuted,
                border: "none",
                cursor: "pointer"
              }}
            >
              {tr("careplan.toggle.overall") || "Overall"}
            </button>
          </div>
        </div>

        {/* Period Row */}
        <div className="flex items-center justify-center mb-6 py-2" style={{ borderBottom: `1px solid ${t.borderDefault}` }}>
          {mode === "daily" ? (
            <div className="flex items-center gap-4">
              <button onClick={() => nurseActions.setCarePlanSelectedDate(toISO(shiftDay(selectedDate, -1)))} className="p-1 rounded-full hover:bg-gray-100 cursor-pointer" style={{ border: "none", background: "none" }}>
                <ChevronLeft size={20} style={{ color: t.textHeading }} />
              </button>
              <span style={{ fontSize: "16px", fontWeight: 700, color: t.textHeading, minWidth: "120px", textAlign: "center" }}>
                {dateLabel}
              </span>
              <button onClick={() => nurseActions.setCarePlanSelectedDate(toISO(shiftDay(selectedDate, 1)))} className="p-1 rounded-full hover:bg-gray-100 cursor-pointer" style={{ border: "none", background: "none" }}>
                <ChevronRight size={20} style={{ color: t.textHeading }} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <span style={{ fontSize: "16px", fontWeight: 700, color: t.textHeading, minWidth: "120px", textAlign: "center" }}>
                {tr("careplan.overallTitle") || "Overall Plan"}
              </span>
            </div>
          )}
        </div>

        {/* Today Card (Mocked) */}
        {mode === "daily" && (
          <div className="mb-6 p-4 rounded-xl" style={{ backgroundColor: "#F9FAFB", border: `1px solid ${t.borderDefault}` }}>
            <h4 style={{ fontSize: "14px", fontWeight: 700, color: t.textHeading, marginBottom: "12px" }}>
              {dateLabel}
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span style={{ fontSize: "12px", color: t.textMuted, display: "block", marginBottom: "4px" }}>Vitals</span>
                <p style={{ fontSize: "14px", fontWeight: 600, color: t.textHeading, margin: 0 }}>BP: 120/80, HR: 72</p>
              </div>
              <div>
                <span style={{ fontSize: "12px", color: t.textMuted, display: "block", marginBottom: "4px" }}>Notes</span>
                <p style={{ fontSize: "14px", fontWeight: 600, color: t.textHeading, margin: 0 }}>Resting comfortably.</p>
              </div>
            </div>
          </div>
        )}

        {/* Proper Table for Care Plan items */}
        <div className="overflow-x-auto border border-gray-200 rounded-xl bg-white mb-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-[13px] font-semibold text-gray-700">CarePlan Item (En)</th>
                <th className="px-4 py-3 text-[13px] font-semibold text-gray-700">CarePlan Item (Ar)</th>
                <th className="px-4 py-3 text-[13px] font-semibold text-gray-700">Time (Optional)</th>
                <th className="px-4 py-3 text-[13px] font-semibold text-gray-700">Period</th>
                <th className="px-4 py-3 text-[13px] font-semibold text-gray-700">Auto Flag</th>
                <th className="px-4 py-3 text-[13px] font-semibold text-gray-700">Status</th>
                {isNurse && <th className="px-4 py-3 text-[13px] font-semibold text-gray-700 w-24 text-center">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {itemsToRender.length === 0 ? (
                <tr>
                  <td colSpan={isNurse ? 7 : 6} className="px-4 py-8 text-center text-[14px] text-gray-400">
                    No care plan items scheduled for this period.
                  </td>
                </tr>
              ) : (
                itemsToRender.map((item) => {
                  const isEditing = editingId === item.id;
                  
                  // Calculate active status text & color
                  let itemStatus: 'unchecked' | 'in-progress' | 'done' = 'unchecked';
                  if (item.status) {
                    itemStatus = item.status;
                  } else if (item.done) {
                    itemStatus = 'done';
                  } else if (item.active) {
                    itemStatus = 'in-progress';
                  }

                  return (
                    <tr key={item.id} className="border-b border-gray-150 hover:bg-gray-50/50 transition-colors">
                      {/* English Item */}
                      <td className="px-4 py-3 text-[14px]">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editLabel}
                            onChange={(e) => setEditLabel(e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#4EBEE3]"
                          />
                        ) : (
                          <span style={{ textDecoration: item.done ? "line-through" : "none", color: item.done ? t.textMuted : t.textHeading }}>
                            {item.label || (item.labelKey ? tr(item.labelKey) : "")}
                          </span>
                        )}
                      </td>

                      {/* Arabic Item */}
                      <td className="px-4 py-3 text-[14px]" dir="rtl">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editLabelAr}
                            onChange={(e) => setEditLabelAr(e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#4EBEE3]"
                          />
                        ) : (
                          <span style={{ textDecoration: item.done ? "line-through" : "none", color: item.done ? t.textMuted : t.textHeading }}>
                            {item.labelAr || "—"}
                          </span>
                        )}
                      </td>

                      {/* Time */}
                      <td className="px-4 py-3 text-[14px]">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editTime}
                            onChange={(e) => setEditTime(e.target.value)}
                            placeholder="e.g. 10:00 AM"
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#4EBEE3]"
                          />
                        ) : (
                          <span>{item.time || "—"}</span>
                        )}
                      </td>

                      {/* Period */}
                      <td className="px-4 py-3 text-[14px]">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editMinutes}
                            onChange={(e) => setEditMinutes(e.target.value)}
                            placeholder="Min"
                            className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#4EBEE3]"
                          />
                        ) : (
                          <span>
                            {mode === "overall"
                              ? `${tr("careplan.dayLabel")} ${item.day || 1}`
                              : `${item.period || item.minutes || 30} min`
                            }
                          </span>
                        )}
                      </td>

                      {/* Auto Flag */}
                      <td className="px-4 py-3 text-[14px]">
                        {isEditing ? (
                          <input
                            type="checkbox"
                            checked={editAutoFlag}
                            onChange={(e) => setEditAutoFlag(e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-[#4EBEE3] focus:ring-[#4EBEE3]/20 cursor-pointer accent-[#4EBEE3]"
                          />
                        ) : (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                            item.autoFlag ? "bg-indigo-50 text-indigo-600 border border-indigo-100" : "bg-gray-100 text-gray-500"
                          }`}>
                            {item.autoFlag ? "Enabled" : "Off"}
                          </span>
                        )}
                      </td>

                      {/* Status Checkbox Button (3 States: unchecked -> in-progress -> done) */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleStatus(item)}
                          disabled={!isNurse}
                          className="flex items-center gap-2 text-left focus:outline-none group"
                        >
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                            itemStatus === 'done' 
                              ? "bg-green-500 border-green-500 text-white" 
                              : itemStatus === 'in-progress' 
                              ? "bg-blue-500 border-blue-500 text-white animate-pulse" 
                              : "border-gray-300 bg-white hover:border-[#4EBEE3]"
                          }`}>
                            {itemStatus === 'done' && <Check size={14} strokeWidth={3} />}
                            {itemStatus === 'in-progress' && <Clock size={12} strokeWidth={3} />}
                            {itemStatus === 'unchecked' && <div className="w-1.5 h-1.5 rounded-full bg-transparent" />}
                          </div>
                          
                          <span className={`text-[12px] font-semibold ${
                            itemStatus === 'done'
                              ? "text-green-600"
                              : itemStatus === 'in-progress'
                              ? "text-blue-600"
                              : "text-gray-500"
                          }`}>
                            {itemStatus === 'done' && "Done"}
                            {itemStatus === 'in-progress' && "In Progress"}
                            {itemStatus === 'unchecked' && "Pending"}
                          </span>
                        </button>
                      </td>

                      {/* Actions */}
                      {isNurse && (
                        <td className="px-4 py-3 text-center">
                          {isEditing ? (
                            <button
                              onClick={() => handleSaveEdit(item.id)}
                              className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors cursor-pointer"
                              title="Save"
                            >
                              <Save size={14} />
                            </button>
                          ) : (
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => {
                                  setEditingId(item.id);
                                  setEditLabel(item.label || (item.labelKey ? tr(item.labelKey) : ""));
                                  setEditLabelAr(item.labelAr || "");
                                  setEditTime(item.time || "");
                                  setEditMinutes(String(item.period || item.minutes || 30));
                                  setEditAutoFlag(!!item.autoFlag);
                                }}
                                className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                                title="Edit"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                onClick={() => nurseActions.deleteCarePlanItem(item.id)}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Add Section */}
        {isNurse && (
          <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-4">
            <h4 className="text-[14px] font-bold text-gray-700 mb-2">Create New CarePlan Task</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input 
                value={newLabel} 
                onChange={(e) => setNewLabel(e.target.value)} 
                placeholder="CarePlan item (English)..."
                className="w-full outline-none px-3 py-2 rounded-lg text-[14px] border border-gray-300 bg-white focus:border-[#4EBEE3]"
              />
              <input 
                value={newLabelAr} 
                onChange={(e) => setNewLabelAr(e.target.value)} 
                placeholder="الإضافة باللغة العربية..." 
                dir="rtl"
                className="w-full outline-none px-3 py-2 rounded-lg text-[14px] border border-gray-300 bg-white focus:border-[#4EBEE3]"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              {mode === "daily" ? (
                <>
                  <div className="flex items-center gap-2">
                    <label className="text-[12px] font-semibold text-gray-600">Time:</label>
                    <input 
                      value={newTime} 
                      onChange={(e) => setNewTime(e.target.value)} 
                      placeholder="e.g. 10:00 AM" 
                      className="w-32 px-3 py-1.5 rounded-lg text-[14px] border border-gray-300 bg-white"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-[12px] font-semibold text-gray-600">Period (Min):</label>
                    <input 
                      value={newMinutes} 
                      onChange={(e) => setNewMinutes(e.target.value)} 
                      placeholder="Min" 
                      type="number"
                      className="w-20 px-3 py-1.5 rounded-lg text-[14px] border border-gray-300 bg-white"
                    />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer py-1.5 px-3 rounded-lg border border-gray-300 bg-white hover:border-[#4EBEE3] transition-colors">
                    <input 
                      type="checkbox"
                      checked={newAutoFlag}
                      onChange={(e) => setNewAutoFlag(e.target.checked)}
                      className="w-4 h-4 rounded text-[#4EBEE3] focus:ring-[#4EBEE3]/20 cursor-pointer accent-[#4EBEE3]"
                    />
                    <span className="text-[12px] font-medium text-gray-700">Auto Trigger Status</span>
                  </label>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <label className="text-[12px] font-semibold text-gray-600">Day:</label>
                  <select 
                    value={newDay} 
                    onChange={(e) => setNewDay(e.target.value)}
                    className="outline-none appearance-none px-3 py-1.5 rounded-lg text-[14px] border border-gray-300 bg-white"
                  >
                    {[1,2,3,4,5,6,7,8,9,10,11,12,13,14].map(d => (
                      <option key={d} value={d}>{tr("careplan.dayLabel")} {d}</option>
                    ))}
                  </select>
                </div>
              )}
              
              <button 
                onClick={handleAdd} 
                className="flex items-center gap-2 px-5 py-2 rounded-lg cursor-pointer transition-all active:scale-95 ml-auto"
                style={{ backgroundColor: t.primary, color: "#fff", fontSize: "13px", fontWeight: 700, border: "none" }}
              >
                <Plus size={16} /> Add to Plan
              </button>
            </div>
          </div>
        )}

        {/* HIS Source Sync Warning/Notification */}
        <div className="mt-6 flex items-start gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-200">
          <AlertCircle size={18} className="text-gray-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-[12.5px] text-gray-600 font-medium font-['Poppins',sans-serif] leading-relaxed">
              <strong>HIS Integration Notice:</strong> All care plan items, scheduled times, periods, and execution statuses shown here are synchronized identically from the Hospital Information System (HIS).
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
