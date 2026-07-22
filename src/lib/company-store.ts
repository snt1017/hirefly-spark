import { useEffect, useState } from "react";
import { demoCompany } from "@/mocks/company";
import type { Company } from "@/mocks/types";

const KEY = "hirefly-company";
type Listener = (c: Company) => void;
const listeners = new Set<Listener>();

function read(): Company {
  if (typeof window === "undefined") return demoCompany;
  const raw = localStorage.getItem(KEY);
  if (!raw) return demoCompany;
  try {
    return { ...demoCompany, ...JSON.parse(raw) } as Company;
  } catch {
    return demoCompany;
  }
}

export function updateCompany(patch: Partial<Company>) {
  const next = { ...read(), ...patch };
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(next));
  listeners.forEach((l) => l(next));
}

export function useCompany(): Company {
  const [company, setCompany] = useState<Company>(demoCompany);
  useEffect(() => {
    setCompany(read());
    const l: Listener = (c) => setCompany(c);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);
  return company;
}