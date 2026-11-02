import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import HandGuide from "./HandGuide";
import Keyboard from "./Keyboard";
import { generateText, PASS_ACCURACY, type Lesson } from "./lessons";
import { playTypingSound } from "./typingSounds";

interface Props {
  lesson: Lesson;
  hasNext: boolean;
  onPass: (lessonId: number) => void;
  onRetry: () => void;
  onNext: () => void;
}

type Sound = "key" | "error" | "word" | "finish";

export default function TypingLesson({
  lesson,
  hasNext,
  onPass,
  onRetry,
  onNext,
}: Props) {
  const [text] = useState<string>(() => generateText(lesson.keys));
  const [typed, setTyped] = useState("");
  const [keystrokes, setKeystrokes] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [correctKey, setCorrectKey] = useState<string | null>(null);
  const [wrongKey, setWrongKey] = useState<string | null>(null);
  const passageRef = useRef<HTMLElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const finishSoundPlayedRef = useRef(false);
  const correctKeyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrongKeyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const finished = endTime !== null;
  const accuracy =
    keystrokes > 0
      ? Math.round(((keystrokes - mistakes) / keystrokes) * 100)
      : 100;
  const passed = finished && accuracy >= PASS_ACCURACY;
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
    if (passed) onPass(lesson.id);
  }, [passed, onPass, lesson.id]);

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
    if (finished || event.altKey || event.ctrlKey || event.metaKey) return;

    if (event.key === "Backspace") {
      event.preventDefault();
      if (typed.length > 0) setTyped(typed.slice(0, -1));
      return;
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      return;
    }

    if (event.key.length !== 1 || typed.length >= text.length) return;
    event.preventDefault();

    const isCorrect = event.key === text[typed.length];
    const lastKey = event.key.toLowerCase();
    setKeystrokes((count) => count + 1);
    if (!isCorrect) setMistakes((count) => count + 1);
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
    if (value.length === text.length) setEndTime(Date.now());
  }

  return (
    <div className="lesson">
      <header className="lesson-header">
        <div>
          <h2>{lesson.title}</h2>
          <p className="sub">{lesson.description}</p>
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

      <section
        ref={passageRef}
        className="passage"
        onKeyDown={handleKeyDown}
        onClick={() => passageRef.current?.focus()}
        role="textbox"
        aria-label="Typing input. Type the displayed passage."
        aria-multiline="false"
        tabIndex={0}
      >
        {text.split("").map((char, index) => {
          let className = "ch";
          if (index < typed.length) {
            className += typed[index] === char ? " ok" : " bad";
          } else if (index === typed.length && !finished) {
            className += " cursor";
          }
          return (
            <span key={index} className={className}>
              {char === " " ? "\u00A0" : char}
            </span>
          );
        })}
      </section>

      <Keyboard
        nextKey={nextKey}
        lessonKeys={lesson.newKeys || lesson.keys}
        correctKey={correctKey}
        wrongKey={wrongKey}
      />
      <HandGuide nextKey={nextKey} />

      {finished ? (
        <section className="result">
          {passed ? (
            <p>
              Lesson complete! Great work—your accuracy met the {PASS_ACCURACY}%
              goal.
            </p>
          ) : (
            <p>
              You need {PASS_ACCURACY}% accuracy to move on. Slow down and try
              again.
            </p>
          )}
          {passed && hasNext && <button onClick={onNext}>Next lesson</button>}
          <button className={passed ? "ghost" : ""} onClick={onRetry}>
            Try again
          </button>
        </section>
      ) : (
        <section className="actions">
          <button className="ghost" onClick={onRetry}>
            New text
          </button>
        </section>
      )}
    </div>
  );
}
