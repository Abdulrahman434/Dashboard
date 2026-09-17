/**
 * MealTicketDecor — the playful layer for a pediatric patient's meal ticket.
 *
 * Separate from the diet colour by design: a child on any diet gets these, and
 * the ticket keeps that diet's colour on its group rules and the
 * "Patient / مريض" role.
 *
 * The art is full-colour and sits in the MARGINS — the padding band and the
 * gaps around the header and footer — rather than washed out behind the text.
 * Low-opacity shapes under the copy read as stains on paper; cheerful drawings
 * around the edge read as a kids' menu and leave the meal perfectly legible.
 * All inline SVG, so nothing external can fail at print time.
 */

const svg = (children: any) => (
  <svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden>{children}</svg>
);

const Carrot = () => svg(<>
  <path d="M24 44 15 21c-1-2.6 2.2-4.6 9-4.6s10 2 9 4.6L24 44z" fill="#F0913F" />
  <path d="M18 26h12M19.5 33h9" stroke="#D9762A" strokeWidth="1.6" strokeLinecap="round" />
  <path d="M24 17V8M19 17l-5-6M29 17l5-6" stroke="#6FA85C" strokeWidth="3" strokeLinecap="round" />
</>);

const Pear = () => svg(<>
  <path d="M24 16c5 0 9 5 9 12s-4 13-9 13-9-6-9-13 4-12 9-12z" fill="#A8C95F" />
  <path d="M24 16c0-4 2-7 5-8" stroke="#7E9B46" strokeWidth="2" fill="none" strokeLinecap="round" />
  <ellipse cx="30" cy="8" rx="4" ry="2.2" fill="#6FA85C" transform="rotate(-20 30 8)" />
</>);

const Apple = () => svg(<>
  <path d="M24 15c-6 0-11 5-11 12s5 14 11 14 11-7 11-14-5-12-11-12z" fill="#E96A63" />
  <path d="M24 15c0-3 2-5 5-6" stroke="#7E9B46" strokeWidth="2" fill="none" strokeLinecap="round" />
  <ellipse cx="30" cy="8" rx="4" ry="2.2" fill="#6FA85C" transform="rotate(-20 30 8)" />
</>);

const Cloud = () => svg(<>
  <path d="M13 32a7 7 0 0 1 1-13.9A10 10 0 0 1 33 19a6.5 6.5 0 0 1 2 13H13z" fill="#BEDCEF" />
</>);

const Star = () => svg(<>
  <path d="M24 6l5 12 13 1-10 8 3 13-11-7-11 7 3-13-10-8 13-1z" fill="#F5C242" />
</>);

const Sprig = () => svg(<>
  <path d="M24 44V10" stroke="#6FA85C" strokeWidth="2.2" strokeLinecap="round" />
  <ellipse cx="16" cy="32" rx="7" ry="4" fill="#8DBE6A" transform="rotate(25 16 32)" />
  <ellipse cx="32" cy="26" rx="7" ry="4" fill="#A8C95F" transform="rotate(-25 32 26)" />
  <ellipse cx="17" cy="20" rx="6" ry="3.5" fill="#A8C95F" transform="rotate(25 17 20)" />
</>);

const SoupBowl = () => svg(<>
  <path d="M9 26h30c0 9-6 14-15 14S9 35 9 26z" fill="#9CC7DE" />
  <rect x="6" y="23" width="36" height="4.5" rx="2.2" fill="#7FB3CE" />
  <path d="M18 17c-2-2 2-4 0-6M24 15c-2-2 2-4 0-6M30 17c-2-2 2-4 0-6" stroke="#CBD8E1" strokeWidth="1.8" fill="none" strokeLinecap="round" />
</>);

const Toast = () => svg(<>
  <path d="M12 19c0-5 5-9 12-9s12 4 12 9v18a3 3 0 0 1-3 3H15a3 3 0 0 1-3-3V19z" fill="#F2CE93" />
  <path d="M17 22c0-3 3-5 7-5s7 2 7 5v13H17V22z" fill="#E5B368" />
</>);

const Juice = () => svg(<>
  <path d="M15 16h18l-2.5 24a3 3 0 0 1-3 2.6h-7A3 3 0 0 1 17.5 40L15 16z" fill="#F7A85C" />
  <path d="M15 16h18l-.6 6H15.6L15 16z" fill="#F5C242" />
  <rect x="27" y="7" width="2.6" height="12" rx="1.3" fill="#E96A63" transform="rotate(14 28 13)" />
</>);

const Cupcake = () => svg(<>
  <path d="M14 27h20l-3 14H17l-3-14z" fill="#F0B1B6" />
  <path d="M14 27c0-6 4-10 10-10s10 4 10 10H14z" fill="#F5E2C0" />
  <circle cx="24" cy="14" r="3" fill="#E96A63" />
</>);

const ART = { Carrot, Pear, Apple, Cloud, Star, Sprig, SoupBowl, Toast, Juice, Cupcake };
type ArtKey = keyof typeof ART;

/** Four-point sparkle, used in the header band. */
export function Sparkle({ size = 2.4, color = '#FFFFFF', opacity = 0.9 }: { size?: number; color?: string; opacity?: number }) {
  return (
    <svg width={`${size}mm`} height={`${size}mm`} viewBox="0 0 12 12" style={{ opacity }} aria-hidden>
      <path d="M6 0c.5 3.3 2.2 5 5.5 6-3.3 1-5 2.7-5.5 6-.5-3.3-2.2-5-5.5-6 3.3-1 5-2.7 5.5-6z" fill={color} />
    </svg>
  );
}

// Hand-placed along the margins: the top band above the header, the outer
// edges, and the strip beside the footer. Nothing sits over a line of text.
// Fixed rather than random so every reprint is identical.
const SCATTER: [ArtKey, number, number, number, number][] = [
  // [art, left %, top %, size mm, rotation deg]
  ['Carrot', 1, 0.5, 9, -20],   ['Star', 16, 1, 5, 12],      ['Cloud', 58, 0.5, 8, 0],
  ['Pear', 70, 1.5, 8, 14],     ['Apple', 88, 0.5, 8, -12],  ['Star', 80, 5, 4.5, -8],
  ['Sprig', -3, 14, 10, 18],    ['Sprig', 93, 13, 10, -22],
  ['Sprig', -4, 46, 11, -12],   ['Star', 95, 40, 4, 16],
  ['Sprig', 94, 58, 10, 24],    ['Cloud', -2, 66, 7, 0 ],
  ['SoupBowl', 2, 88, 11, -8],  ['Sprig', 20, 90, 9, 14],
  ['Toast', 42, 89, 9, 10],     ['Star', 57, 87, 4.5, -14],
  ['Juice', 72, 88, 9, -6],     ['Cupcake', 88, 91, 9, 12],
];

/** Colourful margin decoration for a pediatric ticket. */
export function PediatricBackdrop() {
  return (
    <div aria-hidden className="mt-backdrop" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {SCATTER.map(([k, x, y, size, rot], i) => {
        const Art = ART[k];
        return (
          <div
            key={i}
            style={{
              position: 'absolute', left: `${x}%`, top: `${y}%`,
              width: `${size}mm`, height: `${size}mm`,
              transform: `rotate(${rot}deg)`, opacity: 0.9,
            }}
          >
            <Art />
          </div>
        );
      })}
    </div>
  );
}

/** Sparkles laid over the meal header band. */
export function HeaderSparkles({ onLight = false }: { onLight?: boolean }) {
  // On a white pediatric header, white sparkles would vanish.
  const cols = onLight ? ['#F5C242', '#E96A63', '#8DBE6A'] : ['#FFFFFF', '#FFFFFF', '#FFFFFF'];
  return (
    <span aria-hidden style={{ display: 'inline-flex', alignItems: 'center', gap: '0.8mm', marginLeft: '2mm' }}>
      <Sparkle size={2.6} color={cols[0]} opacity={0.95} />
      <Sparkle size={1.6} color={cols[1]} opacity={0.85} />
      <Sparkle size={2} color={cols[2]} opacity={0.9} />
    </span>
  );
}
