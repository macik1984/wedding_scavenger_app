/**
 * Fotoaparat kresleny ciarou, v rovnakom style ako botanicke vetvicky.
 * Malym plusom naznacuje, ze sa tu nieco pridava - aby bolo na prvy pohlad
 * jasne, ze na plochu sa da klepnut.
 */
export default function CameraIcon() {
  return (
    <svg
      className="icon"
      viewBox="0 0 52 42"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* telo */}
      <rect x="2.5" y="10.5" width="47" height="29" rx="3.5" />

      {/* hladacik */}
      <path d="M17 10.5 L20.5 4.5 L31.5 4.5 L35 10.5" />

      {/* objektiv */}
      <circle cx="26" cy="25" r="9" />
      <circle cx="26" cy="25" r="5.2" />

      {/* blesk */}
      <circle cx="42" cy="16.5" r="1.4" />

      {/* plus - pridavame */}
      <path d="M8.5 17.5 L8.5 23.5 M5.5 20.5 L11.5 20.5" />
    </svg>
  );
}
