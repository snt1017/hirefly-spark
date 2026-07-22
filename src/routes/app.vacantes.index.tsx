import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { PageHeader } from "@/components/PageHeader";
import { JobsTable } from "@/components/JobsTable";
import { SearchInput } from "@/components/SearchInput";
import { FilterSelect } from "@/components/FilterSelect";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/EmptyState";
import { jobs } from "@/mocks/jobs";
import type { JobStatus } from "@/mocks/types";
import { Plus } from "lucide-react";

type Tab = "todas" | JobStatus;

export const Route = createFileRoute("/app/vacantes/")({
  component: VacantesPage,
});

function VacantesPage() {
  const [tab, setTab] = useState<Tab>("todas");
  const [q, setQ] = useState("");
  const [area, setArea] = useState("all");
  const [modality, setModality] = useState("all");

  const areas = Array.from(new Set(jobs.map((j) => j.area)));
  const modalities = Array.from(new Set(jobs.map((j) => j.modality)));

  const filtered = useMemo(() => {
    return jobs.filter((j) => {
      if (tab !== "todas" && j.status !== tab) return false;
      if (area !== "all" && j.area !== area) return false;
      if (modality !== "all" && j.modality !== modality) return false;
      if (q && !j.title.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [tab, q, area, modality]);

  return (
    <>
      <AppHeader title="Vacantes" />
      <main className="flex-1 space-y-6 p-6">
        <PageHeader
          title="Vacantes"
          description="Administra tus posiciones y revisa el estado de cada proceso."
          actions={<Button><Plus className="mr-2 h-4 w-4" /> Crear vacante</Button>}
        />

        <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
          <TabsList>
            <TabsTrigger value="todas">Todas</TabsTrigger>
            <TabsTrigger value="abierta">Abiertas</TabsTrigger>
            <TabsTrigger value="en_curso">En curso</TabsTrigger>
            <TabsTrigger value="finalizada">Finalizadas</TabsTrigger>
            <TabsTrigger value="borrador">Borradores</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-wrap gap-2">
          <SearchInput value={q} onChange={setQ} placeholder="Buscar vacantes…" className="min-w-[240px] flex-1" />
          <FilterSelect
            value={area}
            onChange={setArea}
            options={[{ value: "all", label: "Todas las áreas" }, ...areas.map((a) => ({ value: a, label: a }))]}
            className="w-[200px]"
          />
          <FilterSelect
            value={modality}
            onChange={setModality}
            options={[{ value: "all", label: "Todas las modalidades" }, ...modalities.map((m) => ({ value: m, label: m }))]}
            className="w-[200px]"
          />
        </div>

        {filtered.length > 0 ? (
          <JobsTable jobs={filtered} />
        ) : (
          <EmptyState
            title="No hay vacantes que coincidan"
            description="Ajusta los filtros o crea una nueva vacante para comenzar a recibir candidatos."
            action={<Button><Plus className="mr-2 h-4 w-4" /> Crear vacante</Button>}
          />
        )}
      </main>
    </>
  );
}