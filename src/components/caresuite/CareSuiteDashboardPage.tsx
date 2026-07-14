import { useMemo, useState, useEffect } from 'react';
import { LayoutGrid, CheckCircle2, ArrowRight, MessageSquare, UserCircle2, Search, X } from 'lucide-react';
import { careSuiteService } from '../../services/careSuiteService';
import { useCareSuite, useTick } from '../../hooks/useCareSuite';
import { userService, USER_EVENT, User } from '../../services/userService';
import type { CSRequest } from '../../services/careSuiteService';
import { cx, Btn, Badge, Card, rowCls, CareSuitePage, Metric, PriorityPill, TypeBadge, StatusPill, ElapsedBadge, Chip, ListHeader } from './careSuiteAtoms';

type PriorityFilter = 'All' | 'High' | 'Medium' | 'Low';
type KPIFilter = 'All' | 'Open' | 'HighOpen' | 'Escalated' | 'CompletedToday';

export default function CareSuiteDashboardPage({ scope, onNavigate, restrictToRoomNos }: { scope: 'admin' | string; onNavigate: (route: string) => void; restrictToRoomNos?: string[] }) {
  useTick(30000);

  const { library, workflow, teams, requests } = useCareSuite();
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('All');
  const [kpiFilter, setKpiFilter] = useState<KPIFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [teamFilter, setTeamFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All'); // 'All' | 'Today' | 'Last 7 Days'
  const [selectedRequest, setSelectedRequest] = useState<CSRequest | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'ward'>(restrictToRoomNos ? 'ward' : 'list');

  const [users, setUsers] = useState<User[]>([]);
  useEffect(() => {
    const load = () => setUsers(userService.listUsers());
    load();
    window.addEventListener(USER_EVENT, load);
    return () => window.removeEventListener(USER_EVENT, load);
  }, []);

  const team = scope !== 'admin' ? teams.find((t) => t.id === scope) : undefined;
  const title = scope === 'admin' ? 'CareSuite Dashboard — All Requests' : team ? `${team.name} — Requests` : 'Team Requests';
  const subtitle = scope === 'admin' ? 'Every request across every team' : 'Requests assigned to this team';

  const visible = useMemo(() => {
    let list = scope === 'admin' ? requests : requests.filter((r) => r.assignedTeamId === scope);
    if (restrictToRoomNos) {
      list = list.filter(r => restrictToRoomNos.includes(r.room));
    }
    return list;
  }, [requests, scope, restrictToRoomNos]);

  const isAnyFilterActive = useMemo(() => {
    return !!(searchQuery.trim() || priorityFilter !== 'All' || teamFilter !== 'All' || typeFilter !== 'All' || dateFilter !== 'All' || kpiFilter !== 'All');
  }, [searchQuery, priorityFilter, teamFilter, typeFilter, dateFilter, kpiFilter]);

  const visibleDevices = useMemo(() => {
    let devices = careSuiteService.listDevices();
    if (scope !== 'admin') {
      const currentTeam = teams.find(t => t.id === scope);
      if (!currentTeam) return [];
      const allowedDeviceIds = new Set(currentTeam.roomDeviceIds);
      devices = devices.filter(d => allowedDeviceIds.has(d.id));
    }
    if (restrictToRoomNos) {
      devices = devices.filter(d => restrictToRoomNos.includes(d.roomNo));
    }
    return devices;
  }, [teams, scope, restrictToRoomNos]);

  const terminalStatus = workflow[workflow.length - 1]?.status;

  const kpis = useMemo(() => {
    const open = visible.filter((r) => r.status !== terminalStatus);
    const highOpen = open.filter((r) => r.priority === 'High').length;
    const escalated = open.filter((r) => {
      const step = workflow.find((s) => s.status === r.status);
      if (!step || step.escalationMinutes == null) return false;
      const mins = (Date.now() - r.lastStatusChangeAt) / 60000;
      return mins >= step.escalationMinutes;
    }).length;
    const completedToday = visible.filter((r) => {
      if (r.status !== terminalStatus) return false;
      return new Date(r.lastStatusChangeAt).toDateString() === new Date().toDateString();
    }).length;
    return { open: open.length, highOpen, escalated, completedToday };
  }, [visible, workflow, terminalStatus]);

  const filtered = visible
    .filter((r) => {
      const item = library.find((l) => l.id === r.libraryItemId);
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !r.room.toLowerCase().includes(q) &&
          !item?.nameEn.toLowerCase().includes(q) &&
          !r.comment?.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      if (priorityFilter !== 'All' && r.priority !== priorityFilter) return false;
      if (teamFilter !== 'All' && r.assignedTeamId !== teamFilter) return false;
      if (typeFilter !== 'All' && item?.type !== typeFilter) return false;
      if (dateFilter === 'Today') {
        if (new Date(r.createdAt).toDateString() !== new Date().toDateString()) return false;
      } else if (dateFilter === 'Last 7 Days') {
        const diff = Date.now() - r.createdAt;
        if (diff > 7 * 24 * 60 * 60 * 1000) return false;
      }
      
      // KPI filtering
      if (kpiFilter !== 'All') {
        const isTerminal = r.status === terminalStatus;
        if (kpiFilter === 'Open' && isTerminal) return false;
        if (kpiFilter === 'HighOpen' && (isTerminal || r.priority !== 'High')) return false;
        if (kpiFilter === 'CompletedToday') {
          if (!isTerminal || new Date(r.lastStatusChangeAt).toDateString() !== new Date().toDateString()) return false;
        }
        if (kpiFilter === 'Escalated') {
          if (isTerminal) return false;
          const step = workflow.find((s) => s.status === r.status);
          if (!step || step.escalationMinutes == null) return false;
          const mins = (Date.now() - r.lastStatusChangeAt) / 60000;
          if (mins < step.escalationMinutes) return false;
        }
      }
      return true;
    })
    .slice()
    .sort((a, b) => b.createdAt - a.createdAt);

  return (
    <CareSuitePage>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#4EBEE3]/10 flex items-center justify-center">
            <LayoutGrid className="text-[#4EBEE3]" size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[24px] font-semibold text-[#16274D] font-['Poppins',sans-serif]">{title}</h1>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1f9e75] bg-[#e7f6f0] px-2 py-0.5 rounded-full select-none shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1f9e75] animate-pulse" />
                Live Data
              </span>
            </div>
            <div className="text-[14px] text-[#6B7280]">{subtitle}</div>
          </div>
        </div>
        <div className="flex bg-[#eef1f7] p-1 rounded-lg">
          <button 
            onClick={() => setViewMode('list')} 
            className={cx('px-3 py-1.5 text-xs font-semibold rounded-md transition-colors', viewMode === 'list' ? 'bg-white text-[#16274D] shadow-sm' : 'text-[#5d6678] hover:text-[#16274D]')}
          >
            List View
          </button>
          <button 
            onClick={() => setViewMode('ward')} 
            className={cx('px-3 py-1.5 text-xs font-semibold rounded-md transition-colors', viewMode === 'ward' ? 'bg-white text-[#16274D] shadow-sm' : 'text-[#5d6678] hover:text-[#16274D]')}
          >
            Ward View
          </button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3 mb-5">
        <Metric label="All Requests" value={visible.length} active={kpiFilter === 'All'} onClick={() => setKpiFilter('All')} />
        <Metric label="Open" value={kpis.open} active={kpiFilter === 'Open'} onClick={() => setKpiFilter('Open')} color="#4EBEE3" />
        <Metric label="High priority" value={kpis.highOpen} active={kpiFilter === 'HighOpen'} onClick={() => setKpiFilter('HighOpen')} color="#c0392b" />
        <Metric label="Escalated" value={kpis.escalated} active={kpiFilter === 'Escalated'} onClick={() => setKpiFilter('Escalated')} color="#b9770b" />
        <Metric label="Completed today" value={kpis.completedToday} active={kpiFilter === 'CompletedToday'} onClick={() => setKpiFilter('CompletedToday')} color="#1f9e75" />
      </div>

      <div className="flex items-center flex-wrap gap-3 mb-4">
        <div className="relative w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#d6dae6] rounded-lg text-[13px] text-[#16274D] focus:outline-none focus:border-[#4EBEE3] placeholder:text-[#9099ab]"
          />
        </div>
        
        {scope === 'admin' && (
          <select value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)} className="bg-white border border-[#d6dae6] rounded-lg px-3 py-1.5 text-[13px] text-[#16274D] focus:outline-none focus:border-[#4EBEE3]">
            <option value="All">All Teams</option>
            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        )}

        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="bg-white border border-[#d6dae6] rounded-lg px-3 py-1.5 text-[13px] text-[#16274D] focus:outline-none focus:border-[#4EBEE3]">
          <option value="All">All Types</option>
          <option value="Service Request">Service Request</option>
          <option value="Issue">Issue</option>
        </select>

        <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="bg-white border border-[#d6dae6] rounded-lg px-3 py-1.5 text-[13px] text-[#16274D] focus:outline-none focus:border-[#4EBEE3]">
          <option value="All">All Time</option>
          <option value="Today">Today</option>
          <option value="Last 7 Days">Last 7 Days</option>
        </select>

        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value as PriorityFilter)} className="bg-white border border-[#d6dae6] rounded-lg px-3 py-1.5 text-[13px] text-[#16274D] focus:outline-none focus:border-[#4EBEE3]">
          <option value="All">All Priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      {viewMode === 'list' ? (
        <Card>
          {filtered.length === 0 ? (
            <div className="text-center py-[50px] px-5 text-[#5d6678]">
              <LayoutGrid size={32} className="mx-auto text-[#9099ab]" />
              <div className="font-semibold text-[#16274D] mt-3">No requests</div>
              <div className="text-[#5d6678] mt-1">
                {scope === 'admin' ? 'No requests yet.' : 'Nothing assigned to this team yet.'}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[1060px]">
                <ListHeader
                  cols={[
                    { label: 'Room', className: 'w-[80px] flex-shrink-0' },
                    { label: 'Request', className: 'flex-1' },
                    { label: 'Type', className: 'w-[130px] flex-shrink-0' },
                    { label: 'Status', className: 'w-[120px] flex-shrink-0' },
                    { label: 'Priority', className: 'w-[90px] flex-shrink-0' },
                    { label: 'Time', className: 'w-[80px] flex-shrink-0' },
                    { label: 'Team', className: 'w-[130px] flex-shrink-0' },
                    { label: 'Person', className: 'w-[70px] flex-shrink-0' },
                    { label: 'Action', className: 'w-[140px] flex-shrink-0', align: 'right' },
                  ]}
                />
                {filtered.map((r) => {
                  const item = library.find((l) => l.id === r.libraryItemId);
                  const matchingStep = workflow.find((s) => s.status === r.status);
                  const stepIdx = matchingStep ? workflow.findIndex((s) => s.id === matchingStep.id) : -1;
                  const nextStep = stepIdx >= 0 ? workflow[stepIdx + 1] : undefined;
                  const isTerminal = matchingStep ? matchingStep.status === terminalStatus : false;
                  const reqTeam = teams.find((t) => t.id === r.assignedTeamId);

                  return (
                    <div 
                      key={r.id} 
                      className={cx(rowCls, 'text-[13.5px] cursor-pointer hover:bg-[#f7f8fb] transition-colors')}
                      onClick={() => setSelectedRequest(r)}
                    >
                      <div className="w-[80px] flex-shrink-0">
                        <span className="font-mono text-[12.5px] px-2 py-0.5 rounded-[6px] bg-[#f7f8fb] text-[#16274D]">{r.room}</span>
                      </div>

                      <div className="flex-1 min-w-0 flex items-center gap-1.5">
                        <span className="font-medium text-[#19233a] truncate">{item?.nameEn ?? 'Unknown item'}</span>
                        {r.comment && <MessageSquare size={14} className="text-[#9099ab] flex-shrink-0" title={r.comment} />}
                      </div>

                      <div className="w-[130px] flex-shrink-0">
                        <TypeBadge type={item?.type ?? 'Service Request'} />
                      </div>
                      <div className="w-[120px] flex-shrink-0">
                        <StatusPill status={r.status} />
                      </div>
                      <div className="w-[90px] flex-shrink-0">
                        <PriorityPill priority={r.priority} />
                      </div>
                      <div className="w-[80px] flex-shrink-0">
                        <ElapsedBadge
                          since={r.lastStatusChangeAt}
                          allowedMinutes={matchingStep?.allowedMinutes ?? null}
                          escalationMinutes={matchingStep?.escalationMinutes ?? null}
                        />
                      </div>

                      <div className="w-[130px] flex-shrink-0 min-w-0">
                        <Badge tone={reqTeam ? 'info' : 'mute'}>{reqTeam?.name ?? 'Unassigned'}</Badge>
                      </div>

                      <div className="w-[70px] flex-shrink-0">
                        <span className="inline-flex items-center gap-1 text-[13px] text-[#9099ab]">
                          <UserCircle2 size={14} />
                          <span className="truncate max-w-[40px]">
                            {r.assignedUserId ? users.find(u => u.id === r.assignedUserId)?.username?.split(' ')[0] : '—'}
                          </span>
                        </span>
                      </div>

                      <div className="w-[140px] flex-shrink-0 flex justify-end">
                        {isTerminal ? (
                          <Badge tone="ok">
                            <CheckCircle2 size={13} className="mr-1" />
                            Done
                          </Badge>
                        ) : nextStep ? (
                          <Btn variant="neutral" onClick={(e: any) => {
                            e.stopPropagation();
                            careSuiteService.setRequestStatus(r.id, nextStep.status);
                          }}>
                            <ArrowRight size={14} />
                            {nextStep.status}
                          </Btn>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {visibleDevices.filter((dev) => {
            if (!isAnyFilterActive) return true;
            const devRequests = filtered.filter(r => r.room === dev.roomNo);
            return devRequests.length > 0;
          }).map((dev) => {
            const displayRequests = filtered.filter(r => r.room === dev.roomNo);
            const activeRequests = displayRequests.filter(r => r.status !== terminalStatus);
            const pendingCount = activeRequests.length;

            return (
              <div 
                key={dev.id} 
                className="text-left rounded-xl overflow-hidden border border-[#e7e9f0] bg-white flex flex-col justify-between min-h-[220px] shadow-sm hover:shadow-md transition-shadow font-['Poppins',sans-serif]"
              >
                {/* Card Header */}
                <div className="flex items-center justify-between px-3 py-2 text-white font-semibold text-[11px] uppercase bg-[#16274D]">
                  <span>Single Room</span>
                  <span className="opacity-85 font-mono">{dev.bedNo || 'Bed A'}</span>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between bg-white">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[18px] font-bold text-[#16274D] tracking-tight">{dev.roomNo}</span>
                      <span className={cx(
                        'px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider',
                        pendingCount > 0 ? 'bg-[#fcebe9] text-[#c0392b]' : 'bg-[#e7f6f0] text-[#1f9e75]'
                      )}>
                        {pendingCount > 0 ? `${pendingCount} pending order(s)` : 'No pending orders'}
                      </span>
                    </div>

                    <div className="text-[11px] text-[#5d6678] space-y-1">
                      <div><span className="text-gray-400">MRN:</span> <span className="font-semibold text-gray-800">{dev.mrn || '—'}</span></div>
                      <div><span className="text-gray-400">DOA:</span> <span className="font-sans">{dev.poc || '—'}</span></div>
                    </div>

                    {/* CareSuite Requests/Orders section */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="text-[10px] font-bold text-[#9099ab] uppercase mb-2">Orders ({displayRequests.length})</div>
                      {displayRequests.length === 0 ? (
                        <div className="text-[11px] text-gray-400 italic">No orders</div>
                      ) : (
                        <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                          {displayRequests.map(r => {
                            const item = library.find(l => l.id === r.libraryItemId);
                            return (
                              <div 
                                key={r.id} 
                                onClick={() => setSelectedRequest(r)}
                                className={cx(
                                  "p-2 rounded-lg border text-[11px] transition-all cursor-pointer",
                                  r.status === terminalStatus 
                                    ? "bg-gray-50/50 border-gray-100 opacity-60 hover:opacity-100" 
                                    : "bg-[#eaf7fc]/50 border-[#4EBEE3]/20 hover:border-[#4EBEE3]"
                                )}
                              >
                                <div className="flex justify-between items-start gap-1 mb-1">
                                  <div className="font-medium text-[#16274D] truncate">{item?.nameEn}</div>
                                  <span className={cx(
                                    "px-1.5 py-0.5 rounded-full text-[9px] font-bold",
                                    r.priority === 'High' ? 'bg-[#fcebe9] text-[#c0392b]' :
                                    r.priority === 'Medium' ? 'bg-[#fbf1de] text-[#b9770b]' : 'bg-[#e7f6f0] text-[#1f9e75]'
                                  )}>{r.priority}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] text-gray-500">
                                  <span className="font-medium">{r.status}</span>
                                  <ElapsedBadge since={r.lastStatusChangeAt} allowedMinutes={null} escalationMinutes={null} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedRequest && (
        <RequestModal 
          requestId={selectedRequest.id} 
          onClose={() => setSelectedRequest(null)} 
          users={users} 
          library={library} 
          teams={teams}
          requests={requests}
          workflow={workflow}
        />
      )}
    </CareSuitePage>
  );
}

function RequestModal({ requestId, onClose, users, library, teams, requests, workflow }: any) {
  const request = requests.find((r: any) => r.id === requestId);
  if (!request) return null;

  const item = library.find((l: any) => l.id === request.libraryItemId);

  // Dynamically synthesize request history trail if it is missing or incomplete
  const historyList = useMemo(() => {
    if (request.history && request.history.length > 0) {
      if (request.history.some((h: any) => h.status === request.status)) {
        return request.history;
      }
    }

    const currentStepIdx = workflow.findIndex((w: any) => w.status === request.status);
    if (currentStepIdx < 0) {
      return [{ status: 'Sent', timestamp: request.createdAt }];
    }

    const stepsToRender = workflow.slice(0, currentStepIdx + 1);
    const start = request.createdAt;
    const end = request.lastStatusChangeAt;
    const count = stepsToRender.length;

    return stepsToRender.map((w: any, idx: number) => {
      let timestamp = start;
      if (count > 1) {
        timestamp = start + ((end - start) * idx) / (count - 1);
      }
      return {
        status: w.status,
        timestamp: Math.round(timestamp)
      };
    });
  }, [request.history, request.status, request.createdAt, request.lastStatusChangeAt, workflow]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#16274D]/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col font-['Poppins',sans-serif]" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-[#e7e9f0] flex items-center justify-between bg-[#f7f8fb]">
          <h2 className="text-lg font-semibold text-[#16274D]">Request Details</h2>
          <button onClick={onClose} className="p-1.5 text-[#9099ab] hover:text-[#16274D] hover:bg-white rounded-md transition-colors"><X size={18} /></button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <div className="space-y-6">
            <div>
              <div className="text-sm text-[#5d6678] mb-1">Item</div>
              <div className="font-medium text-[#16274D]">{item?.nameEn ?? 'Unknown'}</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-[#5d6678] mb-1">Room</div>
                <div className="font-mono bg-[#f7f8fb] px-2 py-0.5 rounded text-[#16274D] inline-block">{request.room}</div>
              </div>
              <div>
                <div className="text-sm text-[#5d6678] mb-1">Priority</div>
                <PriorityPill priority={request.priority} />
              </div>
            </div>
            {request.comment && (
              <div>
                <div className="text-sm text-[#5d6678] mb-1">Comment</div>
                <div className="text-sm text-[#19233a] bg-[#fbf1de] p-3 rounded-lg border border-[#f5e3c3]">{request.comment}</div>
              </div>
            )}
            <div>
              <div className="text-sm text-[#5d6678] mb-2 font-medium">History Audit</div>
              <div className="space-y-3 border-l-2 border-[#e7e9f0] ml-2 pl-4 py-1">
                {historyList.map((h: any, i: number) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#4EBEE3] border-2 border-white" />
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[13px] text-[#16274D] w-24">{h.status}</span>
                      <span className="text-[12px] text-[#9099ab]">
                        {new Date(h.timestamp).toLocaleDateString()} at {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-sm text-[#5d6678] mb-2 font-medium">Assign User</div>
              <select 
                value={request.assignedUserId || ''} 
                onChange={(e) => careSuiteService.assignRequestUser(request.id, e.target.value || null)}
                className="w-full bg-[#f7f8fb] border border-[#d6dae6] rounded-lg px-3 py-2 text-[14px] text-[#16274D] focus:outline-none focus:border-[#4EBEE3]"
              >
                <option value="">Unassigned</option>
                {users.map((u: any) => <option key={u.id} value={u.id}>{u.username} ({u.userRole})</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
