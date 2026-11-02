const FINGER_NAMES = [
  "pinky",
  "ring",
  "middle",
  "index",
  "thumb",
] as const;

type FingerName = (typeof FINGER_NAMES)[number];
type HandSide = "left" | "right";

const KEY_FINGER: Record<string, { side: HandSide; finger: FingerName }> = {
  "1": { side: "left", finger: "pinky" },
  "2": { side: "left", finger: "ring" },
  "3": { side: "left", finger: "middle" },
  "4": { side: "left", finger: "index" },
  "5": { side: "left", finger: "index" },
  "6": { side: "right", finger: "index" },
  "7": { side: "right", finger: "index" },
  "8": { side: "right", finger: "middle" },
  "9": { side: "right", finger: "ring" },
  "0": { side: "right", finger: "pinky" },
  q: { side: "left", finger: "pinky" },
  a: { side: "left", finger: "pinky" },
  z: { side: "left", finger: "pinky" },
  w: { side: "left", finger: "ring" },
  s: { side: "left", finger: "ring" },
  x: { side: "left", finger: "ring" },
  e: { side: "left", finger: "middle" },
  d: { side: "left", finger: "middle" },
  c: { side: "left", finger: "middle" },
  r: { side: "left", finger: "index" },
  t: { side: "left", finger: "index" },
  f: { side: "left", finger: "index" },
  g: { side: "left", finger: "index" },
  v: { side: "left", finger: "index" },
  b: { side: "left", finger: "index" },
  y: { side: "right", finger: "index" },
  u: { side: "right", finger: "index" },
  h: { side: "right", finger: "index" },
  j: { side: "right", finger: "index" },
  n: { side: "right", finger: "index" },
  m: { side: "right", finger: "index" },
  i: { side: "right", finger: "middle" },
  k: { side: "right", finger: "middle" },
  ",": { side: "right", finger: "middle" },
  o: { side: "right", finger: "ring" },
  l: { side: "right", finger: "ring" },
  ".": { side: "right", finger: "ring" },
  p: { side: "right", finger: "pinky" },
  ";": { side: "right", finger: "pinky" },
  "/": { side: "right", finger: "pinky" },
};

interface Props {
  nextKey: string | null;
}

function Hand({ side, active }: { side: HandSide; active: FingerName | null }) {
  const mirrored = side === "right";

  return (
    <svg
      className={`hand-illustration ${mirrored ? "hand-right" : "hand-left"}`}
      viewBox="0 0 170 150"
      role="img"
      aria-label={`${side} hand finger guide${active ? `, ${active} finger highlighted` : ""}`}
    >
      <path
        className="hand-palm"
        d="M37 69 C37 60 43 56 50 59 L57 63 L61 48 C63 41 73 42 74 50 L76 61 L81 38 C83 30 94 32 95 40 L96 61 L102 45 C105 37 116 41 115 49 L112 67 L120 56 C125 49 136 55 132 64 L121 94 C117 109 106 120 92 124 L65 126 C48 124 39 111 37 96 Z"
      />
      <path className="hand-wrist" d="M64 120 L62 145 L101 145 L95 120 Z" />
      <g className={`hand-finger finger-${side}-pinky${active === "pinky" ? " active" : ""}`}>
        <path d="M48 62 L42 45 C40 38 31 41 33 48 L39 70" />
        <circle cx="38" cy="48" r="3" />
      </g>
      <g className={`hand-finger finger-${side}-ring${active === "ring" ? " active" : ""}`}>
        <path d="M61 61 L57 31 C56 23 67 22 68 30 L72 62" />
        <circle cx="62" cy="30" r="3" />
      </g>
      <g className={`hand-finger finger-${side}-middle${active === "middle" ? " active" : ""}`}>
        <path d="M78 59 L78 22 C78 14 90 14 91 23 L91 61" />
        <circle cx="84" cy="22" r="3" />
      </g>
      <g className={`hand-finger finger-${side}-index${active === "index" ? " active" : ""}`}>
        <path d="M98 62 L102 33 C103 25 114 27 113 35 L109 68" />
        <circle cx="108" cy="34" r="3" />
      </g>
      <g className={`hand-finger hand-thumb finger-${side}-thumb${active === "thumb" ? " active" : ""}`}>
        <path d="M120 59 L137 47 C144 42 151 51 144 57 L124 76" />
        <circle cx="142" cy="51" r="3" />
      </g>
    </svg>
  );
}

export default function HandGuide({ nextKey }: Props) {
  const target =
    nextKey === null
      ? undefined
      : nextKey === " "
        ? { side: "right" as const, finger: "thumb" as const }
        : KEY_FINGER[nextKey.toLowerCase()];
  const fingerLabel = target
    ? target.finger === "thumb"
      ? `${target.side} thumb`
      : `${target.side} ${target.finger} finger`
    : nextKey === " "
      ? "thumb"
      : null;

  return (
    <section className="hands-guide" aria-label="Hand and finger position guide">
      <div className="hands-title">
        <span className="hands-title-mark" aria-hidden="true">✦</span>
        <div>
          <h3>Finger position</h3>
          <p>
            {target
              ? `Use your ${fingerLabel} for ${nextKey === " " ? "the space bar" : `"${nextKey}"`}`
              : "Both hands return to the home row"}
          </p>
        </div>
      </div>
      <div className="hands-art">
        <div className="hand-wrap">
          <Hand
            side="left"
            active={target?.side === "left" ? target.finger : null}
          />
          <span>LEFT HAND</span>
        </div>
        <div className="hands-divider" aria-hidden="true" />
        <div className="hand-wrap">
          <Hand
            side="right"
            active={target?.side === "right" ? target.finger : null}
          />
          <span>RIGHT HAND</span>
        </div>
      </div>
      <div className="home-row-note">
        <span className="home-row-dot" />
        Keep your fingers relaxed over the home row
      </div>
    </section>
  );
}
