import { useEffect, useRef, useState } from 'react';

export function useCountdown(initialSeconds: number, onComplete: () => void) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [running, setRunning] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    setSecondsLeft(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(id);
          setRunning(false);
          onCompleteRef.current();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  const reset = (seconds = initialSeconds) => {
    setSecondsLeft(seconds);
    setRunning(false);
  };

  return { secondsLeft, running, setRunning, reset };
}
