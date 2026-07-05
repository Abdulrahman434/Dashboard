import { useState } from 'react';
import { ChefHat, Tablet, Printer, Check, CheckCheck, User, Clock, Utensils, CheckCircle2, Stethoscope } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useFood, updateFood } from './foodStore';
import { cx, Btn, Badge, Card, FoodPage } from './foodAtoms';
import { MultiSelectDropdown } from '../UnifiedDropdown';

export default function KitchenPage({ onNavigate }: { onNavigate: (route: string) => void }) {
  const db = useFood();

  // Load occupancies & devices
  const getDeviceAndOccupancy = (o: any, idx: number) => {
    const devRaw = typeof window !== 'undefined' ? localStorage.getItem('careinn_devices') : null;
    const devices: any[] = devRaw ? JSON.parse(devRaw) : [];
    
    const occRaw = typeof window !== 'undefined' ? localStorage.getItem('careinn_manual_room_occupancy') : null;
    const occupancies: any = occRaw ? JSON.parse(occRaw) : {};

    const MOCK_PATIENT_NAMES: Record<string, string> = {
      'MRN1000000': 'Ahmed Al-Salem',
      'MRN1000001': 'Sara Hassan',
      'MRN1000002': 'Khalid Al-Otaibi',
      'MRN1000003': 'Maryam Saleh',
      'MRN1000004': 'Fatima Noor',
      'MRN1000005': 'Omar Said',
    };

    // Find device by location, fallback to dev[idx] for robust demo pairing
    const dev = devices.find((d: any) => 
      d.roomNo === `${o.room}${o.bed}` || 
      (d.roomNo === o.room && d.bedNo === o.bed)
    ) || devices[idx % (devices.length || 1)] || null;

    let patientName = o.name;
    let locationDetails = `Room ${o.room} ${o.bed && `· Bed ${o.bed}`}`;
    let mrn = '';
    let deviceId = '';
    
    if (dev) {
      const occKey = Object.keys(occupancies).find(key => occupancies[key].mrn === dev.mrn);
      const occ = occKey ? occupancies[occKey] : null;
      if (occ && occ.name) {
        patientName = occ.name;
      } else if (MOCK_PATIENT_NAMES[dev.mrn]) {
        patientName = MOCK_PATIENT_NAMES[dev.mrn];
      }
      locationDetails = `Room ${dev.roomNo} · Bed ${dev.bedNo} · Floor ${dev.floor} · Bldg ${dev.building} (${dev.poc})`;
      mrn = dev.mrn;
      deviceId = dev.deviceId;
    }

    // Try to read observations from active nurse store
    const nurseStoreRaw = typeof window !== 'undefined' ? localStorage.getItem('careinn-nurse-store') : null;
    let obs: any = null;
    try {
      if (nurseStoreRaw) {
        const parsed = JSON.parse(nurseStoreRaw);
        if (parsed.observations && parsed.observations.length > 0) {
          obs = parsed.observations[0];
        }
      }
    } catch (e) {}

    if (!obs) {
      // Realistic fallback observation
      obs = {
        vitals: { bp: "116/74", hr: "72", temp: "36.8", spo2: "98" },
        painLevel: 2,
        risks: { fall: true, pressure: false, allergies: true, other: false },
        nurseNotes: "Patient alert and oriented. Tolerating diet without nausea. Pain controlled."
      };
    }

    const activeRisks: string[] = [];
    if (obs.risks?.fall) activeRisks.push('Fall Risk');
    if (obs.risks?.pressure) activeRisks.push('Pressure Injury');
    if (obs.risks?.allergies) activeRisks.push('Allergies');
    if (obs.risks?.other) activeRisks.push('Other');

    return {
      patientName,
      locationDetails,
      mrn,
      deviceId,
      obs,
      activeRisks
    };
  };

  // Selected tickets state
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

  // Filters state
  const [selectedMeals, setSelectedMeals] = useState<string[]>([]);
  const [selectedWards, setSelectedWards] = useState<string[]>([]);
  const [selectedDiets, setSelectedDiets] = useState<string[]>([]);

  // Print queue state
  const [printingOrders, setPrintingOrders] = useState<any[]>([]);

  // Advance an order along its lifecycle: Submitted -> Printed -> Delivered.
  const advance = (id: string) => {
    let newStatus = '';
    updateFood((d: any) => {
      const o = d.orders.find((ord: any) => ord.id === id);
      if (o) {
        newStatus = o.status === 'Submitted' ? 'Printed' : 'Delivered';
        o.status = newStatus;
      }
    });
    toast(newStatus === 'Printed' ? 'Ticket printed' : 'Marked delivered');
  };

  // Print a single ticket (and advance status to Printed if it is Submitted)
  const printSingle = (order: any) => {
    if (order.status === 'Submitted') {
      updateFood((d: any) => {
        const o = d.orders.find((ord: any) => ord.id === order.id);
        if (o) o.status = 'Printed';
      });
    }
    setPrintingOrders([order]);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Bulk Print
  const bulkPrint = () => {
    const toPrint = visibleOrders.filter((o: any) => selectedOrderIds.includes(o.id));
    if (toPrint.length === 0) return;

    updateFood((d: any) => {
      d.orders.forEach((o: any) => {
        if (selectedOrderIds.includes(o.id) && o.status === 'Submitted') {
          o.status = 'Printed';
        }
      });
    });

    setPrintingOrders(toPrint);
    setTimeout(() => {
      window.print();
    }, 150);
    setSelectedOrderIds([]);
  };

  // Bulk Deliver
  const bulkDeliver = () => {
    if (selectedOrderIds.length === 0) return;
    updateFood((d: any) => {
      d.orders.forEach((o: any) => {
        if (selectedOrderIds.includes(o.id) && o.status !== 'Delivered') {
          o.status = 'Delivered';
        }
      });
    });
    toast(`Marked ${selectedOrderIds.length} orders as delivered`);
    setSelectedOrderIds([]);
  };

  const toggleSelectOrder = (id: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  // Helper to identify accompaniment/comes-with items
  const isAccompaniment = (section: string, dishName: string) => {
    const sec = section.toLowerCase();
    const dish = dishName.toLowerCase();
    if (sec === 'drinks' || sec === 'baked breads') return true;
    if (dish.includes('cheese platter') || dish === 'bread' || dish === 'milk') return true;
    return false;
  };

  // Extract unique rooms
  const uniqueRooms = Array.from(new Set(db.orders.map((o: any) => o.room || '')))
    .filter(Boolean)
    .sort() as string[];

  // Filter orders
  const visibleOrders = db.orders.filter((o: any) => {
    const matchMeal = selectedMeals.length === 0 || selectedMeals.includes(o.meal);
    const matchDiet = selectedDiets.length === 0 || selectedDiets.includes(o.diet);
    const matchWard = selectedWards.length === 0 || selectedWards.includes(o.room);
    return matchMeal && matchDiet && matchWard;
  });

  const handleSelectAll = (visible: any[]) => {
    const visibleIds = visible.map((o) => o.id);
    const allSelected = visibleIds.every((id) => selectedOrderIds.includes(id));
    if (allSelected) {
      setSelectedOrderIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedOrderIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  // ---- empty state ---------------------------------------------------------
  if (db.orders.length === 0) {
    return (
      <FoodPage current="kit" onNavigate={onNavigate}>
        <Card>
          <div className="text-center py-[50px] px-5 text-[#5d6678]">
            <ChefHat size={48} className="mx-auto text-[#9099ab]" />
            <div className="font-semibold text-[#16274D] mt-3">No orders yet</div>
            <div className="text-[#5d6678] mt-1">
              Place an order in the patient kiosk and it lands here.
            </div>
            <div className="mt-4 flex justify-center">
              <Btn variant="primary" onClick={() => onNavigate('food-kiosk')}>
                <Tablet size={16} />
                Open patient kiosk
              </Btn>
            </div>
          </div>
        </Card>
      </FoodPage>
    );
  }

  const counts = db.orders.reduce(
    (acc: any, o: any) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    },
    { Submitted: 0, Printed: 0, Delivered: 0 },
  );

  return (
    <FoodPage current="kit" onNavigate={onNavigate}>
      {/* Dynamic styles for printing */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background-color: white;
          }
          .print-ticket-page {
            page-break-after: always;
            break-after: page;
            padding: 20px;
            background-color: white;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print-ticket-page:last-child {
            page-break-after: avoid;
            break-after: avoid;
          }
        }
      `}} />

      {/* Header, Filters, and Bulk Actions Card with !overflow-visible to prevent dropdown clipping */}
      <Card className="mb-5 !overflow-visible">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 px-5 py-[18px] border-b border-[#e7e9f0]">
          <div className="min-w-0">
            <div className="font-['Poppins',sans-serif] font-semibold text-[18px] text-[#16274D]">
              Kitchen queue
            </div>
            <div className="text-[13px] text-[#5d6678] mt-0.5">
              {db.orders.length} orders · {counts.Submitted} new, {counts.Printed} printing,{' '}
              {counts.Delivered} delivered
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Btn variant="neutral" onClick={() => onNavigate('food-kiosk')}>
              <Tablet size={16} />
              Add an order
            </Btn>
          </div>
        </div>

        {/* Multi-Filter Section */}
        <div className="px-5 py-4 bg-[#f8fafc] border-b border-[#e7e9f0] !overflow-visible">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 !overflow-visible">
            <div className="relative !overflow-visible">
              <label className="block text-[12px] font-semibold text-[#5d6678] mb-1.5 font-['Poppins',sans-serif]">
                Meal Type
              </label>
              <MultiSelectDropdown
                options={db.meals}
                selectedValues={selectedMeals}
                onChange={setSelectedMeals}
                placeholder="All Meals"
              />
            </div>
            <div className="relative !overflow-visible">
              <label className="block text-[12px] font-semibold text-[#5d6678] mb-1.5 font-['Poppins',sans-serif]">
                Diet Type
              </label>
              <MultiSelectDropdown
                options={db.diets.map((x: any) => x.en)}
                selectedValues={selectedDiets}
                onChange={setSelectedDiets}
                placeholder="All Diets"
              />
            </div>
            <div className="relative !overflow-visible">
              <label className="block text-[12px] font-semibold text-[#5d6678] mb-1.5 font-['Poppins',sans-serif]">
                Room/Ward
              </label>
              <MultiSelectDropdown
                options={uniqueRooms}
                selectedValues={selectedWards}
                onChange={setSelectedWards}
                placeholder="All Rooms"
              />
            </div>
          </div>
        </div>

        {/* Bulk Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-[#f1f5f9]">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleSelectAll(visibleOrders)}
              className="inline-flex items-center gap-2.5 text-[13.5px] text-[#16274D] font-semibold cursor-pointer select-none bg-transparent border-0 p-0 outline-none hover:text-[#4EBEE3] transition-colors"
            >
              <div className={cx(
                "w-5.5 h-5.5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 shadow-sm",
                visibleOrders.length > 0 && visibleOrders.every((o: any) => selectedOrderIds.includes(o.id))
                  ? "bg-[#4EBEE3] border-[#4EBEE3] text-white"
                  : "bg-white border-gray-300 text-transparent"
              )}>
                <Check size={14} strokeWidth={3} />
              </div>
              <span>Select All Visible ({selectedOrderIds.length} selected)</span>
            </button>
          </div>
          <div className="flex gap-2">
            <Btn
              variant="neutral"
              disabled={selectedOrderIds.length === 0}
              onClick={bulkPrint}
            >
              <Printer size={16} />
              Print Selected
            </Btn>
            <Btn
              variant="primary"
              disabled={selectedOrderIds.length === 0}
              onClick={bulkDeliver}
            >
              <Check size={16} />
              Deliver Selected
            </Btn>
          </div>
        </div>
      </Card>

      {/* Grid of Kitchen Tickets */}
      <div className="grid grid-cols-1 gap-5">
        {visibleOrders.map((o: any, idx: number) => {
          const isCompanion = o.name.toLowerCase().includes('companion');
          const info = getDeviceAndOccupancy(o, idx);

          // Categorize lines
          const mealItems: string[] = [];
          const accompaniments: string[] = [];

          (o.lines || []).forEach(([section, dish]: [string, string]) => {
            if (isAccompaniment(section, dish)) {
              accompaniments.push(dish);
            } else {
              mealItems.push(dish);
            }
          });

          // Fetch patient allergies
          const patientObj = db.patients.find((p: any) => p.name === o.name);
          const allergiesList = isCompanion
            ? 'None'
            : patientObj && patientObj.allergies.length > 0
            ? patientObj.allergies.join(', ')
            : 'None';

          // Determine visual tones for patient vs companion
          const headerBg = isCompanion ? 'bg-[#fdf0f2]' : 'bg-[#eaf5fa]';
          const headerText = isCompanion ? 'text-[#d11a47]' : 'text-[#0a84b1]';
          const avatarBg = isCompanion ? 'bg-[#d11a47]' : 'bg-[#0a84b1]';

          return (
            <div
              key={o.id}
              className="relative grid grid-cols-1 lg:grid-cols-5 gap-0 rounded-[16px] border border-[#e7e9f0] bg-white shadow-sm overflow-hidden"
            >
              {/* Checkbox selector */}
              <button
                type="button"
                onClick={() => toggleSelectOrder(o.id)}
                className="absolute top-4 left-4 z-10 focus:outline-none cursor-pointer p-0 bg-transparent border-0"
                title="Select Ticket"
              >
                <div className={cx(
                  "w-5.5 h-5.5 rounded-md border-2 flex items-center justify-center transition-all shadow-sm",
                  selectedOrderIds.includes(o.id)
                    ? "bg-[#4EBEE3] border-[#4EBEE3] text-white"
                    : "bg-white border-gray-300 hover:border-[#4EBEE3] text-transparent"
                )}>
                  <Check size={14} strokeWidth={3} />
                </div>
              </button>

              {/* LEFT PANEL: Order status & primary actions */}
              <div className="lg:col-span-2 flex flex-col items-center justify-center p-6 bg-[#fcfdfe] border-b lg:border-b-0 lg:border-r border-[#e7e9f0] text-center">
                <div className={cx(
                  "w-16 h-16 rounded-full flex items-center justify-center shadow-[0_4px_10px_rgba(31,158,117,0.15)] mb-4",
                  o.status === 'Delivered' ? 'bg-[#e7f6f0] text-[#1f9e75]' : o.status === 'Printed' ? 'bg-[#fbf1de] text-[#b9770b]' : 'bg-[#eaf7fc] text-[#1d7da3]'
                )}>
                  {o.status === 'Delivered' ? <CheckCircle2 size={32} /> : o.status === 'Printed' ? <Printer size={32} /> : <CheckCircle2 size={32} />}
                </div>

                <div className="font-semibold text-[#16274D] text-[18px]">
                  {o.status === 'Submitted' && 'Meal Order Confirmed'}
                  {o.status === 'Printed' && 'Meal Order Printed'}
                  {o.status === 'Delivered' && 'Meal Order Delivered'}
                </div>

                <div className="text-[13.5px] text-[#5d6678] mt-2 mb-5 px-4 leading-relaxed">
                  {o.status === 'Submitted' && `Your ${o.meal.toLowerCase()} order has been sent to the kitchen and will be delivered during the scheduled time.`}
                  {o.status === 'Printed' && `Your ${o.meal.toLowerCase()} order is printed and being prepared by the kitchen staff for delivery.`}
                  {o.status === 'Delivered' && `Your ${o.meal.toLowerCase()} order has been successfully delivered.`}
                </div>

                <div>
                  {o.status === 'Submitted' && (
                    <Btn variant="accent" onClick={() => printSingle(o)}>
                      <Printer size={16} />
                      Print Ticket
                    </Btn>
                  )}
                  {o.status === 'Printed' && (
                    <div className="flex gap-2 items-center">
                      <Btn variant="neutral" onClick={() => printSingle(o)} title="Reprint Ticket">
                        <Printer size={16} />
                      </Btn>
                      <Btn variant="primary" onClick={() => advance(o.id)}>
                        <Check size={16} />
                        Mark Delivered
                      </Btn>
                    </div>
                  )}
                  {o.status === 'Delivered' && (
                    <div className="flex flex-col items-center gap-1.5">
                      <Badge tone="ok" className="h-[38px] px-5 font-semibold text-[14px]">
                        <CheckCheck size={16} className="mr-1" />
                        Delivered
                      </Badge>
                      <button
                        onClick={() => printSingle(o)}
                        className="text-[12.5px] text-[#0a84b1] hover:underline font-semibold cursor-pointer flex items-center gap-1 mt-1 font-['Poppins',sans-serif]"
                      >
                        <Printer size={13} /> Reprint Ticket
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT PANEL: The Ticket itself */}
              <div className="lg:col-span-3 p-5 flex flex-col justify-center bg-gray-50/50">
                <div className="border border-[#e7e9f0] rounded-[14px] bg-white shadow-sm overflow-hidden">
                  {/* Ticket Header */}
                  <div className={cx("flex items-center justify-between p-4 border-b border-[#e7e9f0]", headerBg)}>
                    <div className="flex items-center">
                      <div className={cx("w-10 h-10 rounded-full flex items-center justify-center text-white", avatarBg)}>
                        <User size={18} />
                      </div>
                      <div className="ml-3 min-w-0 text-left">
                        <div className="font-bold text-[#16274D] text-[15px] truncate">
                          {isCompanion ? 'For Companion' : `For ${info.patientName}`} · {info.locationDetails}
                        </div>
                        <div className="text-[12px] text-[#5d6678] font-medium mt-0.5 truncate">
                          Diet: {o.diet} · Allergens: {allergiesList} {info.mrn && `· MRN: ${info.mrn}`} {info.deviceId && `· Device: ${info.deviceId}`}
                        </div>
                      </div>
                    </div>
                    <div className={cx("font-bold text-[14px] flex-shrink-0 ml-2", headerText)}>
                      Order ID: ##{o.id.replace('ORD-', '')}
                    </div>
                  </div>

                  {/* Ticket Delivery Row */}
                  <div className="p-4 flex justify-between items-start border-b border-[#e7e9f0]">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-[#9099ab] tracking-wider uppercase mt-1">
                      <Clock size={15} className="text-[#9099ab]" />
                      <span>Delivery Time</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-[#16274D] text-[13.5px]">
                        {o.meal} ({o.meal === 'Breakfast' ? '8:00 AM – 9:00 AM' : o.meal === 'Lunch' ? '1:00 PM – 2:00 PM' : '6:00 PM – 7:30 PM'})
                      </div>
                      <div className="text-[12.5px] text-[#5d6678] mt-0.5">
                        {o.date === 'Today' ? 'Sun, Jul 5, 2026' : o.date}
                      </div>
                    </div>
                  </div>

                  {/* Ticket Meal Items Row */}
                  <div className="p-4 flex justify-between items-start border-b border-[#e7e9f0]">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-[#9099ab] tracking-wider uppercase mt-1">
                      <Utensils size={15} className="text-[#9099ab]" />
                      <span>Your Meal Items</span>
                    </div>
                    <div className="text-right font-medium text-[#16274D] text-[13.5px] space-y-1">
                      {mealItems.map((dish, di) => (
                        <div key={di} className="leading-tight">{dish}</div>
                      ))}
                      {mealItems.length === 0 && <div className="text-gray-400 italic">None selected</div>}
                    </div>
                  </div>

                  {/* Ticket Extras Row */}
                  <div className="p-4 flex justify-between items-start">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-[#9099ab] tracking-wider uppercase mt-1">
                      <CheckCircle2 size={15} className="text-[#9099ab]" />
                      <span>Comes With Your Meal</span>
                    </div>
                    <div className="text-right font-medium text-[#16274D] text-[13.5px] space-y-1">
                      {accompaniments.map((dish, di) => (
                        <div key={di} className="leading-tight">{dish}</div>
                      ))}
                      {accompaniments.length === 0 && <div className="text-gray-400 italic">None</div>}
                    </div>
                  </div>

                  {/* Ticket Observations Row */}
                  <div className="p-4 bg-[#f8fafc] border-t border-[#e7e9f0] flex flex-col md:flex-row justify-between items-start gap-3">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-[#b9770b] tracking-wider uppercase mt-1">
                      <Stethoscope size={15} className="text-[#b9770b]" />
                      <span>Clinical Observation</span>
                    </div>
                    <div className="text-right text-[12.5px] text-[#5d6678] max-w-[320px]">
                      <div className="font-semibold text-[#16274D]">
                        Vitals: BP {info.obs.vitals.bp} · HR {info.obs.vitals.hr} · Temp {info.obs.vitals.temp}°C · SpO2 {info.obs.vitals.spo2}%
                      </div>
                      <div className="mt-1">
                        Pain Score: <span className="font-semibold text-[#16274D]">{info.obs.painLevel}/10</span>
                        {info.activeRisks.length > 0 && (
                          <>
                            {' · Risks: '}
                            <span className="font-semibold text-red-600">{info.activeRisks.join(', ')}</span>
                          </>
                        )}
                      </div>
                      {info.obs.nurseNotes && (
                        <div className="mt-1 text-[11.5px] italic text-[#718096] bg-white p-2 rounded-md border border-[#e7e9f0] text-left">
                          "{info.obs.nurseNotes}"
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Print rendering area (hidden on screen, visible during browser print) */}
      <div id="print-area" className="hidden">
        {printingOrders.map((o, idx) => {
          const isCompanion = o.name.toLowerCase().includes('companion');
          const info = getDeviceAndOccupancy(o, idx);

          // Categorize lines
          const mealItems: string[] = [];
          const accompaniments: string[] = [];

          (o.lines || []).forEach(([section, dish]: [string, string]) => {
            if (isAccompaniment(section, dish)) {
              accompaniments.push(dish);
            } else {
              mealItems.push(dish);
            }
          });

          // Fetch patient allergies
          const patientObj = db.patients.find((p: any) => p.name === o.name);
          const allergiesList = isCompanion
            ? 'None'
            : patientObj && patientObj.allergies.length > 0
            ? patientObj.allergies.join(', ')
            : 'None';

          const headerBg = isCompanion ? 'bg-[#fdf0f2]' : 'bg-[#eaf5fa]';
          const headerText = isCompanion ? 'text-[#d11a47]' : 'text-[#0a84b1]';
          const avatarBg = isCompanion ? 'bg-[#d11a47]' : 'bg-[#0a84b1]';

          return (
            <div key={o.id} className="print-ticket-page max-w-[650px] mx-auto">
              <div className="border border-[#e7e9f0] rounded-[14px] bg-white shadow-sm overflow-hidden">
                {/* Ticket Header */}
                <div className={cx("flex items-center justify-between p-5 border-b border-[#e7e9f0]", headerBg)}>
                  <div className="flex items-center">
                    <div className={cx("w-12 h-12 rounded-full flex items-center justify-center text-white", avatarBg)}>
                      <User size={22} />
                    </div>
                    <div className="ml-4 text-left">
                      <div className="font-bold text-[#16274D] text-[17px]">
                        {isCompanion ? 'For Companion' : `For ${info.patientName}`} · {info.locationDetails}
                      </div>
                      <div className="text-[13px] text-[#5d6678] font-medium mt-1">
                        Diet: {o.diet} · Allergens: {allergiesList} {info.mrn && `· MRN: ${info.mrn}`} {info.deviceId && `· Device ID: ${info.deviceId}`}
                      </div>
                    </div>
                  </div>
                  <div className={cx("font-bold text-[16px]", headerText)}>
                    Order ID: ##{o.id.replace('ORD-', '')}
                  </div>
                </div>

                {/* Ticket Delivery Row */}
                <div className="p-5 flex justify-between items-start border-b border-[#e7e9f0]">
                  <div className="flex items-center gap-2 text-[12px] font-bold text-[#9099ab] tracking-wider uppercase mt-1">
                    <Clock size={16} className="text-[#9099ab]" />
                    <span>Delivery Time</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-[#16274D] text-[15px]">
                      {o.meal} ({o.meal === 'Breakfast' ? '8:00 AM – 9:00 AM' : o.meal === 'Lunch' ? '1:00 PM – 2:00 PM' : '6:00 PM – 7:30 PM'})
                    </div>
                    <div className="text-[13px] text-[#5d6678] mt-0.5">
                      {o.date === 'Today' ? 'Sun, Jul 5, 2026' : o.date}
                    </div>
                  </div>
                </div>

                {/* Ticket Meal Items Row */}
                <div className="p-5 flex justify-between items-start border-b border-[#e7e9f0]">
                  <div className="flex items-center gap-2 text-[12px] font-bold text-[#9099ab] tracking-wider uppercase mt-1">
                    <Utensils size={16} className="text-[#9099ab]" />
                    <span>Your Meal Items</span>
                  </div>
                  <div className="text-right font-medium text-[#16274D] text-[15px] space-y-1">
                    {mealItems.map((dish, di) => (
                      <div key={di}>{dish}</div>
                    ))}
                    {mealItems.length === 0 && <div className="text-gray-400 italic">None selected</div>}
                  </div>
                </div>

                {/* Ticket Extras Row */}
                <div className="p-5 flex justify-between items-start border-b border-[#e7e9f0]">
                  <div className="flex items-center gap-2 text-[12px] font-bold text-[#9099ab] tracking-wider uppercase mt-1">
                    <CheckCircle2 size={16} className="text-[#9099ab]" />
                    <span>Comes With Your Meal</span>
                  </div>
                  <div className="text-right font-medium text-[#16274D] text-[15px] space-y-1">
                    {accompaniments.map((dish, di) => (
                      <div key={di}>{dish}</div>
                    ))}
                    {accompaniments.length === 0 && <div className="text-gray-400 italic">None</div>}
                  </div>
                </div>

                {/* Ticket Observations Row */}
                <div className="p-5 bg-[#f8fafc] border-t border-[#e7e9f0] flex flex-col md:flex-row justify-between items-start gap-3">
                  <div className="flex items-center gap-2 text-[12px] font-bold text-[#b9770b] tracking-wider uppercase mt-1">
                    <Stethoscope size={16} className="text-[#b9770b]" />
                    <span>Clinical Observation</span>
                  </div>
                  <div className="text-right text-[13px] text-[#5d6678] max-w-[320px]">
                    <div className="font-semibold text-[#16274D]">
                      Vitals: BP {info.obs.vitals.bp} · HR {info.obs.vitals.hr} · Temp {info.obs.vitals.temp}°C · SpO2 {info.obs.vitals.spo2}%
                    </div>
                    <div className="mt-1">
                      Pain Score: <span className="font-semibold text-[#16274D]">{info.obs.painLevel}/10</span>
                      {info.activeRisks.length > 0 && (
                        <>
                          {' · Risks: '}
                          <span className="font-semibold text-red-600">{info.activeRisks.join(', ')}</span>
                        </>
                      )}
                    </div>
                    {info.obs.nurseNotes && (
                      <div className="mt-1 text-[12px] italic text-[#718096] bg-white p-2.5 rounded-md border border-[#e7e9f0] text-left">
                        "{info.obs.nurseNotes}"
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </FoodPage>
  );
}
