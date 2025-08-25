import { useState, useCallback } from "react";

export function useToasts() {
  const [list, setList] = useState<{ id: number; msg: string; type?: "ok" | "error" }[]>([]);
  const add = useCallback((msg: string, type: "ok" | "error" = "ok") => {
    const id = Date.now() + Math.random();
    setList((xs) => [...xs, { id, msg, type }]);
    setTimeout(() => setList((xs) => xs.filter((t) => t.id !== id)), 2500);
  }, []);
  return { list, add };
}
