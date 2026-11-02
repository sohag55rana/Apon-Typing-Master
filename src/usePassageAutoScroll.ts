import { useEffect, useRef } from "react";

export function usePassageAutoScroll(typed: string) {
  const passageRef = useRef<HTMLElement>(null);
  const currentCharRef = useRef<HTMLSpanElement>(null);
  const previousLineTopRef = useRef<number | null>(null);

  useEffect(() => {
    const passage = passageRef.current;
    if (!passage) return;

    if (typed.length === 0) {
      previousLineTopRef.current = null;
      passage.scrollTop = 0;
      return;
    }

    const currentChar = currentCharRef.current;
    if (!currentChar) return;

    const lineTop = currentChar.offsetTop;
    const previousLineTop = previousLineTopRef.current;
    const lineHeight = Number.parseFloat(
      window.getComputedStyle(currentChar).lineHeight,
    );

    if (
      previousLineTop !== null &&
      Math.abs(lineTop - previousLineTop) > lineHeight / 2
    ) {
      const paddingTop = Number.parseFloat(
        window.getComputedStyle(passage).paddingTop,
      );
      const contentTop =
        passage.getBoundingClientRect().top +
        passage.clientTop +
        (Number.isNaN(paddingTop) ? 0 : paddingTop);
      passage.scrollTop += currentChar.getBoundingClientRect().top - contentTop;
    }

    previousLineTopRef.current = lineTop;
  }, [typed]);

  return { passageRef, currentCharRef };
}
