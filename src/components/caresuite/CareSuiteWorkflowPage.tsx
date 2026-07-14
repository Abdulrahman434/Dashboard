import { useState } from 'react';
import { Plus, ChevronUp, ChevronDown, Edit2, Trash2, X, Clock, AlarmClock, Info } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { careSuiteService, type WorkflowStep } from '../../services/careSuiteService';
import { useCareSuite } from '../../hooks/useCareSuite';
import { cx, Btn, Card, CardHead, Bar, Note, rowCls, CareSuitePage, ListHeader } from './careSuiteAtoms';

interface FormState {
  status: string;
  allowedEnabled: boolean;
  allowedMinutes: string;
  escalationEnabled: boolean;
  escalationMinutes: string;
}

const BLANK_FORM: FormState = {
  status: '',
  allowedEnabled: false,
  allowedMinutes: '',
  escalationEnabled: false,
  escalationMinutes: '',
};

export default function CareSuiteWorkflowPage({ onNavigate }: { onNavigate: (route: string) => void }) {
  const { workflow } = useCareSuite();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(BLANK_FORM);

  const openAdd = () => {
    setEditingId(null);
    setForm(BLANK_FORM);
    setModalOpen(true);
  };

  const openEdit = (step: WorkflowStep) => {
    setEditingId(step.id);
    setForm({
      status: step.status,
      allowedEnabled: step.allowedMinutes == null,
      allowedMinutes: step.allowedMinutes != null ? String(step.allowedMinutes) : '',
      escalationEnabled: step.escalationMinutes == null,
      escalationMinutes: step.escalationMinutes != null ? String(step.escalationMinutes) : '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(BLANK_FORM);
  };

  const save = () => {
    if (!form.status.trim()) {
      toast('Enter a status name');
      return;
    }
    const patch = {
      status: form.status.trim(),
      allowedMinutes: form.allowedEnabled ? null : Number(form.allowedMinutes) || 0,
      escalationMinutes: form.escalationEnabled ? null : Number(form.escalationMinutes) || 0,
    };
    if (editingId) {
      careSuiteService.updateWorkflowStep(editingId, patch);
    } else {
      careSuiteService.createWorkflowStep(patch);
    }
    closeModal();
    toast('Workflow status saved');
  };

  const removeStep = (id: string) => {
    if (confirm('Remove this status from the workflow?')) {
      careSuiteService.removeWorkflowStep(id);
    }
  };

  return (
    <CareSuitePage>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#4EBEE3]/10 flex items-center justify-center text-[#4EBEE3] shrink-0 mt-1">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-[24px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">CareSuite Workflow</h1>
            <p className="text-[14px] text-[#6B7280]">
              The statuses every request moves through, and how long each may take before it's flagged.
            </p>
          </div>
        </div>
        <Btn variant="primary" onClick={openAdd} className="shrink-0">
          <Plus size={16} />
          Add status
        </Btn>
      </div>

      <Card>

        <div className="p-5 pb-0">
          <Note tone="info" icon={<Info size={16} />}>
            Requests move through these statuses in order. Set an Allowed Period to know how long a stage should
            normally take, and an Escalation threshold for when it's overdue — both can be left blank for no limit.
          </Note>
        </div>

        {workflow.length === 0 ? (
          <div className="text-center py-[50px] px-5">
            <Clock size={32} className="mx-auto text-[#9099ab]" />
            <div className="font-semibold text-[#16274D] mt-3">No workflow steps yet</div>
            <div className="text-[#5d6678] mt-1 text-[13.5px]">
              Add the first status to start defining the request pipeline.
            </div>
          </div>
        ) : (
          <div className="mt-2">
            <ListHeader
              cols={[
                { className: 'w-6 flex-shrink-0' },
                { label: 'Status', className: 'flex-1' },
                { label: 'Allowed', className: 'w-[130px] flex-shrink-0' },
                { label: 'Escalates after', className: 'w-[150px] flex-shrink-0' },
                { label: 'Actions', className: 'w-[130px] flex-shrink-0', align: 'right' },
              ]}
            />
            {workflow.map((step, idx) => {
              const isFirst = idx === 0;
              const isLast = idx === workflow.length - 1;
              return (
                <div key={step.id} className={rowCls}>
                  <span className="w-6 h-6 rounded-full bg-[#eef1f7] text-[#16274D] flex items-center justify-center text-[12.5px] font-semibold flex-shrink-0">
                    {idx + 1}
                  </span>

                  <div className="flex-grow min-w-0">
                    <div className="font-medium text-[#19233a] truncate">{step.status}</div>
                  </div>

                  <div className="flex items-center gap-1.5 w-[130px] flex-shrink-0">
                    {step.allowedMinutes != null ? (
                      <span className="inline-flex items-center gap-1 text-[13px] text-[#5d6678]">
                        <Clock size={14} />
                        {step.allowedMinutes}m
                      </span>
                    ) : (
                      <span className="text-[13px] text-[#9099ab]">No limit</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 w-[150px] flex-shrink-0">
                    {step.escalationMinutes != null ? (
                      <span className="inline-flex items-center gap-1 text-[13px] text-[#5d6678]">
                        <AlarmClock size={14} />
                        {step.escalationMinutes}m
                      </span>
                    ) : (
                      <span className="text-[13px] text-[#9099ab]">No limit</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0 w-[130px] justify-end">
                    <button
                      type="button"
                      onClick={() => !isFirst && careSuiteService.moveWorkflowStep(step.id, -1)}
                      className={cx(
                        'w-7 h-7 rounded-[7px] border border-[#d6dae6] hover:bg-[#f7f8fb] flex items-center justify-center',
                        isFirst ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
                      )}
                    >
                      <ChevronUp size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => !isLast && careSuiteService.moveWorkflowStep(step.id, 1)}
                      className={cx(
                        'w-7 h-7 rounded-[7px] border border-[#d6dae6] hover:bg-[#f7f8fb] flex items-center justify-center',
                        isLast ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
                      )}
                    >
                      <ChevronDown size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => openEdit(step)}
                      className="p-1.5 rounded-lg hover:bg-[#f7f8fb] text-[#5d6678] cursor-pointer"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeStep(step.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {modalOpen && (
        <div
          className="fixed inset-0 bg-[#16274D]/45 flex items-center justify-center z-40 p-5"
          onClick={closeModal}
        >
          <Card className="max-w-[440px] w-full" >
            <div onClick={(e) => e.stopPropagation()}>
              <CardHead
                title={editingId ? 'Edit status' : 'Add status'}
                right={
                  <button
                    type="button"
                    onClick={closeModal}
                    className="p-1.5 rounded-lg hover:bg-[#f7f8fb] text-[#5d6678] cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                }
              />

              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-[13px] text-[#5d6678] mb-1.5">Status name</label>
                  <input
                    type="text"
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                    placeholder="e.g. In Progress"
                    className="w-full h-[38px] px-3 border border-[#d6dae6] rounded-[10px] outline-none focus:border-[#4EBEE3] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[13px] text-[#5d6678] mb-1.5">Allowed period (minutes)</label>
                  <div className="flex items-center gap-2.5">
                    <input
                      type="number"
                      min={0}
                      disabled={form.allowedEnabled}
                      value={form.allowedMinutes}
                      onChange={(e) => setForm((f) => ({ ...f, allowedMinutes: e.target.value }))}
                      placeholder="e.g. 30"
                      className="flex-grow h-[38px] px-3 border border-[#d6dae6] rounded-[10px] outline-none focus:border-[#4EBEE3] transition-colors disabled:opacity-50 disabled:bg-[#f7f8fb]"
                    />
                    <label className="inline-flex items-center gap-1.5 text-[13px] text-[#5d6678] cursor-pointer select-none flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={form.allowedEnabled}
                        onChange={(e) => setForm((f) => ({ ...f, allowedEnabled: e.target.checked }))}
                        className="cursor-pointer"
                      />
                      No limit
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] text-[#5d6678] mb-1.5">Escalation after (minutes)</label>
                  <div className="flex items-center gap-2.5">
                    <input
                      type="number"
                      min={0}
                      disabled={form.escalationEnabled}
                      value={form.escalationMinutes}
                      onChange={(e) => setForm((f) => ({ ...f, escalationMinutes: e.target.value }))}
                      placeholder="e.g. 60"
                      className="flex-grow h-[38px] px-3 border border-[#d6dae6] rounded-[10px] outline-none focus:border-[#4EBEE3] transition-colors disabled:opacity-50 disabled:bg-[#f7f8fb]"
                    />
                    <label className="inline-flex items-center gap-1.5 text-[13px] text-[#5d6678] cursor-pointer select-none flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={form.escalationEnabled}
                        onChange={(e) => setForm((f) => ({ ...f, escalationEnabled: e.target.checked }))}
                        className="cursor-pointer"
                      />
                      No limit
                    </label>
                  </div>
                </div>
              </div>

              <Bar>
                <Btn variant="neutral" onClick={closeModal}>
                  Cancel
                </Btn>
                <Btn variant="primary" onClick={save}>
                  Save status
                </Btn>
              </Bar>
            </div>
          </Card>
        </div>
      )}
    </CareSuitePage>
  );
}
