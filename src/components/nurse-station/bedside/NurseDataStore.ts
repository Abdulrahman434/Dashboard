/**
 * NurseDataStore.ts
 *
 * Centralized data store for the Nurse Interface.
 * Uses the same pub/sub singleton pattern as the existing clinicalStore
 * in CareTeamInterface.tsx.
 *
 * This is the single source of truth for:
 *   - Section & item visibility (what the patient sees in CareMe)
 *   - All editable clinical data managed by the nurse
 *   - Observations (migrated from the existing clinicalStore)
 */

import { useState, useEffect } from "react";

/* ═══════════════════════════════════════════════════════════════
 * OVERRIDE TRACKING LOGIC
 * ═══════════════════════════════════════════════════════════════ */

// Fields that can be overridden by nurse
export type OverridableField = 
  | "name" | "room" | "bed" | "mrn" 
  | "admissionDate" | "dischargeDate" | "nameAr";

// localStorage key
const OVERRIDE_KEY     = "careinn-nurse-overrides";
const API_SNAPSHOT_KEY = "careinn-api-snapshot";

// In-memory override set — which fields nurse has manually edited
// after API populated them
let _nurseOverrides: Set<OverridableField> = (() => {
  try {
    const raw = localStorage.getItem(OVERRIDE_KEY);
    return new Set(JSON.parse(raw ?? "[]"));
  } catch { return new Set(); }
})();

// Last values written by the API — used to detect real changes
let _apiSnapshot: Partial<PatientProfile> = (() => {
  try {
    const raw = localStorage.getItem(API_SNAPSHOT_KEY);
    return JSON.parse(raw ?? "{}");
  } catch { return {}; }
})();

function saveOverrides() {
  localStorage.setItem(OVERRIDE_KEY, JSON.stringify([..._nurseOverrides]));
}

function saveApiSnapshot(data: Partial<PatientProfile>) {
  _apiSnapshot = { ..._apiSnapshot, ...data };
  localStorage.setItem(API_SNAPSHOT_KEY, JSON.stringify(_apiSnapshot));
}

function clearOverrides() {
  _nurseOverrides.clear();
  localStorage.removeItem(OVERRIDE_KEY);
  localStorage.removeItem(API_SNAPSHOT_KEY);
  _apiSnapshot = {};
}

/* ═══════════════════════════════════════════════════════════════
 * TYPE DEFINITIONS
 * ═══════════════════════════════════════════════════════════════ */

export interface PatientProfile {
  name: string;
  nameAr: string;
  nameKey: string;
  age: string;
  mrn: string;
  room: string;
  bed:           string;
  sex:           string;
  dob:           string;
  admissionDate: string;
  dischargeDate: string;
  contact: string;
  emergencyContact: string;
  emergencyName: string;
  extension: string;
  roomType?: string;
  stationId?: string;
  // Patient Identity (PID)
  firstName?: string;
  middleName?: string;
  lastName?: string;
  prefix?: string;
  suffix?: string;
  degree?: string;
  ssn?: string;
  visitNumber?: string;
  identifierType?: string;
  // Demographics
  race?: string;
  religion?: string;
  ethnicGroup?: string;
  maritalStatus?: string;
  citizenship?: string;
  birthPlace?: string;
  languageCode?: string;
  languageText?: string;
  nationalityCode?: string;
  nationalityText?: string;
  multipleBirthIndicator?: string;
  birthOrder?: string;
  // Contact & Address
  email?: string;
  businessPhone?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  // Visit Classification (PV1 / PV2)
  patientClass?: string;
  admissionType?: string;
  admitSource?: string;
  patientType?: string;
  hospitalService?: string;
  financialClassCode?: string;
  accountStatus?: string;
  vipIndicator?: string;
  servicingFacility?: string;
  evnRecordedDate?: string;
  evnPlannedDate?: string;
  admitReason?: string;
  visitDescription?: string;
  transferReason?: string;
  dischargeDisposition?: string;
  dietType?: string;
  bedStatus?: string;
  patientConditionCode?: string;
  visitPriorityCode?: string;
  patientStatusCode?: string;
  admissionLevelOfCare?: string;
  modeOfArrival?: string;
  newbornIndicator?: string;
  estLengthOfStay?: string;
  actualLengthOfStay?: string;
  // MSH / EVN
  eventTypeOptions?: string;
  eventReasonCode?: string;
  sendingApp?: string;
  sendingFacility?: string;
  receivingApp?: string;
  receivingFacility?: string;
  messageControlId?: string;
  processingId?: string;
  hl7Version?: string;
  security?: string;
  // PV1 Doctors
  attendingDoctorId?: string;
  attendingDoctorLastName?: string;
  attendingDoctorFirstName?: string;
  attendingDoctorDegree?: string;
  attendingDoctorSourceTable?: string;

  referringDoctorId?: string;
  referringDoctorLastName?: string;
  referringDoctorFirstName?: string;
  referringDoctorDegree?: string;
  referringDoctorSourceTable?: string;

  admittingDoctorId?: string;
  admittingDoctorLastName?: string;
  admittingDoctorFirstName?: string;
  admittingDoctorDegree?: string;
  admittingDoctorSourceTable?: string;

  consultingDoctorId?: string;
  consultingDoctorLastName?: string;
  consultingDoctorFirstName?: string;
  consultingDoctorDegree?: string;
  consultingDoctorSourceTable?: string;
  // Next of Kin (NK1)
  nkSetId?: string;
  nkFirstName?: string;
  nkLastName?: string;
  nkRelationship?: string;
  nkPhone?: string;
  nkAltPhone?: string;
  nkEmail?: string;
  nkAddress?: string;
  nkCity?: string;
  nkState?: string;
  nkZip?: string;
  nkJobTitle?: string;
  nkEmergencyFlag?: string;
  // Insurance (IN1)
  insCompanyId?: string;
  insName?: string;
  insGroupName?: string;
  insType?: string;
  insPolicyNumber?: string;
  insGroupNumber?: string;
  insEffectiveDate?: string;
  insExpiryDate?: string;
  insPolicyHolderName?: string;
  insRelationship?: string;
  insPreAuthCode?: string;
}

export interface CareTeamMember {
  id: string;
  nameKey: string;
  roleKey: string;
  specialtyKey: string;
  img: string;
  visible: boolean;
}

export interface CarePlanItem {
  id: string;
  labelKey: string;
  label?: string; // custom label (used for nurse-added items)
  labelAr?: string; // custom arabic label
  desc?: string; // short activity description (optional)
  source?: 'his' | 'manual'; // origin: synced from HIS (read-only) or nurse-added
  done: boolean;
  active?: boolean;
  status?: 'unchecked' | 'in-progress' | 'done';
  minutes?: number;
  day?: number;
  date?: string; // YYYY-MM-DD
  timeKey?: string;
  time?: string;
  period?: number;
  autoFlag?: boolean;
}

export interface LabResult {
  id: string;
  labelKey: string;
  value: string;
  status: "normal" | "low" | "high";
  date: string;
  summaryKey: string;
  pdfUrl: string;
  visible: boolean;
}

export interface ImagingResult {
  id: string;
  labelKey: string;
  date: string;
  summaryKey: string;
  type: string;
  pdfUrl: string;
  visible: boolean;
}

export interface BabyCamera {
  id: string;
  name: string;
  location: string;
  src: string; // video/image src
  connected: boolean;
  visible: boolean;
}

export interface FinancialItem {
  id: string;
  category: string;
  description: string;
  amount: number;
  covered: number;
  date: string;
}

export interface DoctorNote {
  text: string;
  addedAt: Date;
  doctorName: string;
}

export interface ClinicalObservation {
  id: string;
  timestamp: Date;
  nurseName: string;
  vitals: { bp: string; hr: string; temp: string; spo2: string };
  painLevel: number;
  risks: { fall: boolean; pressure: boolean; allergies: boolean; other: boolean };
  otherRiskNotes?: string;
  nurseNotes: string;
  doctorNote: DoctorNote | null;
}

/** Section keys matching CareMe slides + new nurse-only sections */
export type SectionKey =
  | "profile"
  | "careOverview"
  | "carePlan"
  | "financial"
  | "labs"
  | "imaging"
  | "baby"
  | "discharge"
  | "observations"
  | "nfc"
  | "education";

/* ═══════════════════════════════════════════════════════════════
 * STORE STATE
 * ═══════════════════════════════════════════════════════════════ */

export interface NurseStoreState {
  /** Section-level visibility: key → visible to patient */
  sectionVisibility: Record<SectionKey, boolean>;

  /** Patient profile */
  patient: PatientProfile;

  /** Field-level visibility for Patient Profile */
  profileFieldVisibility?: Record<string, boolean>;

  /** Care team members */
  careTeam: CareTeamMember[];

  /** Allergies (raw string chips) */
  allergies: string[];

  /** Diet codes (e.g. "NAS", "DM") */
  dietCodes: { code: string; label: string }[];

  /** Pain score 0–10 */
  painScore: number;

  /** Care plan items (orderable) */
  carePlan: CarePlanItem[];

  /** Financial items */
  financial: FinancialItem[];

  /** Lab results with per-item visibility */
  labResults: LabResult[];

  /** Imaging results with per-item visibility */
  imagingResults: ImagingResult[];

  /** Baby cameras with per-camera visibility */
  babyCameras: BabyCamera[];

  /** Discharge plan items (orderable) */
  dischargePlan: CarePlanItem[];

  /** Clinical observations */
  observations: ClinicalObservation[];

  /** Education material assignments for this patient */
  educationAssignments: { materialId: string; visible: boolean }[];

  /** Whether to show the "Nurse View" shortcut button on CareMe */
  nurseViewShortcutVisible: boolean;
  
  /** Care Plan Shared State */
  carePlanMode: "daily" | "overall";
  carePlanSelectedDate: string; // YYYY-MM-DD
}

/* ═══════════════════════════════════════════════════════════════
 * DEFAULT / SEED DATA
 * ═══════════════════════════════════════════════════════════════ */

// Import paths for team member images (same as CareMe.tsx)
import imgNura from "@/assets/a7907a91bbdb1ced8824b3333ece109b3cd92b62.png";
import imgOmar from "@/assets/2318867853acb678569427c88b9e543e22bd46b6.png";
import imgBabyCam from "@/assets/68ba9ba13c5aa1cc7d2af5bee7bc955298b612dd.png";

const getTodayISO = () => new Date().toISOString().split("T")[0];

const getTodayDMY = () => {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const getShiftedISO = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
};

const getShiftedFormatted = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
  return d.toLocaleDateString('en-GB', options); // e.g. "2 Jun 2026"
};

const getShiftedShortFormatted = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
  return d.toLocaleDateString('en-GB', options); // e.g. "2 Jun"
};

function createDefaultState(): NurseStoreState {
  return {
    sectionVisibility: {
      profile: true,
      careOverview: true,
      carePlan: true,
      financial: true,
      labs: true,
      imaging: true,
      baby: true,
      discharge: true,
      observations: true,
      nfc: false, // Not a patient-facing CareMe slide
      education: true,
    },

    patient: {
      name: "Sara Saleh",
      nameAr: "سارة صالح",
      nameKey: "clinical.patient.sara",
      age: "32",
      mrn: "MRN1000000",
      room: "412",
      bed:           "",
      sex:           "Female",
      dob:           "1994-07-24",
      admissionDate: getShiftedFormatted(0),
      dischargeDate: getShiftedFormatted(2),
      contact: "050 123 4567",
      emergencyContact: "055 987 6543",
      emergencyName: "Ahmed Saleh",
      extension: "4217",
      roomType: "Single",
      // PID fields
      firstName: "Sara",
      middleName: "",
      lastName: "Saleh",
      prefix: "Ms",
      suffix: "",
      degree: "",
      ssn: "123-456-789",
      visitNumber: "VN-00456",
      identifierType: "MRN",
      // Demographics
      race: "Arab",
      religion: "Islam",
      ethnicGroup: "",
      maritalStatus: "Married",
      citizenship: "Saudi",
      birthPlace: "Riyadh",
      languageCode: "ar / en",
      languageText: "Arabic / English",
      nationalityCode: "SA",
      nationalityText: "Saudi Arabia",
      multipleBirthIndicator: "N",
      birthOrder: "1",
      // Contact & Address
      email: "sara.saleh@example.com",
      businessPhone: "",
      streetAddress: "King Fahd Rd",
      city: "Riyadh",
      state: "Riyadh Province",
      zipCode: "11564",
      // Visit Classification (PV1 / PV2)
      patientClass: "Inpatient",
      admissionType: "Elective",
      admitSource: "1 = Physician Referral",
      patientType: "Standard",
      hospitalService: "MED / SUR / OB",
      financialClassCode: "FC-01",
      accountStatus: "Active",
      vipIndicator: "N",
      servicingFacility: "CareInn Main Hospital",
      evnRecordedDate: getShiftedFormatted(0),
      evnPlannedDate: getShiftedFormatted(0),
      admitReason: "Patient admitted for observation and treatment following routine evaluation.",
      visitDescription: "Elective inpatient admission.",
      transferReason: "N/A",
      dischargeDisposition: "Routine Discharge",
      dietType: "Regular Diet",
      bedStatus: "Occupied",
      patientConditionCode: "Stable",
      visitPriorityCode: "Normal",
      patientStatusCode: "Admitted",
      admissionLevelOfCare: "Acute Care",
      modeOfArrival: "Walk-in",
      newbornIndicator: "N",
      estLengthOfStay: "3 Days",
      actualLengthOfStay: "2 Days",
      // MSH / EVN
      eventTypeOptions: "A01",
      eventReasonCode: "01",
      sendingApp: "CAREINN",
      sendingFacility: "Facility 01",
      receivingApp: "HIS",
      receivingFacility: "Main HIS",
      messageControlId: "MSG-1784992978800",
      processingId: "P",
      hl7Version: "2.3",
      security: "Standard",
      // PV1 Doctors
      attendingDoctorId: "DOC-9921",
      attendingDoctorLastName: "Abdulhalim",
      attendingDoctorFirstName: "Omar",
      attendingDoctorDegree: "MD",
      attendingDoctorSourceTable: "STAFF_TABLE",

      referringDoctorId: "",
      referringDoctorLastName: "",
      referringDoctorFirstName: "",
      referringDoctorDegree: "",
      referringDoctorSourceTable: "",

      admittingDoctorId: "DOC-1102",
      admittingDoctorLastName: "Al-Fahad",
      admittingDoctorFirstName: "Fahad",
      admittingDoctorDegree: "MD",
      admittingDoctorSourceTable: "STAFF_TABLE",

      consultingDoctorId: "DOC-3304",
      consultingDoctorLastName: "Al-Mansoori",
      consultingDoctorFirstName: "Mansoori",
      consultingDoctorDegree: "MD",
      consultingDoctorSourceTable: "STAFF_TABLE",
      // Next of Kin (NK1)
      nkSetId: "1",
      nkFirstName: "Ahmed",
      nkLastName: "Saleh",
      nkRelationship: "Brother",
      nkPhone: "055 987 6543",
      nkAltPhone: "050 999 8877",
      nkEmail: "ahmed.saleh@example.com",
      nkAddress: "King Fahd Rd, Bldg 12",
      nkCity: "Riyadh",
      nkState: "Riyadh Province",
      nkZip: "11564",
      nkJobTitle: "Engineer",
      nkEmergencyFlag: "Yes",
      // Insurance (IN1)
      insCompanyId: "3",
      insName: "BUPA",
      insGroupName: "Corporate Gold",
      insType: "Silver A",
      insPolicyNumber: "POL-994821",
      insGroupNumber: "GRP-8820",
      insEffectiveDate: getShiftedFormatted(-180),
      insExpiryDate: "12/12/2026",
      insPolicyHolderName: "Sara Saleh",
      insRelationship: "Self",
      insPreAuthCode: "AUTH-7721",
    },

    careTeam: [
      { id: "ct-1", nameKey: "care.team.name.nura", roleKey: "care.team.primaryNurse", specialtyKey: "care.team.specialty.icu", img: imgNura, visible: true },
      { id: "ct-2", nameKey: "care.team.name.omar", roleKey: "care.team.attendingDoctor", specialtyKey: "care.team.specialty.cardiology", img: imgOmar, visible: true },
    ],

    allergies: ["Nuts", "Fish", "Shellfish"],

    dietCodes: [
      { code: "DM", label: "Diabetic" },
    ],

    painScore: 5,

    carePlan: [
      { id: "cp-1", labelKey: "care.plan.initialAssessment", label: "Initial Assessment", labelAr: "التقييم الأولي", desc: "Baseline assessment completed", source: 'his', done: true, status: 'done', time: "08:00 AM", period: 30, day: 1, date: getShiftedISO(0) },
      { id: "cp-2", labelKey: "care.plan.bloodWork", label: "Routine Blood Work", labelAr: "تحاليل الدم الروتينية", desc: "CBC, Electrolytes", source: 'his', done: true, status: 'done', time: "09:00 AM", period: 15, day: 1, date: getShiftedISO(0) },
      { id: "cp-3", labelKey: "care.plan.medicationRound", label: "Morning Medication Round", labelAr: "جولة أدوية الصباح", desc: "Scheduled medications", source: 'his', done: false, active: true, status: 'in-progress', time: "10:30 AM", period: 45, day: 1, date: getShiftedISO(0), autoFlag: true },
      { id: "cp-7", labelKey: "care.plan.nutritionReview", label: "Nutrition Review", labelAr: "مراجعة التغذية", desc: "Diet & intake evaluation", source: 'manual', done: false, status: 'unchecked', time: "02:00 PM", period: 30, day: 1, date: getShiftedISO(0) },
      { id: "cp-8", labelKey: "care.plan.mobilityCheck", label: "Mobility Check", labelAr: "فحص الحركة", desc: "Assist with mobility & safety", source: 'manual', done: false, status: 'unchecked', time: "04:00 PM", period: 20, day: 1, date: getShiftedISO(0) },
      { id: "cp-4", labelKey: "care.plan.checkup", label: "Doctor Checkup", labelAr: "فحص الطبيب", desc: "Attending physician round", source: 'his', done: false, status: 'unchecked', time: "11:30 AM", period: 15, day: 2, date: getShiftedISO(1) },
      { id: "cp-5", labelKey: "care.plan.physicalTherapy", label: "Physical Therapy", labelAr: "العلاج الطبيعي", desc: "Guided rehabilitation session", source: 'his', done: false, status: 'unchecked', time: "02:00 PM", period: 60, day: 3, date: getShiftedISO(2) },
      { id: "cp-6", labelKey: "care.plan.doctorReview", label: "Medical Director Review", labelAr: "مراجعة المدير الطبي", desc: "Care plan review & sign-off", source: 'his', done: false, status: 'unchecked', time: "04:30 PM", period: 20, day: 4, date: getShiftedISO(3) },
    ],
    carePlanMode: "daily",
    carePlanSelectedDate: getTodayISO(),

    financial: [
      { id: "fin-1", category: "Room & Board", description: "Private Room — 7 nights", amount: 35000, covered: 31500, date: `${getShiftedShortFormatted(-7)}–${getShiftedShortFormatted(0)}` },
      { id: "fin-2", category: "Medications", description: "IV Antibiotics, Pain Management", amount: 8200, covered: 7380, date: `${getShiftedShortFormatted(-7)}–${getShiftedShortFormatted(0)}` },
      { id: "fin-3", category: "Lab Tests", description: "CBC, BMP, Urinalysis, Blood Culture", amount: 4500, covered: 4050, date: `${getShiftedShortFormatted(-7)}–${getShiftedShortFormatted(-1)}` },
      { id: "fin-4", category: "Imaging", description: "Obstetric Ultrasound, Chest X-Ray", amount: 6000, covered: 5400, date: `${getShiftedShortFormatted(-7)}–${getShiftedShortFormatted(-3)}` },
      { id: "fin-5", category: "Procedures", description: "IV Insertion, Catheterization", amount: 3200, covered: 2880, date: getShiftedShortFormatted(-7) },
      { id: "fin-6", category: "Physician Fees", description: "Attending + Consulting physicians", amount: 12000, covered: 10800, date: `${getShiftedShortFormatted(-7)}–${getShiftedShortFormatted(0)}` },
    ],

    labResults: [
      { id: "lab-1", labelKey: "care.labs.cbc", value: "Normal range", status: "normal", date: getShiftedShortFormatted(0), summaryKey: "care.labs.cbcSummary", pdfUrl: "/reports/lab-report-cbc.html", visible: true },
      { id: "lab-2", labelKey: "care.labs.hemoglobin", value: "11.2 g/dL", status: "low", date: getShiftedShortFormatted(0), summaryKey: "care.labs.hgbSummary", pdfUrl: "/reports/lab-report-cbc.html", visible: true },
      { id: "lab-3", labelKey: "care.labs.glucose", value: "98 mg/dL", status: "normal", date: getShiftedShortFormatted(-1), summaryKey: "care.labs.normalRange", pdfUrl: "/reports/lab-report-cbc.html", visible: true },
      { id: "lab-4", labelKey: "care.labs.potassium", value: "4.1 mmol/L", status: "normal", date: getShiftedShortFormatted(-1), summaryKey: "care.labs.normalRange", pdfUrl: "/reports/lab-report-cbc.html", visible: true },
    ],

    imagingResults: [
      { id: "img-1", labelKey: "care.imaging.ultrasound", date: getShiftedShortFormatted(-1), summaryKey: "care.imaging.summary", type: "Obstetric", pdfUrl: "/reports/obstetric-ultrasound.html", visible: true },
      { id: "img-2", labelKey: "care.imaging.xray", date: getShiftedShortFormatted(-5), summaryKey: "care.imaging.xraySummary", type: "Chest", pdfUrl: "/reports/chest-xray.html", visible: true },
      { id: "img-3", labelKey: "care.imaging.doppler", date: getShiftedShortFormatted(0), summaryKey: "care.imaging.dopplerSummary", type: "Ultrasound", pdfUrl: "/reports/venous-doppler.html", visible: true },
    ],

    babyCameras: [
      { id: "cam-1", name: "Baby Saleh", location: "Nursery · Crib 3A", src: imgBabyCam, connected: true, visible: true },
    ],

    dischargePlan: [
      { id: "dp-1", labelKey: "care.discharge.order", done: true, timeKey: "care.plan.done" },
      { id: "dp-2", labelKey: "care.discharge.insurance", done: true, timeKey: "care.plan.done" },
      { id: "dp-3", labelKey: "care.discharge.medication", done: false, active: true, minutes: 45 },
      { id: "dp-4", labelKey: "care.discharge.education", done: false, minutes: 20 },
      { id: "dp-5", labelKey: "care.discharge.finalCheckup", done: false, minutes: 25 },
      { id: "dp-6", labelKey: "care.discharge.confirm", done: false, minutes: 10 },
    ],

    educationAssignments: [],

    observations: [
      {
        id: "seed-1",
        timestamp: new Date(Date.now() - 3600000 * 4),
        nurseName: "clinical.nurse.nura",
        vitals: { bp: "118/78", hr: "68", temp: "37.0", spo2: "99" },
        painLevel: 1,
        risks: { fall: true, pressure: false, allergies: true, other: false },
        nurseNotes: "Patient resting comfortably. Vitals stable. Tolerating oral intake.",
        doctorNote: {
          text: "Continue current plan. Reassess in the morning.",
          addedAt: new Date(Date.now() - 3600000 * 2),
          doctorName: "Dr. Omar Abdulhalim",
        },
      },
    ],
    profileFieldVisibility: {},
    nurseViewShortcutVisible: false,
  };
}

/* ═══════════════════════════════════════════════════════════════
 * SINGLETON STORE (pub/sub)
 * ═══════════════════════════════════════════════════════════════ */

type StoreListener = (state: NurseStoreState) => void;

const NURSE_STORE_CACHE_KEY = 'careinn-nurse-store';

function loadCachedState(): Partial<NurseStoreState> {
  try {
    const raw = localStorage.getItem(NURSE_STORE_CACHE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Partial<NurseStoreState>;
    if (parsed) {
      parsed.carePlanSelectedDate = new Date().toISOString().split("T")[0];
    }
    return parsed;
  } catch { return {}; }
}

function syncRoomTypeOverride(patient: PatientProfile) {
  if (patient.roomType && patient.room && patient.stationId) {
    const key = `${patient.stationId}_${patient.room}`;
    try {
      const overrides = JSON.parse(localStorage.getItem("careinn_room_type_overrides") || "{}");
      if (overrides[key] !== patient.roomType) {
        overrides[key] = patient.roomType;
        localStorage.setItem("careinn_room_type_overrides", JSON.stringify(overrides));
        window.dispatchEvent(new Event("storage"));
      }
    } catch {}
  }
}

function syncManualRoomOccupancy(patient: PatientProfile) {
  if (patient.room && patient.stationId && patient.stationId !== "reference") {
    const key = `${patient.stationId}_${patient.room}`;
    try {
      const occupancies = JSON.parse(localStorage.getItem("careinn_manual_room_occupancy") || "{}");
      if (patient.mrn) {
        occupancies[key] = {
          mrn: patient.mrn,
          gender: patient.sex || "Female",
          doa: patient.admissionDate || getTodayDMY(),
          age: patient.age ? (patient.age.endsWith("y") ? patient.age : `${patient.age}y`) : "43y",
          name: patient.name || "",
          nameAr: patient.nameAr || "",
          contact: patient.contact || "",
          emergencyName: patient.emergencyName || "",
          emergencyContact: patient.emergencyContact || "",
          extension: patient.extension || "",
          dischargeDate: patient.dischargeDate || "",
          bed: patient.bed || "1",
        };
      } else {
        delete occupancies[key];
      }
      localStorage.setItem("careinn_manual_room_occupancy", JSON.stringify(occupancies));
      window.dispatchEvent(new Event("storage"));
    } catch {}
  }
}

const nurseStore = (() => {
  let state = {
    ...createDefaultState(),
    ...loadCachedState(),
  };
  const listeners = new Set<StoreListener>();

  function persistState() {
    try {
      localStorage.setItem(NURSE_STORE_CACHE_KEY, JSON.stringify(state));
    } catch {}
  }

  function notify() {
    persistState();
    listeners.forEach((l) => l({ ...state }));
  }

  return {
    get: () => state,

    subscribe: (listener: StoreListener) => {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },

    // ── Section visibility ──
    setSectionVisible: (key: SectionKey, visible: boolean) => {
      state = { ...state, sectionVisibility: { ...state.sectionVisibility, [key]: visible } };
      notify();
    },

    // ── Patient profile ──
    updatePatient: (updates: Partial<PatientProfile>) => {
      let nextPatient = { ...state.patient, ...updates };
      // If name was updated manually, clear nameKey so the new name shows up
      if (updates.name && updates.name !== state.patient.name) {
        nextPatient.nameKey = "";
      }
      state = { ...state, patient: nextPatient };
      syncRoomTypeOverride(nextPatient);
      notify();
    },

    /**
     * Called ONLY by hospitalApi — applies API data with override logic.
     * 
     * Rules per field:
     *  - API value empty → always skip
     *  - Nurse override set AND API value same as last snapshot → skip
     *  - API value different from last snapshot → always apply 
     *    (new patient or real change), clear that field's override
     *  - No nurse override → always apply
     */
    updatePatientFromApi: (
      updates: Partial<PatientProfile>
    ) => {
      const fields = Object.keys(updates) as OverridableField[];
      const applied: Partial<PatientProfile> = {};

      for (const field of fields) {
        const apiValue = updates[field as keyof PatientProfile];

        // Rule 1: empty API value never overrides anything
        if (!apiValue) continue;

        const lastApiValue = _apiSnapshot[
          field as keyof PatientProfile];
        const hasOverride = _nurseOverrides.has(field);
        const apiChanged  = apiValue !== lastApiValue;

        if (hasOverride && !apiChanged) {
          // Nurse edited this field AND API hasn't changed → keep nurse value
          continue;
        }

        if (apiChanged && lastApiValue) {
          // API value genuinely changed (new patient) → apply + clear override
          _nurseOverrides.delete(field);
        }

        // Apply this field
        applied[field as keyof PatientProfile] = apiValue as any;
      }

      if (Object.keys(applied).length === 0) return;

      // Save API snapshot of what we just applied
      saveApiSnapshot(applied);
      saveOverrides();

      // Apply to store
      let nextPatient = { ...state.patient, ...applied };
      if (applied.name && applied.name !== state.patient.name) {
        nextPatient.nameKey = "";
      }
      state = { ...state, patient: nextPatient };
      notify();
    },

    /**
     * Called when nurse manually edits a field in the UI.
     * Marks that field as nurse-overridden so future API calls
     * don't overwrite it (unless API value changes).
     */
    updatePatientFromNurse: (
      updates: Partial<PatientProfile>
    ) => {
      // Only flag override if API has already populated this field
      const fields = Object.keys(updates) as OverridableField[];
      for (const field of fields) {
        const apiHasValue = !!_apiSnapshot[
          field as keyof PatientProfile];
        if (apiHasValue) {
          // API had a value — nurse is now overriding it
          _nurseOverrides.add(field);
        }
        // If API never populated this field, no override needed —
        // nurse is just filling it in fresh
      }
      saveOverrides();

      // Apply nurse update normally
      let nextPatient = { ...state.patient, ...updates };
      if (updates.name && updates.name !== state.patient.name) {
        nextPatient.nameKey = "";
      }
      state = { ...state, patient: nextPatient };
      syncRoomTypeOverride(nextPatient);
      syncManualRoomOccupancy(nextPatient);
      notify();
    },

    /** Clear all overrides — call on new admission or Clear Data */
    clearPatientOverrides: () => {
      clearOverrides();
    },

    // ── Care Team ──
    addCareTeamMember: (member: CareTeamMember) => {
      state = { ...state, careTeam: [...state.careTeam, member] };
      notify();
    },
    removeCareTeamMember: (id: string) => {
      state = { ...state, careTeam: state.careTeam.filter((m) => m.id !== id) };
      notify();
    },
    toggleCareTeamMemberVisibility: (id: string) => {
      state = { ...state, careTeam: state.careTeam.map((m) => m.id === id ? { ...m, visible: !m.visible } : m) };
      notify();
    },

    // ── Allergies ──
    addAllergy: (name: string) => {
      if (!state.allergies.includes(name)) {
        state = { ...state, allergies: [...state.allergies, name] };
        notify();
      }
    },
    removeAllergy: (name: string) => {
      state = { ...state, allergies: state.allergies.filter((a) => a !== name) };
      notify();
    },

    // ── Diet Codes ──
    addDietCode: (code: string, label: string) => {
      if (!state.dietCodes.find((d) => d.code === code)) {
        state = { ...state, dietCodes: [...state.dietCodes, { code, label }] };
        notify();
      }
    },
    removeDietCode: (code: string) => {
      state = { ...state, dietCodes: state.dietCodes.filter((d) => d.code !== code) };
      notify();
    },

    // ── Pain Score ──
    setPainScore: (score: number) => {
      state = { ...state, painScore: Math.max(0, Math.min(10, score)) };
      notify();
    },

    // ── Care Plan ──
    setCarePlan: (items: CarePlanItem[]) => {
      state = { ...state, carePlan: items };
      notify();
    },
    addCarePlanItem: (item: CarePlanItem) => {
      state = { ...state, carePlan: [...state.carePlan, item] };
      notify();
    },
    updateCarePlanItem: (id: string, updates: Partial<CarePlanItem>) => {
      state = { ...state, carePlan: state.carePlan.map((i) => i.id === id ? { ...i, ...updates } : i) };
      notify();
    },
    deleteCarePlanItem: (id: string) => {
      state = { ...state, carePlan: state.carePlan.filter((i) => i.id !== id) };
      notify();
    },
    setCarePlanMode: (mode: "daily" | "overall") => {
      state = { ...state, carePlanMode: mode };
      notify();
    },
    setCarePlanSelectedDate: (date: string) => {
      state = { ...state, carePlanSelectedDate: date };
      notify();
    },

    toggleCarePlanItem: (id: string) => {
      state = {
        ...state,
        carePlan: state.carePlan.map((i) => {
          if (i.id !== id) return i;
          
          let currentStatus: 'unchecked' | 'in-progress' | 'done' = 'unchecked';
          if (i.status) {
            currentStatus = i.status;
          } else if (i.done) {
            currentStatus = 'done';
          } else if (i.active) {
            currentStatus = 'in-progress';
          }

          let nextStatus: 'unchecked' | 'in-progress' | 'done';
          let nextDone = false;
          let nextActive = false;

          if (currentStatus === 'unchecked') {
            nextStatus = 'in-progress';
            nextDone = false;
            nextActive = true;
          } else if (currentStatus === 'in-progress') {
            nextStatus = 'done';
            nextDone = true;
            nextActive = false;
          } else {
            nextStatus = 'unchecked';
            nextDone = false;
            nextActive = false;
          }

          return { ...i, status: nextStatus, done: nextDone, active: nextActive };
        })
      };
      notify();
    },

    toggleDischargePlanItem: (id: string) => {
      const idx = state.dischargePlan.findIndex(i => i.id === id);
      if (idx === -1) return;

      const item = state.dischargePlan[idx];
      const newDone = !item.done;

      let nextPlan = state.dischargePlan.map((i) => {
        if (i.id === id) return { ...i, done: newDone, active: false };
        return i;
      });

      if (newDone) {
        let activated = false;
        nextPlan = nextPlan.map((i) => {
          if (!activated && !i.done) {
            activated = true;
            return { ...i, active: true };
          }
          return { ...i, active: false };
        });
      }

      state = { ...state, dischargePlan: nextPlan };
      notify();
    },

    updateDischargePlanItem: (id: string, updates: Partial<CarePlanItem>) => {
      state = { ...state, dischargePlan: state.dischargePlan.map((i) => i.id === id ? { ...i, ...updates } : i) };
      notify();
    },
    deleteDischargePlanItem: (id: string) => {
      state = { ...state, dischargePlan: state.dischargePlan.filter((i) => i.id !== id) };
      notify();
    },



    // ── Lab Results ──
    setLabResultVisible: (id: string, visible: boolean) => {
      state = { ...state, labResults: state.labResults.map((l) => l.id === id ? { ...l, visible } : l) };
      notify();
    },

    // ── Imaging ──
    setImagingResultVisible: (id: string, visible: boolean) => {
      state = { ...state, imagingResults: state.imagingResults.map((i) => i.id === id ? { ...i, visible } : i) };
      notify();
    },

    // ── Baby Camera ──
    setBabyCameraVisible: (id: string, visible: boolean) => {
      state = { ...state, babyCameras: state.babyCameras.map((c) => c.id === id ? { ...c, visible } : c) };
      notify();
    },

    // ── Discharge Plan ──
    setDischargePlan: (items: CarePlanItem[]) => {
      state = { ...state, dischargePlan: items };
      notify();
    },
    addDischargePlanItem: (item: CarePlanItem) => {
      state = { ...state, dischargePlan: [...state.dischargePlan, item] };
      notify();
    },

    // ── Observations ──
    addObservation: (obs: ClinicalObservation) => {
      state = { ...state, observations: [...state.observations, obs] };
      notify();
    },
    deleteObservation: (id: string) => {
      state = { ...state, observations: state.observations.filter((o) => o.id !== id) };
      notify();
    },
    addDoctorNote: (obsId: string, note: DoctorNote) => {
      state = {
        ...state,
        observations: state.observations.map((o) =>
          o.id === obsId ? { ...o, doctorNote: note } : o
        ),
      };
      notify();
    },

    setNurseViewShortcutVisible: (visible: boolean) => {
      state = { ...state, nurseViewShortcutVisible: visible };
      notify();
    },

    setProfileFieldVisible: (fieldKey: string, visible: boolean) => {
      const currentMap = state.profileFieldVisibility || {};
      state = {
        ...state,
        profileFieldVisibility: {
          ...currentMap,
          [fieldKey]: visible,
        },
      };
      notify();
    },

    // ── Education Assignments ──
    assignEducationMaterial: (materialId: string) => {
      if (state.educationAssignments.find(a => a.materialId === materialId)) return;
      state = { ...state, educationAssignments: [...state.educationAssignments, { materialId, visible: true }] };
      notify();
    },
    removeEducationMaterial: (materialId: string) => {
      state = { ...state, educationAssignments: state.educationAssignments.filter(a => a.materialId !== materialId) };
      notify();
    },
    toggleEducationVisibility: (materialId: string) => {
      state = {
        ...state,
        educationAssignments: state.educationAssignments.map(a =>
          a.materialId === materialId ? { ...a, visible: !a.visible } : a
        ),
      };
      notify();
    },
  };
})();

/* ═══════════════════════════════════════════════════════════════
 * REACT HOOK
 * ═══════════════════════════════════════════════════════════════ */

/** Subscribe to the full nurse data store. Re-renders on any change. */
export function useNurseStore() {
  const [state, setState] = useState<NurseStoreState>(nurseStore.get());
  useEffect(() => nurseStore.subscribe(setState), []);
  return state;
}

/** Direct access to store actions (stable references — no re-render trigger) */
export const nurseActions = nurseStore;
