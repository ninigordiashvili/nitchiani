"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Returns a key that changes every time `count` goes **up**.
 *
 * Put it on an element's `key` to remount it, which re-fires whatever CSS animation it
 * carries — the only reliable way to replay a keyframe animation on repeat events without
 * juggling `animationend` listeners or toggling classes across two frames.
 *
 * Decreases and the initial mount deliberately don't fire: the acknowledgement belongs to
 * the moment something was added, not to removals or first paint.
 */
export function useBumpOnIncrease(count: number): number {
  const [bumpKey, setBumpKey] = useState(0);
  const prev = useRef(count);

  useEffect(() => {
    if (count > prev.current) setBumpKey((k) => k + 1);
    prev.current = count;
  }, [count]);

  return bumpKey;
}
