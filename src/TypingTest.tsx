import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import HandGuide from "./HandGuide";
import Keyboard from "./Keyboard";
import { playTypingSound } from "./typingSounds";
import { usePassageAutoScroll } from "./usePassageAutoScroll";

const PASSAGES = [
  "Learning a new skill takes patience, practice, and a little curiosity. Start slowly, focus on accuracy, and let your confidence grow with every line. The best progress often comes from small improvements repeated each day.",
  "A quiet morning can be the perfect time to think clearly and make a plan. Choose one useful task, give it your full attention, and take a short break when you need one. Consistent effort turns good intentions into lasting habits.",
  "Technology helps people share ideas, solve problems, and work together across long distances. The most useful tools are the ones that feel simple, reliable, and accessible to everyone who needs them.",
  "When a project feels difficult, break it into smaller steps. Finish one part, check your progress, and decide what to do next. A clear plan makes complicated work feel more manageable.",
  "Books, music, and conversation can open a window onto a different point of view. Take time to listen, ask thoughtful questions, and stay open to ideas that are new to you.",
  "A healthy routine does not need to be complicated. Get enough rest, drink water throughout the day, and make room for a little movement. Simple choices can support steady energy.",
  "Every useful invention begins with someone noticing a problem. Careful observation helps people understand what is missing and create practical solutions that make daily life easier.",
  "A good team makes space for different strengths. Share information clearly, offer help when you can, and give others the time they need to do their best work.",
  "The natural world rewards close attention. A change in the weather, the shape of a leaf, or the sound of birds can reveal details that are easy to miss when we hurry.",
  "Learning takes time, and mistakes are part of the process. Notice what went wrong, adjust your approach, and try again. Each attempt gives you useful information for the next one.",
  "A welcoming workspace helps people concentrate. Keep the tools you need nearby, remove distractions where possible, and take a moment to reset between demanding tasks.",
  "Clear communication starts with a simple idea. Choose words carefully, organize your thoughts, and give the reader enough context to understand what matters.",
  "Good writing is built one clear sentence at a time. Read carefully, notice the rhythm of each phrase, and keep your hands relaxed as you type. Accuracy is a strong foundation for speed.",
];

function createPassage(): string {
  const first = Math.floor(Math.random() * PASSAGES.length);
  return Array.from(
    { length: PASSAGES.length },
    (_, index) => PASSAGES[(first + index) % PASSAGES.length],
  ).join(" ");
}

interface Props {
  attempt: number;
  onRestart: () => void;
}

type Sound = "key" | "error" | "word" | "finish";

export default function TypingTest({ attempt, onRestart }: Props) {
  const [text, setText] = useState<string>(createPassage);
  const [typed, setTyped] = useState("");
  const [finished, setFinished] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [correctKey, setCorrectKey] = useState<string | null>(null);
  const [wrongKey, setWrongKey] = useState<string | null>(null);
  const { passageRef, currentCharRef } = usePassageAutoScroll(typed);
  const audioContextRef = useRef<AudioContext | null>(null);
  const finishSoundPlayedRef = useRef(false);
  const correctKeyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrongKeyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextKey = finished ? null : text[typed.length] ?? null;

  useEffect(() => {
    passageRef.current?.focus();
  }, []);

  useEffect(
    () => () => {
      if (wrongKeyTimeoutRef.current !== null) {
        clearTimeout(wrongKeyTimeoutRef.current);
      }
      if (correctKeyTimeoutRef.current !== null) {
        clearTimeout(correctKeyTimeoutRef.current);
      }
      if (audioContextRef.current) {
        void audioContextRef.current.close();
      }
    },
    [],
  );

  useEffect(() => {
    if (attempt === 0) return;
    setText(createPassage());
    setTyped("");
    setFinished(false);
    setCorrectKey(null);
    setWrongKey(null);
    if (correctKeyTimeoutRef.current !== null) {
      clearTimeout(correctKeyTimeoutRef.current);
    }
    if (wrongKeyTimeoutRef.current !== null) {
      clearTimeout(wrongKeyTimeoutRef.current);
    }
    finishSoundPlayedRef.current = false;
    passageRef.current?.focus();
  }, [attempt]);

  useEffect(() => {
    if (!finished || finishSoundPlayedRef.current) return;
    finishSoundPlayedRef.current = true;
    playSound("finish");
  }, [finished]);

  function playSound(sound: Sound) {
    if (!soundEnabled || typeof window.AudioContext === "undefined") return;
    const audioContext = audioContextRef.current ?? new window.AudioContext();
    audioContextRef.current = audioContext;
    void audioContext.resume();
    playTypingSound(audioContext, sound);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;

    if (event.key === "Backspace") {
      if (!finished) {
        event.preventDefault();
        if (typed.length > 0) setTyped(typed.slice(0, -1));
      }
      return;
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      return;
    }

    if (finished || event.key.length !== 1 || typed.length >= text.length) return;
    event.preventDefault();

    const isCorrect = event.key === text[typed.length];
    const lastKey = event.key.toLowerCase();
    playSound(isCorrect ? "key" : "error");
    if (event.key === " ") playSound("word");

    if (wrongKeyTimeoutRef.current !== null) {
      clearTimeout(wrongKeyTimeoutRef.current);
    }
    if (correctKeyTimeoutRef.current !== null) {
      clearTimeout(correctKeyTimeoutRef.current);
    }
    setWrongKey(isCorrect ? null : lastKey);
    setCorrectKey(isCorrect ? lastKey : null);
    if (isCorrect) {
      correctKeyTimeoutRef.current = setTimeout(
        () => setCorrectKey(null),
        700,
      );
    } else {
      wrongKeyTimeoutRef.current = setTimeout(() => setWrongKey(null), 700);
    }

    const value = typed + event.key;
    setTyped(value);
    if (value.length === text.length) setFinished(true);
  }

  return (
    <div className="typing-test">
      <header className="test-header">
        <div>
          <p className="eyebrow">SPEED &amp; ACCURACY</p>
          <h2>Typing test</h2>
          <p className="sub">
            Find your rhythm. Focus on accuracy and let your speed follow.
          </p>
        </div>
        <button
          className={`sound-toggle${soundEnabled ? " is-on" : ""}`}
          type="button"
          onClick={() => setSoundEnabled((enabled) => !enabled)}
          aria-pressed={soundEnabled}
          aria-label={`Typing sound ${soundEnabled ? "on" : "off"}`}
        >
          <span className="sound-indicator" aria-hidden="true" />
          Sound {soundEnabled ? "on" : "off"}
        </button>
      </header>

      <section className="test-toolbar" aria-label="Test controls">
        <span className="toolbar-label">TYPE THE PASSAGE</span>
        <button
          className="restart-button"
          type="button"
          onClick={onRestart}
          aria-label="Restart typing test"
        >
          <span aria-hidden="true">↻</span>
          New passage
        </button>
      </section>

      <section
        ref={passageRef}
        className={`passage${finished ? " is-finished" : ""}`}
        onKeyDown={handleKeyDown}
        onClick={() => passageRef.current?.focus()}
        role="textbox"
        aria-label="Typing input. Type the displayed passage."
        aria-multiline="true"
        tabIndex={0}
      >
        <div className="passage-text">
          {text.split("").map((char, index) => {
            let className = "ch";
            if (index < typed.length) {
              className += typed[index] === char ? " ok" : " bad";
            } else if (index === typed.length && !finished) {
              className += " cursor";
            }
            return (
              <span
                key={index}
                ref={index === typed.length ? currentCharRef : undefined}
                className={className}
              >
                {char}
              </span>
            );
          })}
        </div>
        {!finished && typed.length === 0 && (
          <span className="start-prompt">Click here and start typing</span>
        )}
      </section>

      <Keyboard
        nextKey={nextKey}
        lessonKeys="qwertyuiopasdfghjklzxcvbnm"
        correctKey={correctKey}
        wrongKey={wrongKey}
      />
      <HandGuide nextKey={nextKey} />

      {finished && (
        <section className="test-result" aria-live="polite">
          <div>
            <p className="eyebrow">TEST COMPLETE</p>
            <h3>Nice work. You completed the passage.</h3>
            <p>Your typing practice is complete. Ready for another passage?</p>
          </div>
          <button type="button" onClick={onRestart}>
            Try another passage
          </button>
        </section>
      )}
    </div>
  );
}
