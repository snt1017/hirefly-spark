import { Bell } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { SearchInput } from "./SearchInput";
import { demoUser } from "@/mocks/company";
import { useState } from "react";

export function AppHeader({ title }: { title: string }) {
  const [q, setQ] = useState("");
  return (
    <header className="flex h-14 items-center gap-3 border-b border-border bg-background px-4">
      <SidebarTrigger />
      <h2 className="text-sm font-medium text-foreground">{title}</h2>
      <div className="ml-auto hidden md:block w-72">
        <SearchInput value={q} onChange={setQ} placeholder="Buscar en Hirefly…" />
      </div>
      <button className="relative rounded-md p-2 text-muted-foreground hover:bg-accent" aria-label="Notificaciones">
        <Bell className="h-4 w-4" />
        <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
      </button>
      <div className="flex items-center gap-2 pl-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
          SM
        </div>
        <div className="hidden md:block">
          <p className="text-sm font-medium leading-tight text-foreground">{demoUser.name}</p>
          <p className="text-xs leading-tight text-muted-foreground">{demoUser.role}</p>
        </div>
      </div>
    </header>
  );
}