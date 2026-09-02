import { FlaskConical } from "lucide-react";
import { useLocale } from "../../i18n";
import { useNurseStore, nurseActions } from "../../NurseDataStore";
import { PageHeader, StatusBadge, SectionCard, VisibilityControl, Toggle, EmptyState } from "../ui";

export function LabResultsTab({ role }: { role: "nurse" | "doctor" }) {
  const { t: tr } = useLocale();
  const store = useNurseStore();
  const isNurse = role === "nurse";

  const visible = store.sectionVisibility.labs;

  const statusTone = (s: string) =>
    s === "high" ? "danger" : s === "low" ? "info" : "success";

  return (
    <div className="space-y-5 font-['Poppins',sans-serif]">
      <PageHeader
        title="Lab Results"
        subtitle="Laboratory results shared with the patient."
        badges={
          <>
            <StatusBadge tone={visible ? "info" : "neutral"}>Visible to Patient</StatusBadge>
            <StatusBadge tone="success" dot>EMR Synced</StatusBadge>
          </>
        }
      />

      {isNurse && (
        <VisibilityControl
          checked={visible}
          onChange={(v: boolean) => nurseActions.setSectionVisible("labs", v)}
          title="Show Section to Patient"
          description='Toggle visibility for "Lab Results" on the bedside screen'
        />
      )}

      <SectionCard title="Lab Results" icon={<FlaskConical size={17} />}>
        {store.labResults.length === 0 ? (
          <EmptyState
            icon={<FlaskConical size={22} />}
            title="No lab results"
            description="Laboratory results for this admission will appear here once available."
          />
        ) : (
          <div className="space-y-2.5">
            {store.labResults.map((lab) => (
              <div
                key={lab.id}
                className="flex items-center gap-3 px-3.5 py-3 rounded-[10px] border border-[#E5E7EB] bg-[#fafbfc] transition-all"
                style={{ opacity: lab.visible ? 1 : 0.55 }}
              >
                <div className="w-9 h-9 flex items-center justify-center rounded-lg shrink-0 bg-[#eaf7fc] text-[#1d7da3]">
                  <FlaskConical size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold text-[#16274D] truncate">{tr(lab.labelKey)}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[13px] font-bold text-[#16274D]">{lab.value}</span>
                    <span className="text-[11px] text-[#6B7280]">{lab.date}</span>
                  </div>
                </div>
                <StatusBadge tone={statusTone(lab.status)}>{lab.status.toUpperCase()}</StatusBadge>
                {isNurse && (
                  <div className="flex items-center gap-2 shrink-0 pl-1">
                    <span className="text-[11px] text-[#6B7280] hidden sm:inline">Visible to patient</span>
                    <Toggle
                      size="sm"
                      checked={lab.visible}
                      onChange={() => nurseActions.setLabResultVisible(lab.id, !lab.visible)}
                      label="Visible to patient"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
