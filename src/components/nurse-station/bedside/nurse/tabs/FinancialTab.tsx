import { DollarSign, Receipt } from "lucide-react";
import { useNurseStore, nurseActions } from "../../NurseDataStore";
import { PageHeader, StatusBadge, SectionCard, VisibilityControl, MetricSummary, EmptyState } from "../ui";

export function FinancialTab({ role }: { role: "nurse" | "doctor" }) {
  const store = useNurseStore();
  const isNurse = role === "nurse";

  const visible = store.sectionVisibility.financial;

  const totalAmount = store.financial.reduce((s, f) => s + f.amount, 0);
  const totalCovered = store.financial.reduce((s, f) => s + f.covered, 0);
  const patientOwes = totalAmount - totalCovered;

  const sar = (n: number) => `SAR ${n.toLocaleString()}`;

  return (
    <div className="space-y-5 font-['Poppins',sans-serif]">
      <PageHeader
        title="Financial"
        subtitle="Billing summary and charges for the current admission."
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
          onChange={(v: boolean) => nurseActions.setSectionVisible("financial", v)}
          title="Show Section to Patient"
          description='Toggle visibility for "Financial" on the bedside screen'
        />
      )}

      <MetricSummary
        cols={3}
        items={[
          { label: "Total Charges", value: sar(totalAmount) },
          { label: "Insurance Covered", value: sar(totalCovered), tone: "success" },
          { label: "Patient Responsibility", value: sar(patientOwes), tone: "danger" },
        ]}
      />

      <SectionCard title="Breakdown" icon={<DollarSign size={17} />}>
        {store.financial.length === 0 ? (
          <EmptyState
            icon={<Receipt size={22} />}
            title="No charges recorded"
            description="Billing items for this admission will appear here once posted."
          />
        ) : (
          <div className="overflow-hidden rounded-[10px] border border-[#E5E7EB]">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr className="bg-[#F9FAFB]">
                  {["Category", "Description", "Date", "Amount", "Covered", "Balance"].map((h) => (
                    <th
                      key={h}
                      className="px-3.5 py-2.5 text-left font-bold text-[#6B7280] border-b border-[#E5E7EB] whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {store.financial.map((f) => (
                  <tr key={f.id} className="border-b border-[#E5E7EB] last:border-b-0">
                    <td className="px-3.5 py-2.5 font-bold text-[#16274D]">{f.category}</td>
                    <td className="px-3.5 py-2.5 text-[#475467]">{f.description}</td>
                    <td className="px-3.5 py-2.5 text-[#6B7280]">{f.date}</td>
                    <td className="px-3.5 py-2.5 font-bold text-[#16274D] whitespace-nowrap">{sar(f.amount)}</td>
                    <td className="px-3.5 py-2.5 font-bold text-[#15803d] whitespace-nowrap">{sar(f.covered)}</td>
                    <td className="px-3.5 py-2.5 font-bold text-[#b42318] whitespace-nowrap">{sar(f.amount - f.covered)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
