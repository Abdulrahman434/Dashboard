import { ChefHat, Tablet, Printer, Check, CheckCheck } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useFood, updateFood } from './foodStore';
import { cx, Btn, Badge, StatusBadge, Card, FoodPage } from './foodAtoms';

export default function KitchenPage({ onNavigate }: { onNavigate: (route: string) => void }) {
  const db = useFood();

  // Advance an order along its lifecycle: Submitted -> Printed -> Delivered.
  const advance = (i: number) => {
    let newStatus = '';
    updateFood((d: any) => {
      const o = d.orders[i];
      newStatus = o.status === 'Submitted' ? 'Printed' : 'Delivered';
      o.status = newStatus;
    });
    toast(newStatus === 'Printed' ? 'Ticket printed' : 'Marked delivered');
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

  // ---- queue ---------------------------------------------------------------

  const counts = db.orders.reduce(
    (acc: any, o: any) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    },
    { Submitted: 0, Printed: 0, Delivered: 0 },
  );

  return (
    <FoodPage current="kit" onNavigate={onNavigate}>
      <Card className="mb-3.5">
        <div className="flex items-start justify-between gap-3 px-5 py-[18px]">
          <div className="min-w-0">
            <div className="font-['Poppins',sans-serif] font-semibold text-[18px] text-[#16274D]">
              Kitchen queue
            </div>
            <div className="text-[13px] text-[#5d6678] mt-0.5">
              {db.orders.length} orders · {counts.Submitted} new, {counts.Printed} printing,{' '}
              {counts.Delivered} delivered
            </div>
          </div>
          <div className="flex-shrink-0">
            <Btn variant="neutral" onClick={() => onNavigate('food-kiosk')}>
              <Tablet size={16} />
              Add an order
            </Btn>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {db.orders.map((o: any, i: number) => {
          // Group this order's lines by section, preserving encounter order.
          const bySec: Record<string, string[]> = {};
          const secOrder: string[] = [];
          (o.lines || []).forEach(([section, dish]: [string, string]) => {
            if (!bySec[section]) {
              bySec[section] = [];
              secOrder.push(section);
            }
            bySec[section].push(dish);
          });

          return (
            <div
              key={o.id}
              className="rounded-[14px] border border-[#e7e9f0] bg-white shadow-[0_1px_2px_rgba(22,39,77,.05),0_1px_3px_rgba(22,39,77,.04)] overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 bg-[#16274D] text-white">
                <div className="min-w-0">
                  <div className="font-semibold">
                    Room {o.room} · Bed {o.bed}
                  </div>
                  <div className="text-[#bcd0ee] text-[13px]">
                    {o.name} · {o.id}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-semibold">{o.meal}</div>
                  <div className="text-[#bcd0ee] text-[13px]">
                    {o.date} · {o.time}
                  </div>
                </div>
              </div>

              <div className="px-4 py-3.5">
                <div className="flex justify-between items-center mb-1.5">
                  <Badge tone="info">{o.diet}</Badge>
                  <StatusBadge status={o.status} />
                </div>

                {secOrder.map((section) => (
                  <div key={section}>
                    <div className="text-[11.5px] uppercase tracking-wide text-[#9099ab] mt-2 mb-1">
                      {section}
                    </div>
                    {bySec[section].map((dish, di) => (
                      <div
                        key={di}
                        className={cx(
                          'flex justify-between py-1 text-[13.5px] border-b border-dashed border-[#e7e9f0]',
                          di === bySec[section].length - 1 && 'border-b-0',
                        )}
                      >
                        <span>{dish}</span>
                      </div>
                    ))}
                  </div>
                ))}

                <div className="mt-3 flex justify-end">
                  {o.status === 'Submitted' && (
                    <Btn variant="accent" onClick={() => advance(i)}>
                      <Printer size={16} />
                      Print ticket
                    </Btn>
                  )}
                  {o.status === 'Printed' && (
                    <Btn variant="primary" onClick={() => advance(i)}>
                      <Check size={16} />
                      Mark delivered
                    </Btn>
                  )}
                  {o.status === 'Delivered' && (
                    <Badge tone="ok">
                      <CheckCheck size={14} />
                      Delivered
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </FoodPage>
  );
}
