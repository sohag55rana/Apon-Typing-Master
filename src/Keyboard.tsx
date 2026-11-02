const ROWS: string[] = ["1234567890", "qwertyuiop", "asdfghjkl;", "zxcvbnm,./"];

const FINGERS: Record<string, string> = {
  "1": "left pinky",
  "2": "left ring finger",
  "3": "left middle finger",
  "4": "left index finger",
  "5": "left index finger",
  "6": "right index finger",
  "7": "right index finger",
  "8": "right middle finger",
  "9": "right ring finger",
  "0": "right pinky",
  q: "left pinky",
  w: "left ring finger",
  e: "left middle finger",
  r: "left index finger",
  t: "left index finger",
  y: "right index finger",
  u: "right index finger",
  i: "right middle finger",
  o: "right ring finger",
  p: "right pinky",
  a: "left pinky",
  s: "left ring finger",
  d: "left middle finger",
  f: "left index finger",
  g: "left index finger",
  h: "right index finger",
  j: "right index finger",
  k: "right middle finger",
  l: "right ring finger",
  ";": "right pinky",
  z: "left pinky",
  x: "left ring finger",
  c: "left middle finger",
  v: "left index finger",
  b: "left index finger",
  n: "right index finger",
  m: "right index finger",
  ",": "right middle finger",
  ".": "right ring finger",
  "/": "right pinky",
};

interface Props {
  /** The character the learner must type next, or null when finished */
  nextKey: string | null;
  /** Keys used in this lesson */
  lessonKeys: string;
  /** The most recently typed key, briefly highlighted when correct */
  correctKey: string | null;
  /** The most recently mistyped key, shown briefly for feedback */
  wrongKey: string | null;
}

export default function Keyboard({
  nextKey,
  lessonKeys,
  correctKey,
  wrongKey,
}: Props) {
  const next = nextKey === null ? null : nextKey.toLowerCase();
  const finger = next && next !== " " ? FINGERS[next] : undefined;

  return (
    <section
      className="keyboard"
      aria-label="On-screen keyboard and finger guide"
    >
      <div className="keyboard-heading">
        <div>
          <h3>Keyboard guide</h3>
        </div>
      </div>
      {ROWS.map((row, r) => (
        <div key={row} className={`kb-row kb-row-${r}`}>
          {row.split("").map((k) => {
            let cls = "key";
            const fingerClass = FINGERS[k]
              ?.replace(" finger", "")
              .replace(" ", "-");
            if (fingerClass) cls += ` finger-${fingerClass}`;
            if (lessonKeys.includes(k)) cls += " in-lesson";
            if (k === next) cls += " next";
            if (k === correctKey) cls += " correct";
            if (k === wrongKey) cls += " error";
            return (
              <span key={k} className={cls}>
                {k}
              </span>
            );
          })}
        </div>
      ))}
      <div className="kb-row">
        <span
          className={`key space finger-right-thumb${next === " " ? " next" : ""}${correctKey === " " ? " correct" : ""}${wrongKey === " " ? " error" : ""}`}
        >
          space
        </span>
      </div>
      <p className="finger-hint">
        {next === " "
          ? "Press the space bar with your thumb."
          : finger
            ? `Use your ${finger} for "${next}".`
            : "\u00A0"}
      </p>
    </section>
  );
}
