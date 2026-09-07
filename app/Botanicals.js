/**
 * Botanicke vetvicky kreslene ciarou, v duchu svadobnej pozvanky.
 * Vlastna kresba, ziadny externy obrazok - takze sa nic nedonacitava
 * a skaluje sa to do akejkolvek velkosti.
 */

function Sprig({ flip }) {
  return (
    <svg
      viewBox="0 0 120 200"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      style={flip ? { transform: 'scaleX(-1)' } : undefined}
      aria-hidden="true"
    >
      {/* hlavny stonok */}
      <path d="M62 196 C 58 150, 52 108, 44 66 C 40 44, 34 24, 26 8" />

      {/* listy vlavo */}
      <path d="M56 168 C 40 166, 28 156, 24 142 C 38 140, 52 150, 56 168 Z" />
      <path d="M50 140 C 34 138, 22 128, 18 114 C 32 112, 46 122, 50 140 Z" />
      <path d="M45 112 C 30 110, 19 100, 15 87 C 28 85, 41 95, 45 112 Z" />
      <path d="M39 84 C 26 82, 16 73, 13 61 C 25 59, 36 68, 39 84 Z" />
      <path d="M33 56 C 22 54, 14 46, 11 36 C 21 34, 30 42, 33 56 Z" />

      {/* listy vpravo */}
      <path d="M59 182 C 74 178, 86 166, 88 152 C 74 152, 62 164, 59 182 Z" />
      <path d="M53 154 C 68 150, 79 139, 81 125 C 68 125, 56 136, 53 154 Z" />
      <path d="M47 126 C 61 122, 71 111, 73 98 C 61 98, 50 109, 47 126 Z" />
      <path d="M42 98 C 55 94, 64 84, 65 72 C 54 72, 44 82, 42 98 Z" />
      <path d="M36 70 C 47 66, 55 57, 56 46 C 46 46, 38 55, 36 70 Z" />
      <path d="M30 42 C 39 39, 46 31, 47 22 C 38 22, 31 30, 30 42 Z" />
    </svg>
  );
}

function Berries({ flip }) {
  return (
    <svg
      viewBox="0 0 120 200"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      style={flip ? { transform: 'scaleX(-1)' } : undefined}
      aria-hidden="true"
    >
      <path d="M70 198 C 66 156, 62 116, 54 78 C 50 56, 44 32, 36 12" />

      {/* vetvicky s bobulkami */}
      <path d="M62 160 C 76 152, 86 140, 90 126" />
      <path d="M56 128 C 70 120, 80 108, 84 94" />
      <path d="M50 96 C 62 88, 71 77, 75 64" />
      <path d="M44 64 C 55 57, 63 47, 66 36" />

      <circle cx="90" cy="124" r="3" />
      <circle cx="98" cy="132" r="2.4" />
      <circle cx="84" cy="116" r="2.2" />
      <circle cx="84" cy="92" r="3" />
      <circle cx="92" cy="100" r="2.4" />
      <circle cx="78" cy="84" r="2.2" />
      <circle cx="75" cy="62" r="2.8" />
      <circle cx="83" cy="69" r="2.2" />
      <circle cx="69" cy="55" r="2" />
      <circle cx="66" cy="34" r="2.6" />
      <circle cx="73" cy="40" r="2" />

      {/* jemne bodky navyse */}
      <circle cx="46" cy="150" r="1.4" />
      <circle cx="40" cy="120" r="1.4" />
      <circle cx="35" cy="90" r="1.4" />
    </svg>
  );
}

export function BotanicalTopRight() {
  return (
    <div className="botanical botanical--tr">
      <Berries />
    </div>
  );
}

export function BotanicalBottomLeft() {
  return (
    <div className="botanical botanical--bl">
      <Sprig flip />
    </div>
  );
}
