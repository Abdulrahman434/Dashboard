/**
 * BabyCameraTab — Camera ASSIGNMENT & ACCESS MANAGEMENT screen (nurse/doctor).
 * ----------------------------------------------------------------------------
 * This is deliberately NOT a live-feed viewer. The nurse interface never shows
 * the baby image/video — it only manages assignment, connection health,
 * patient (bedside terminal) access, privacy/safety notes, and recent activity.
 *
 * Real store bindings preserved (single source of truth):
 *   - store.babyCameras (BabyCamera[])           — assignment list
 *   - store.sectionVisibility.baby               — whole-section visibility
 *   - store.patient.name                         — assigned patient
 *   - nurseActions.setSectionVisible("baby", v)  — section toggle
 *   - nurseActions.setBabyCameraVisible(id, v)   — REAL per-camera patient access
 *
 * Everything else (camera ID, nursery, crib, heartbeat, network quality,
 * activity timeline, etc.) is NOT in the store. It is synthesized by the
 * clearly-marked `babyCameraDevAdapter` below — dev-only mock display data.
 */
import React, { useState } from "react";
import { toast } from "sonner@2.0.3";
import {
  Baby,
  Video,
  VideoOff,
  Wifi,
  WifiOff,
  ShieldCheck,
  Activity,
  RefreshCw,
  Link2,
  AlertTriangle,
  Check,
  Clock,
  MapPin,
  User,
  KeyRound,
} from "lucide-react";
import {
  PageHeader,
  StatusBadge,
  SectionCard,
  Button,
  VisibilityControl,
  Toggle,
  EmptyState,
  ConfirmDialog,
  cx,
} from "../ui";
import { useNurseStore, nurseActions } from "../../NurseDataStore";

/* ────────────────────────────────────────────────────────────────────────
 * DEV-ONLY MOCK ADAPTER
 * ------------------------------------------------------------------------
 * Derives the rich assignment/health display model from the REAL store
 * camera (name, connected, visible) + patient name. Fields the store does
 * not carry are filled with typed mock constants so the management screen
 * looks complete. This does NOT read/write the store — it only shapes data
 * for presentation. Replace with a real backend feed when available.
 * ──────────────────────────────────────────────────────────────────────── */
interface DevCamera {
  id: string;
  name: string;
  connected: boolean;
  visible: boolean;
}
interface BabyCameraDisplay {
  // Assignment
  cameraName: string;
  cameraId: string; // mock
  nursery: string; // mock
  crib: string; // mock
  patientName: string; // real (from store.patient.name)
  babyName: string; // derived from patient last name
  assignedAt: string; // mock
  assignedBy: string; // mock
  // Connection health
  connected: boolean; // real (camera.connected)
  lastHeartbeat: string; // mock
  streamAvailable: boolean; // mock (gated by connected)
  networkQuality: { label: string; tone: "success" | "warning" | "danger" }; // mock
  serviceStatus: { label: string; tone: "success" | "warning" | "danger" }; // mock
  lastConnectionTest: string; // mock
  // Access
  accessStart: string; // mock
  accessExpiry: string; // mock
  pinAuthorized: boolean; // mock
  // Activity (mock timeline)
  activity: { text: string; time: string; staff?: string; tone: "info" | "success" | "neutral" }[];
}

function babyCameraDevAdapter(cam: DevCamera, patientName: string): BabyCameraDisplay {
  const lastName = (patientName || "").trim().split(/\s+/).slice(-1)[0] || "Newborn";
  return {
    cameraName: cam.name || "Nursery Camera 3A",
    cameraId: "CAM-NUR-003",
    nursery: "Nursery A",
    crib: "3A",
    patientName: patientName || "—",
    babyName: `Baby ${lastName}`,
    assignedAt: "Jul 27, 2026 · 09:05 AM",
    assignedBy: "Nurse Nura Al-Harbi",
    connected: cam.connected,
    lastHeartbeat: cam.connected ? "12 seconds ago" : "3 minutes ago",
    streamAvailable: cam.connected,
    networkQuality: cam.connected
      ? { label: "Good · 24 Mbps", tone: "success" }
      : { label: "Unavailable", tone: "danger" },
    serviceStatus: cam.connected
      ? { label: "Running", tone: "success" }
      : { label: "Not reachable", tone: "danger" },
    lastConnectionTest: "09:08 AM · Successful",
    accessStart: "Jul 27, 2026 · 09:10 AM",
    accessExpiry: "Until discharge or manual removal",
    pinAuthorized: true,
    activity: [
      { text: "Camera assigned", time: "09:05 AM", staff: "Nurse Nura Al-Harbi", tone: "info" },
      { text: "Connection test successful", time: "09:08 AM", staff: "System", tone: "success" },
      { text: "Patient access enabled", time: "09:10 AM", staff: "Nurse Nura Al-Harbi", tone: "success" },
      { text: "Camera heartbeat received", time: "09:15 AM", tone: "neutral" },
    ],
  };
}

/* ── Small presentational row for definition-style key/value fields ─────── */
function InfoRow({ icon, label, value, valueNode }: any) {
  return (
    <div className="flex items-start justify-between gap-3 py-2 border-b border-[#f1f3f7] last:border-b-0">
      <div className="flex items-center gap-2 min-w-0">
        {icon && <span className="text-[#98a2b3] shrink-0">{icon}</span>}
        <span className="text-[12.5px] font-medium text-[#6B7280] truncate">{label}</span>
      </div>
      <div className="text-[13px] font-semibold text-[#16274D] text-right min-w-0 truncate">
        {valueNode ?? value}
      </div>
    </div>
  );
}

export function BabyCameraTab({ role }: { role: "nurse" | "doctor" }) {
  const store = useNurseStore();
  const isNurse = role === "nurse";

  // REAL store reads — the first assigned camera drives this screen.
  const camera = store.babyCameras[0];
  const patientName = store.patient?.name ?? "";

  // Local (dev) UI state — no backend needed for these.
  const [confirmUnassign, setConfirmUnassign] = useState(false);
  const [testing, setTesting] = useState(false);
  const [lastTest, setLastTest] = useState<string | null>(null);
  const [suspended, setSuspended] = useState(false);

  /* ── Empty state: no camera assigned ──────────────────────────────────── */
  if (!camera) {
    return (
      <div className="space-y-5">
        <PageHeader
          title="Baby Camera"
          subtitle="Manage the camera assigned to this patient and control bedside access."
          badges={<StatusBadge tone="neutral" dot>No Camera Assigned</StatusBadge>}
        />
        <SectionCard>
          <EmptyState
            icon={<VideoOff size={22} />}
            title="No camera assigned"
            description="This patient has no baby camera assigned yet. Assign a nursery camera to enable bedside access."
            action={
              isNurse ? (
                <Button
                  variant="primary"
                  icon={<Link2 size={16} />}
                  onClick={() => toast.info("Camera assignment", { description: "The camera assignment picker is not wired to a backend yet." })}
                >
                  Assign Camera
                </Button>
              ) : undefined
            }
          />
        </SectionCard>
      </div>
    );
  }

  // Build the dev-only display model from the real camera + patient.
  const d = babyCameraDevAdapter(camera, patientName);
  const connected = !!camera.connected;
  const patientAccessOn = !!camera.visible && !suspended;

  /* ── Actions ──────────────────────────────────────────────────────────── */
  const handleTest = () => {
    setTesting(true);
    setTimeout(() => {
      setTesting(false);
      const stamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setLastTest(stamp);
      if (connected) toast.success("Connection test successful", { description: `${d.cameraName} responded at ${stamp}.` });
      else toast.error("Connection test failed", { description: `${d.cameraName} is not reachable.` });
    }, 900);
  };

  const handleUnassign = (reason: string) => {
    setConfirmUnassign(false);
    // Real privacy write: revoke patient access immediately on unassign.
    if (camera.visible) nurseActions.setBabyCameraVisible(camera.id, false);
    toast.success("Camera unassigned", { description: reason ? `Reason: ${reason}` : undefined });
  };

  /* ── Header badges ────────────────────────────────────────────────────── */
  const badges = (
    <>
      <StatusBadge tone={connected ? "success" : "neutral"} dot>
        {connected ? "Camera Connected" : "Disconnected"}
      </StatusBadge>
      <StatusBadge tone={patientAccessOn ? "info" : "neutral"} icon={patientAccessOn ? <Video size={13} /> : <VideoOff size={13} />}>
        {patientAccessOn ? "Visible to Patient" : "Hidden from Patient"}
      </StatusBadge>
    </>
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Baby Camera"
        subtitle="Manage the camera assigned to this patient and control bedside access."
        badges={badges}
        actions={
          isNurse ? (
            <Button
              variant="primary"
              icon={<Link2 size={16} />}
              onClick={() => toast.info("Change camera", { description: "The camera picker is not wired to a backend yet." })}
            >
              Change Camera
            </Button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* ── A. Camera Assignment ───────────────────────────────────────── */}
        <SectionCard title="Camera Assignment" icon={<Baby size={16} />}>
          <div>
            <InfoRow icon={<Video size={14} />} label="Camera name" value={d.cameraName} />
            <InfoRow icon={<KeyRound size={14} />} label="Camera ID" value={d.cameraId} />
            <InfoRow icon={<MapPin size={14} />} label="Nursery" value={d.nursery} />
            <InfoRow icon={<MapPin size={14} />} label="Crib" value={d.crib} />
            <InfoRow icon={<User size={14} />} label="Assigned patient" value={d.patientName} />
            <InfoRow icon={<Baby size={14} />} label="Assigned baby" value={d.babyName} />
            <InfoRow icon={<Clock size={14} />} label="Assignment date & time" value={d.assignedAt} />
            <InfoRow icon={<User size={14} />} label="Assigned by" value={d.assignedBy} />
            <InfoRow
              icon={connected ? <Wifi size={14} /> : <WifiOff size={14} />}
              label="Connection status"
              valueNode={<StatusBadge tone={connected ? "success" : "neutral"} dot>{connected ? "Connected" : "Disconnected"}</StatusBadge>}
            />
          </div>
          {isNurse && (
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <Button
                variant="secondary"
                size="sm"
                icon={<Link2 size={15} />}
                onClick={() => toast.info("Change camera", { description: "The camera picker is not wired to a backend yet." })}
              >
                Change Camera
              </Button>
              <Button variant="secondary" size="sm" loading={testing} icon={<RefreshCw size={15} />} onClick={handleTest}>
                Test Connection
              </Button>
              <Button variant="danger" size="sm" icon={<VideoOff size={15} />} onClick={() => setConfirmUnassign(true)}>
                Unassign Camera
              </Button>
            </div>
          )}
        </SectionCard>

        {/* ── B. Connection Health ───────────────────────────────────────── */}
        <SectionCard title="Connection Health" icon={<Activity size={16} />}>
          <div>
            <InfoRow
              icon={connected ? <Wifi size={14} /> : <WifiOff size={14} />}
              label="Status"
              valueNode={<StatusBadge tone={connected ? "success" : "danger"} dot>{connected ? "Online" : "Offline"}</StatusBadge>}
            />
            <InfoRow icon={<Clock size={14} />} label="Last heartbeat" value={d.lastHeartbeat} />
            <InfoRow
              icon={<Video size={14} />}
              label="Stream availability"
              valueNode={<StatusBadge tone={d.streamAvailable ? "success" : "neutral"}>{d.streamAvailable ? "Available" : "Unavailable"}</StatusBadge>}
            />
            <InfoRow
              icon={<Wifi size={14} />}
              label="Network quality"
              valueNode={<StatusBadge tone={d.networkQuality.tone}>{d.networkQuality.label}</StatusBadge>}
            />
            <InfoRow
              icon={<Activity size={14} />}
              label="Camera service status"
              valueNode={<StatusBadge tone={d.serviceStatus.tone} dot>{d.serviceStatus.label}</StatusBadge>}
            />
            <InfoRow
              icon={<Check size={14} />}
              label="Last successful connection test"
              value={lastTest ? `${lastTest} · Successful` : d.lastConnectionTest}
            />
          </div>
        </SectionCard>

        {/* ── C. Patient Access ──────────────────────────────────────────── */}
        <SectionCard title="Patient Access" icon={<ShieldCheck size={16} />}>
          {/* REAL wired control — writes camera.visible via setBabyCameraVisible */}
          <VisibilityControl
            title="Show Baby Camera on bedside terminal"
            description="Controls whether the patient can view the assigned baby camera on their bedside screen."
            checked={!!camera.visible}
            disabled={!isNurse}
            onChange={(v: boolean) => nurseActions.setBabyCameraVisible(camera.id, v)}
          />
          <div className="mt-3">
            <InfoRow icon={<Clock size={14} />} label="Access start time" value={d.accessStart} />
            <InfoRow icon={<Clock size={14} />} label="Access expiry" value={d.accessExpiry} />
            <InfoRow
              icon={<KeyRound size={14} />}
              label="PIN / session authorization"
              valueNode={<StatusBadge tone={d.pinAuthorized ? "success" : "warning"} dot>{d.pinAuthorized ? "Authorized" : "Pending"}</StatusBadge>}
            />
            <div className="flex items-center justify-between gap-3 py-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[#98a2b3] shrink-0"><AlertTriangle size={14} /></span>
                <div className="min-w-0">
                  <span className="text-[12.5px] font-medium text-[#6B7280] block">Temporary suspension</span>
                  <span className="text-[11px] text-[#98a2b3]">Pause bedside access without unassigning the camera.</span>
                </div>
              </div>
              <Toggle
                checked={suspended}
                disabled={!isNurse}
                label="Temporary suspension"
                onChange={(v: boolean) => {
                  setSuspended(v);
                  toast[v ? "warning" : "success"](v ? "Access temporarily suspended" : "Access resumed");
                }}
              />
            </div>
          </div>
        </SectionCard>

        {/* ── D. Privacy & Safety ────────────────────────────────────────── */}
        <SectionCard title="Privacy & Safety" icon={<ShieldCheck size={16} />} tone="success">
          <ul className="space-y-2.5">
            {[
              "The nurse interface does not display the live feed.",
              "Access events are audited.",
              "Camera assignment must match the admitted patient and approved baby record.",
              "Patient access automatically ends on discharge, transfer, or unassignment.",
            ].map((line, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] text-[#16274D]">
                <span className="mt-0.5 text-[#22C55E] shrink-0"><Check size={15} strokeWidth={3} /></span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      {/* ── E. Recent Activity ───────────────────────────────────────────── */}
      <SectionCard title="Recent Activity" icon={<Activity size={16} />}>
        <ol className="relative">
          {d.activity.map((a, i) => {
            const dot = a.tone === "success" ? "#22C55E" : a.tone === "info" ? "#4EBEE3" : "#98a2b3";
            const last = i === d.activity.length - 1;
            return (
              <li key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0" style={{ background: dot }} />
                  {!last && <span className="w-px flex-1 bg-[#e4e7ec] my-1" />}
                </div>
                <div className={cx("min-w-0", last ? "pb-0" : "pb-4")}>
                  <div className="text-[13px] font-semibold text-[#16274D]">{a.text}</div>
                  <div className="text-[11.5px] text-[#6B7280] mt-0.5">
                    {a.time}
                    {a.staff && <span> · {a.staff}</span>}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </SectionCard>

      {/* ── Unassign confirmation (requires reason) ──────────────────────── */}
      <ConfirmDialog
        open={confirmUnassign}
        title="Unassign baby camera?"
        message={`This will remove ${d.cameraName} from ${d.patientName} and immediately revoke bedside access.`}
        confirmLabel="Unassign Camera"
        tone="danger"
        requireReason
        onConfirm={handleUnassign}
        onCancel={() => setConfirmUnassign(false)}
      />
    </div>
  );
}
