import { useEffect, useState } from "react";
import { candidates as seed } from "@/mocks/candidates";
import type { ApplicationStage, Candidate } from "@/mocks/types";

let state: Candidate[] = seed.map((c) => ({ ...c }));
type Listener = () => void;
const listeners = new Set<Listener>();

export function setStage(candidateId: string, stage: ApplicationStage) {
  state = state.map((c) => (c.id === candidateId ? { ...c, stage } : c));
  listeners.forEach((l) => l());
}

export function toggleFavorite(id: string) {
  state = state.map((c) => (c.id === id ? { ...c, favorite: !c.favorite } : c));
  listeners.forEach((l) => l());
}

export function addNote(id: string, text: string) {
  state = state.map((c) =>
    c.id === id
      ? {
          ...c,
          notes: [
            { id: `n-${Date.now()}`, author: "Sofía Martínez", text, date: new Date().toISOString().slice(0, 10) },
            ...c.notes,
          ],
        }
      : c,
  );
  listeners.forEach((l) => l());
}

export function useCandidates() {
  const [snap, setSnap] = useState(state);
  useEffect(() => {
    const l = () => setSnap([...state]);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);
  return snap;
}

export function useCandidate(id: string) {
  return useCandidates().find((c) => c.id === id);
}