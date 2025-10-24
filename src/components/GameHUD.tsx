"use client";

import React, { useEffect, useRef, useState } from 'react';

interface ConsoleMessage {
  id: number;
  text: string;
}

export const GameHUD: React.FC = () => {
  const [totalDestroyed, setTotalDestroyed] = useState<number>(0);
  const [pendingDelta, setPendingDelta] = useState<number>(0);
  const [messages, setMessages] = useState<ConsoleMessage[]>([]);
  const msgIdRef = useRef<number>(0);

  // Fetch initial total on mount
  useEffect(() => {
    let active = true;
    fetch('/api/game/stats')
      .then(r => r.json())
      .then(d => { if (active && typeof d?.value === 'number') setTotalDestroyed(d.value); })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  // Listen for console messages
  useEffect(() => {
    const onConsole = (e: Event) => {
      const detail = (e as CustomEvent).detail as { text: string };
      if (!detail?.text) return;
      const id = ++msgIdRef.current;
      setMessages(prev => [{ id, text: detail.text }, ...prev].slice(0, 6));
    };
    window.addEventListener('game-console', onConsole as EventListener);
    return () => window.removeEventListener('game-console', onConsole as EventListener);
  }, []);

  // Listen for target destroyed events
  useEffect(() => {
    const onDestroyed = (e: Event) => {
      const detail = (e as CustomEvent).detail as { delta: number };
      const d = typeof detail?.delta === 'number' ? detail.delta : 0;
      if (d > 0) {
        setTotalDestroyed(v => v + d);
        setPendingDelta(v => v + d);
        const id = ++msgIdRef.current;
        setMessages(prev => [{ id, text: `Target destroyed (+${d})` }, ...prev].slice(0, 6));
      }
    };
    window.addEventListener('target-destroyed', onDestroyed as EventListener);
    return () => window.removeEventListener('target-destroyed', onDestroyed as EventListener);
  }, []);

  // Batch POST pending deltas every 1.5s
  useEffect(() => {
    const t = setInterval(() => {
      setPendingDelta(current => {
        if (current <= 0) return current;
        fetch('/api/game/stats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ delta: current })
        }).catch(() => {});
        return 0;
      });
    }, 1500);
    return () => clearInterval(t);
  }, []);

  const isGame = typeof document !== 'undefined' && document.documentElement.classList.contains('game');
  if (!isGame) return null;

  return (
    <div className="pointer-events-none select-none absolute left-4 bottom-4 z-50 flex flex-col gap-2 text-foreground">
      <div className="pointer-events-auto inline-flex items-center gap-2 rounded-md bg-secondary/60 backdrop-blur px-3 py-1 text-sm border border-border/50">
        <span className="opacity-90">Destroyed:</span>
        <span className="font-bold">{totalDestroyed}</span>
      </div>
      <div className="w-64 max-w-[70vw] rounded-md bg-background/70 backdrop-blur border border-border/40 p-2">
        <div className="text-xs opacity-70 mb-1">Console</div>
        <ul className="space-y-1 text-xs leading-tight max-h-32 overflow-hidden">
          {messages.map(m => (
            <li key={m.id} className="truncate">{m.text}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
