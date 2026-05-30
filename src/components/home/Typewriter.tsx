import { useState, useEffect } from 'react';

interface Props {
  phrases: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseMs?: number;
}

export default function Typewriter({
  phrases,
  typingSpeed = 65,
  deletingSpeed = 35,
  pauseMs = 2000,
}: Props) {
  const [displayed, setDisplayed] = useState(phrases[0] ?? '');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [cursorOn, setCursorOn] = useState(true);

  useEffect(() => {
    const id = setInterval(() => setCursorOn(v => !v), 530);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const current = phrases[phraseIndex];

    if (!isDeleting && displayed === current) {
      if (phrases.length === 1) return;
      const id = setTimeout(() => setIsDeleting(true), pauseMs);
      return () => clearTimeout(id);
    }

    if (isDeleting && displayed === '') {
      setIsDeleting(false);
      setPhraseIndex(i => (i + 1) % phrases.length);
      return;
    }

    const delay = isDeleting ? deletingSpeed : typingSpeed;
    const id = setTimeout(() => {
      setDisplayed(
        isDeleting
          ? current.slice(0, displayed.length - 1)
          : current.slice(0, displayed.length + 1),
      );
    }, delay);

    return () => clearTimeout(id);
  }, [displayed, isDeleting, phraseIndex, phrases, typingSpeed, deletingSpeed, pauseMs]);

  return (
    <span>
      {displayed}
      <span
        aria-hidden="true"
        className="inline-block w-[2px] h-[0.85em] bg-current ml-1 align-middle -translate-y-[0.05em]"
        style={{ opacity: cursorOn ? 1 : 0 }}
      />
    </span>
  );
}
