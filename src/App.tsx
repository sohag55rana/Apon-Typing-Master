import { useCallback, useState } from "react";
import "./App.css";
import { LESSONS } from "./lessons";
import TypingLesson from "./TypingLesson";
import TypingTest from "./TypingTest";
import logo from "./assets/logo.png";

const STORAGE_KEY = "typing-tutor-completed";

function loadCompleted(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((n): n is number => typeof n === "number")
      : [];
  } catch {
    return [];
  }
}

function saveCompleted(ids: number[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Storage may be unavailable; progress just won't persist
  }
}

export default function App() {
  const [completed, setCompleted] = useState<number[]>(loadCompleted);
  const [mode, setMode] = useState<"test" | "lessons">("test");
  const [selectedId, setSelectedId] = useState<number>(() => {
    const done = loadCompleted();
    const firstOpen = LESSONS.find((l) => !done.includes(l.id));
    return (firstOpen ?? LESSONS[0]).id;
  });
  const [attempt, setAttempt] = useState<number>(0);
  const [testAttempt, setTestAttempt] = useState<number>(0);

  const lessonIndex = LESSONS.findIndex((l) => l.id === selectedId);
  const lesson = LESSONS[lessonIndex];
  const hasNext = lessonIndex < LESSONS.length - 1;

  function isUnlocked(index: number): boolean {
    return index === 0 || completed.includes(LESSONS[index - 1].id);
  }

  const handlePass = useCallback((id: number) => {
    setCompleted((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      saveCompleted(next);
      return next;
    });
  }, []);

  function selectLesson(id: number) {
    setSelectedId(id);
    setAttempt((a) => a + 1);
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">
          <img className="brand-logo" src={logo} alt="" />
          <h1>Apon Typing Master</h1>
        </div>
        <nav className="mode-nav" aria-label="Practice modes">
          <button
            className={`mode-link${mode === "test" ? " active" : ""}`}
            aria-current={mode === "test" ? "page" : undefined}
            onClick={() => setMode("test")}
          >
            <span className="mode-icon" aria-hidden="true">⌁</span>
            Typing test
            <span className="mode-chevron" aria-hidden="true">›</span>
          </button>
          <button
            className={`mode-link${mode === "lessons" ? " active" : ""}`}
            aria-current={mode === "lessons" ? "page" : undefined}
            onClick={() => setMode("lessons")}
          >
            <span className="mode-icon" aria-hidden="true">▤</span>
            Lessons
            <span className="mode-chevron" aria-hidden="true">›</span>
          </button>
        </nav>
        {mode === "lessons" && (
          <section className="lesson-navigation">
            <p className="sidebar-section-label">YOUR LESSONS</p>
            <nav aria-label="Lessons">
              <ol className="lesson-list">
                {LESSONS.map((l, i) => {
                  const unlocked = isUnlocked(i);
                  const done = completed.includes(l.id);
                  return (
                    <li key={l.id}>
                      <button
                        className={`lesson-item${l.id === selectedId ? " active" : ""}`}
                        disabled={!unlocked}
                        onClick={() => selectLesson(l.id)}
                      >
                        <span>{l.title}</span>
                        <span className="tag">
                          {done ? "Done" : unlocked ? "" : "Locked"}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </nav>
          </section>
        )}
        <div className="sidebar-footer">
          <span className="status-dot" />
          Ready when you are
        </div>
      </aside>

      <main className="main">
        {mode === "test" ? (
          <TypingTest
            attempt={testAttempt}
            onRestart={() => setTestAttempt((current) => current + 1)}
          />
        ) : (
          <TypingLesson
            key={`${lesson.id}-${attempt}`}
            lesson={lesson}
            hasNext={hasNext}
            onPass={handlePass}
            onRetry={() => setAttempt((a) => a + 1)}
            onNext={() => selectLesson(LESSONS[lessonIndex + 1].id)}
          />
        )}
      </main>
    </div>
  );
}
