import { useState } from 'react';
import { Users, Plus, Wifi, WifiOff, Trash2, Edit2, X, Info, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useCareSuite } from '../../hooks/useCareSuite';
import { careSuiteService, type Team } from '../../services/careSuiteService';
import {
  cx,
  Btn,
  Toggle,
  Badge,
  Tag,
  Note,
  Card,
  CardHead,
  Bar,
  rowCls,
  CareSuitePage,
  ListHeader,
} from './careSuiteAtoms';
import { MultiSelectDropdown } from '../UnifiedDropdown';

const blankForm = () => ({
  name: '',
  categoryIds: [] as string[],
  defaultAssignedUserId: '',
});

export default function CareSuiteTeamsPage({ onNavigate }: { onNavigate: (route: string) => void }) {
  const { categories, teams, devices, refresh } = useCareSuite();

  const [view, setView] = useState<'list' | 'manage'>('list');
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<any>(blankForm());

  const patchForm = (p: any) => setForm((f: any) => ({ ...f, ...p }));

  const openAdd = () => {
    setEditingId(null);
    setForm(blankForm());
    setModalOpen(true);
  };

  const openEdit = (team: Team) => {
    setEditingId(team.id);
    setForm({
      name: team.name,
      categoryIds: team.categoryIds,
      defaultAssignedUserId: team.defaultAssignedUserId || '',
    });
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const saveTeam = () => {
    const name = (form.name || '').trim();
    if (!name) {
      toast('Enter a team name');
      return;
    }
    if (careSuiteService.isTeamNameTaken(name, editingId || undefined)) {
      toast('A team with this name already exists');
      return;
    }
    const payload = {
      name,
      categoryIds: form.categoryIds as string[],
      defaultAssignedUserId: (form.defaultAssignedUserId || '').trim() || null,
    };
    if (editingId) {
      careSuiteService.updateTeam(editingId, payload);
    } else {
      careSuiteService.createTeam(payload);
    }
    refresh();
    setModalOpen(false);
    toast('Team saved');
  };

  const removeTeam = (team: Team) => {
    if (confirm('Remove this team? Its requests will become unassigned.')) {
      careSuiteService.removeTeam(team.id);
      refresh();
    }
  };

  const categoryNames = (ids: string[]) => {
    const names = ids
      .map((id) => categories.find((c) => c.id === id)?.nameEn)
      .filter(Boolean);
    return names.length ? names.join(', ') : '—';
  };

  const activeTeam = teams.find((t) => t.id === activeTeamId) || null;

  // ============================================================
  // VIEW: list
  // ============================================================
  function viewList() {
    return (
      <>
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#4EBEE3]/10 flex items-center justify-center text-[#4EBEE3] shrink-0 mt-1">
              <Users size={20} />
            </div>
            <div>
              <h1 className="text-[24px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">CareSuite Teams</h1>
              <p className="text-[14px] text-[#6B7280]">
                Assign response teams to hospital rooms, based on registered devices — similar to Nurse Station wards. Rooms can be shared across teams.
              </p>
            </div>
          </div>
          <Btn variant="primary" onClick={openAdd} className="shrink-0">
            <Plus size={16} /> Add team
          </Btn>
        </div>

        <Card>

        {teams.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-14 px-5">
            <div className="w-14 h-14 rounded-full bg-[#f7f8fb] flex items-center justify-center text-[#9099ab] mb-3">
              <Users size={32} />
            </div>
            <div className="font-semibold text-[#16274D]">No teams yet</div>
            <div className="text-[13px] text-[#5d6678] mt-1 max-w-[360px]">
              Create a team to give it its own CareSuite Dashboard page — teams cover one or more
              categories and get assigned to rooms from your registered devices.
            </div>
          </div>
        ) : (
          <>
            <ListHeader
              cols={[
                { label: 'ID', className: 'w-[45px] flex-shrink-0 text-left' },
                { className: 'w-[34px] flex-shrink-0' },
                { label: 'Team', className: 'flex-1' },
                { label: 'Rooms', className: 'w-[90px] flex-shrink-0' },
                { label: 'Actions', className: 'w-[72px] flex-shrink-0', align: 'right' },
              ]}
            />
            {teams.map((team, idx) => {
              const serialNum = String(idx + 1).padStart(2, '0');
              return (
                <div
                  key={team.id}
                  onClick={() => {
                    setActiveTeamId(team.id);
                    setView('manage');
                  }}
                  className={cx(rowCls, 'cursor-pointer hover:bg-[#f7f8fb] transition-colors')}
                >
                  <div className="w-[45px] flex-shrink-0 text-[13px] font-semibold text-[#9099ab] text-left">
                    {serialNum}
                  </div>
                  <div className="w-[34px] h-[34px] rounded-[8px] bg-[#eaf7fc] text-[#1d7da3] flex items-center justify-center flex-shrink-0">
                    <Users size={17} />
                  </div>
                  <div className="flex-1 min-w-0">
                  <div className="font-medium text-[#19233a] truncate">{team.name}</div>
                  <div className="text-[13px] text-[#5d6678] truncate">
                    {team.roomDeviceIds.length} room{team.roomDeviceIds.length === 1 ? '' : 's'} ·{' '}
                    {categoryNames(team.categoryIds)} · default:{' '}
                    {team.defaultAssignedUserId || 'unassigned'}
                  </div>
                </div>
                <div className="w-[90px] flex-shrink-0">
                  <Tag>
                    {team.roomDeviceIds.length} room{team.roomDeviceIds.length === 1 ? '' : 's'}
                  </Tag>
                </div>
                <div className="w-[72px] flex-shrink-0 flex items-center gap-1 justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEdit(team);
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded-[8px] text-[#5d6678] hover:bg-[#eef1f7] hover:text-[#16274D] cursor-pointer transition-colors"
                    title="Edit"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTeam(team);
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded-[8px] text-[#5d6678] hover:bg-[#fcebe9] hover:text-[#c0392b] cursor-pointer transition-colors"
                    title="Remove"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            )})}
          </>
        )}
      </Card>
      </>
    );
  }

  // ============================================================
  // VIEW: manage (room assignment for one team)
  // ============================================================
  function viewManage() {
    if (!activeTeam) return null;

    return (
      <>
        <div className="flex flex-col gap-1 mb-6">
          <button
            onClick={() => setView('list')}
            className="inline-flex items-center gap-1.5 text-[13px] text-[#5d6678] hover:text-[#16274D] cursor-pointer font-medium mb-1 self-start"
          >
            <ArrowLeft size={16} />
            Back to Teams
          </button>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#4EBEE3]/10 flex items-center justify-center text-[#4EBEE3] shrink-0">
              <Users size={20} />
            </div>
            <div>
              <h1 className="text-[24px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">{activeTeam.name}</h1>
              <p className="text-[14px] text-[#6B7280]">Assign rooms from registered devices</p>
            </div>
          </div>
        </div>

        <Card>

        {devices.length === 0 ? (
          <div className="p-5">
            <Note tone="info" icon={<Info size={16} />}>
              No devices are registered yet. Register devices in Device Manager first, then come back
              here to assign rooms.
            </Note>
          </div>
        ) : (
          <>
            <ListHeader
              cols={[
                { label: 'Assigned', className: 'w-[60px] flex-shrink-0' },
                { label: 'Room', className: 'flex-1' },
                { label: 'Shared with', className: 'flex-1' },
                { label: 'Connection', className: 'w-[90px] flex-shrink-0' },
              ]}
            />
            {devices.map((device) => {
              const assigned = activeTeam.roomDeviceIds.includes(device.deviceId);
              const otherTeams = careSuiteService
                .teamsForDevice(device.deviceId)
                .filter((t) => t.id !== activeTeam.id);
              return (
                <div key={device.id} className={rowCls}>
                  <div className="w-[60px] flex-shrink-0">
                    <Toggle
                      on={assigned}
                      onClick={() => {
                        if (assigned) {
                          careSuiteService.unassignRoom(activeTeam.id, device.deviceId);
                        } else {
                          careSuiteService.assignRoom(activeTeam.id, device.deviceId);
                        }
                        refresh();
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-[#19233a] truncate">
                      Room {device.roomNo} · Bed {device.bedNo}
                    </div>
                    <div className="text-[13px] text-[#5d6678] truncate">
                      {device.building} · Floor {device.floor}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    {otherTeams.length > 0 && (
                      <Badge tone="info">
                        Shared with {otherTeams.map((t) => t.name).join(', ')}
                      </Badge>
                    )}
                  </div>
                  <div className="w-[90px] flex-shrink-0">
                    {device.isConnected ? (
                      <Wifi size={16} className="text-[#1f9e75]" />
                    ) : (
                      <WifiOff size={16} className="text-[#9099ab]" />
                    )}
                  </div>
                </div>
              );
            })}
            <div className="p-5">
              <Note tone="info" icon={<Info size={16} />}>
                Teams may share the same room — assigning a room here does not remove it from any
                other team.
              </Note>
            </div>
          </>
        )}
      </Card>
      </>
    );
  }

  return (
    <CareSuitePage>
      {view === 'list' && viewList()}
      {view === 'manage' && viewManage()}

      {modalOpen && (
        <div
          className="fixed inset-0 bg-[#16274D]/45 flex items-center justify-center z-40 p-5"
          onClick={closeModal}
        >
          <Card className="max-w-[480px] w-full" onClick={(e) => e.stopPropagation()}>
            <CardHead
              title={editingId ? 'Edit team' : 'Add team'}
              right={
                <button
                  onClick={closeModal}
                  className="w-9 h-9 flex items-center justify-center rounded-[10px] text-[#5d6678] hover:bg-[#f7f8fb] cursor-pointer transition-colors"
                >
                  <X size={18} />
                </button>
              }
            />
            <div className="p-5">
              <div>
                <label className="block text-[13px] text-[#5d6678] mb-1.5">Team name</label>
                <input
                  className="w-full h-[38px] px-3 border border-[#d6dae6] rounded-[10px] outline-none focus:border-[#4EBEE3] transition-colors"
                  value={form.name}
                  onChange={(e) => patchForm({ name: e.target.value })}
                  placeholder="e.g. Housekeeping F4"
                />
              </div>

              <div className="mt-4">
                <label className="block text-[13px] text-[#5d6678] mb-1.5">Team categories</label>
                <MultiSelectDropdown
                  options={categories.map((c) => ({ value: c.id, label: c.nameEn }))}
                  selectedValues={form.categoryIds}
                  onChange={(vals: string[]) => patchForm({ categoryIds: vals })}
                  placeholder="Select categories"
                />
              </div>

              <div className="mt-4">
                <label className="block text-[13px] text-[#5d6678] mb-1.5">
                  Default assigned user
                </label>
                <input
                  className="w-full h-[38px] px-3 border border-[#d6dae6] rounded-[10px] outline-none focus:border-[#4EBEE3] transition-colors"
                  value={form.defaultAssignedUserId}
                  onChange={(e) => patchForm({ defaultAssignedUserId: e.target.value })}
                  placeholder="e.g. Ahmed Al-Sayed"
                />
                <div className="text-[12px] text-[#9099ab] mt-1.5">
                  Optional — a specific person's name or ID. Full Users directory integration can
                  follow later.
                </div>
              </div>
            </div>
            <Bar>
              <Btn variant="neutral" onClick={closeModal}>
                Cancel
              </Btn>
              <Btn variant="primary" onClick={saveTeam}>
                Save team
              </Btn>
            </Bar>
          </Card>
        </div>
      )}
    </CareSuitePage>
  );
}
