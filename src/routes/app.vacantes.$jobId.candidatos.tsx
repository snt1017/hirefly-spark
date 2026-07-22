import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { PageHeader } from "@/components/PageHeader";
import { CandidateTable } from "@/components/CandidateTable";
import { SearchInput } from "@/components/SearchInput";
import { FilterSelect } from "@/components/FilterSelect";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { getJob } from "@/mocks/jobs";
import { useCandidates } from "@/lib/candidate-store";
import { STAGE_LABELS, type ApplicationStage } from "@/mocks/types";
import { useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/app/vacantes/$jobId/candidatos")({
  loader: ({ params }) => {
    const job = getJob(params.jobId);
    if (!job) throw notFound();
    return { job };
  },
  component: JobCandidates,
  notFoundComponent: () => <div className="p-6">Vacante no encontrada.</div>,
});

function JobCandidates() {
  const { job } = Route.useLoaderData();
  const all = useCandidates().filter((c) => c.jobId === job.id);
  const [q, setQ] = useState("");
  const [stage, setStage] = useState<string>("all");
  const [location, setLocation] = useState<string>("all");
  const [order, setOrder] = useState<"fecha" | "alfabetico">("fecha");

  const locations = Array.from(new Set(all.map((c) => c.location)));

  const filtered = useMemo(() => {
    let list = [...all];
    if (q) list = list.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()) || c.email.toLowerCase().includes(q.toLowerCase()));
    if (stage !== "all") list = list.filter((c) => c.stage === stage);
    if (location !== "all") list = list.filter((c) => c.location === location);
    list.sort((a, b) =>
      order === "fecha" ? b.appliedAt.localeCompare(a.appliedAt) : a.name.localeCompare(b.name),
    );
    return list;
  }, [all, q, stage, location, order]);

  const stageOpts = [
    { value: "all", label: "Todas las etapas" },
    ...(Object.keys(STAGE_LABELS) as ApplicationStage[]).map((s) => ({ value: s, label: STAGE_LABELS[s] })),
  ];

  return (
    <>
      <AppHeader title={`Candidatos · ${job.title}`} />
      <main className="flex-1 space-y-6 p-6">
        <div>
          <Button asChild variant="ghost" size="sm">
            <Link to="/app/vacantes/$jobId" params={{ jobId: job.id }}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Volver a la vacante
            </Link>
          </Button>
        </div>
        <PageHeader
          title={job.title}
          description={`${all.length} candidatos han aplicado a esta vacante.`}
        />

        <div className="flex flex-wrap gap-2">
          <SearchInput value={q} onChange={setQ} placeholder="Buscar por nombre o correo…" className="min-w-[240px] flex-1" />
          <FilterSelect value={stage} onChange={setStage} options={stageOpts} className="w-[180px]" />
          <FilterSelect
            value={location}
            onChange={setLocation}
            options={[{ value: "all", label: "Todas las ubicaciones" }, ...locations.map((l) => ({ value: l, label: l }))]}
            className="w-[220px]"
          />
          <FilterSelect
            value={order}
            onChange={(v) => setOrder(v as "fecha" | "alfabetico")}
            options={[
              { value: "fecha", label: "Más recientes" },
              { value: "alfabetico", label: "Alfabético" },
            ]}
            className="w-[160px]"
          />
        </div>

        {filtered.length > 0 ? (
          <CandidateTable candidates={filtered} showJob={false} />
        ) : (
          <EmptyState
            title="Sin candidatos por ahora"
            description="Cuando alguien aplique a esta vacante, aparecerá aquí."
          />
        )}
      </main>
    </>
  );
}