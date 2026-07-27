import { Image as ImageIcon } from "lucide-react";
import { useLocale } from "../../i18n";
import { useNurseStore, nurseActions } from "../../NurseDataStore";
import { PageHeader, StatusBadge, SectionCard, VisibilityControl, Toggle, EmptyState } from "../ui";

export function ImagingTab({ role }: { role: "nurse" | "doctor" }) {
  const { t: tr } = useLocale();
  const store = useNurseStore();
  const isNurse = role === "nurse";

  const visible = store.sectionVisibility.imaging;

  return (
    <div className="space-y-5 font-['Poppins',sans-serif]">
      <PageHeader
        title="Imaging"
        subtitle="Scans and imaging reports for this admission."
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
          onChange={(v: boolean) => nurseActions.setSectionVisible("imaging", v)}
          title="Show Section to Patient"
          description='Toggle visibility for "Imaging" on the bedside screen'
        />
      )}

      <SectionCard title="Imaging & Scans" icon={<ImageIcon size={17} />}>
        {store.imagingResults.length === 0 ? (
          <EmptyState
            icon={<ImageIcon size={22} />}
            title="No imaging results"
            description="Scans and imaging reports for this admission will appear here once available."
          />
        ) : (
          <div className="space-y-2.5">
            {store.imagingResults.map((img) => (
              <div
                key={img.id}
                className="flex items-center gap-3 px-3.5 py-3 rounded-[10px] border border-[#E5E7EB] bg-[#fafbfc] transition-all"
                style={{ opacity: img.visible ? 1 : 0.55 }}
              >
                <div className="w-9 h-9 flex items-center justify-center rounded-lg shrink-0 bg-[#eaf7fc] text-[#1d7da3]">
                  <ImageIcon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold text-[#16274D] truncate">{tr(img.labelKey)}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[12px] font-semibold text-[#1d7da3]">{img.type}</span>
                    <span className="text-[11px] text-[#6B7280]">{img.date}</span>
                  </div>
                </div>
                {isNurse && (
                  <div className="flex items-center gap-2 shrink-0 pl-1">
                    <span className="text-[11px] text-[#6B7280] hidden sm:inline">Visible to patient</span>
                    <Toggle
                      size="sm"
                      checked={img.visible}
                      onChange={() => nurseActions.setImagingResultVisible(img.id, !img.visible)}
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
