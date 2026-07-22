import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { PageHeader } from "@/components/PageHeader";
import { JobStatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getJob } from "@/mocks/jobs";
import { MoreHorizontal, Users, ExternalLink } from "lucide-react";
import { useCompany } from "@/lib/company-store";
import { toast } from "sonner";

export const Route = createFileRoute("/app/vacantes/$jobId/")({
  loader: ({ params }) => {
    const job = getJob(params.jobId);
    if (!job) throw notFound();
    return { job };
  },
  component: JobDetail,
  notFoundComponent: () => <div className="p-6">Vacante no encontrada.</div>,
});

function JobDetail() {
  const { job } = Route.useLoaderData();
  const company = useCompany();
  const navigate = useNavigate();

  return (
    <>
      <AppHeader title={job.title} />
      <main className="flex-1 space-y-6 p-6">
        <div>
          <Link to="/app/vacantes" className="text-sm text-muted-foreground hover:text-foreground">← Volver a vacantes</Link>
        </div>
        <PageHeader
          title={job.title}
          description={`${job.area} · ${job.location} · ${job.modality} · ${job.contractType}`}
          actions={
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => toast("Función simulada: Editar vacante")}>Editar</Button>
              <Button asChild>
                <Link to="/app/vacantes/$jobId/candidatos" params={{ jobId: job.id }}>
                  <Users className="mr-2 h-4 w-4" /> Ver candidatos ({job.candidates})
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => toast.success("Vacante pausada")}>Pausar</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toast.success("Vacante cerrada")}>Cerrar</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toast.success("Vacante duplicada")}>Duplicar</DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      navigate({
                        to: "/empresas/$companySlug/empleos/$jobSlug",
                        params: { companySlug: company.slug, jobSlug: job.slug },
                      })
                    }
                  >
                    <ExternalLink className="mr-2 h-4 w-4" /> Ver página pública
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          }
        />

        <div className="flex flex-wrap items-center gap-3">
          <JobStatusBadge status={job.status} />
          <span className="text-sm text-muted-foreground">Publicada el {job.publishedAt}</span>
          <span className="text-sm text-muted-foreground">· {job.candidates} candidatos</span>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Section title="Descripción"><p className="text-sm text-foreground/90">{job.description}</p></Section>
            <Section title="Responsabilidades">
              <ul className="list-disc pl-5 text-sm text-foreground/90 space-y-1">
                {job.responsibilities.map((r) => <li key={r}>{r}</li>)}
              </ul>
            </Section>
            <Section title="Requisitos">
              <ul className="list-disc pl-5 text-sm text-foreground/90 space-y-1">
                {job.requirements.map((r) => <li key={r}>{r}</li>)}
              </ul>
            </Section>
          </div>
          <div className="space-y-3">
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold text-foreground">Resumen</h3>
              <dl className="mt-3 space-y-2 text-sm">
                <Row k="Área" v={job.area} />
                <Row k="Ubicación" v={job.location} />
                <Row k="Modalidad" v={job.modality} />
                <Row k="Contrato" v={job.contractType} />
                <Row k="Actualizada" v={job.updatedAt} />
              </dl>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <div className="mt-3">{children}</div>
    </div>
  );
}
function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="text-foreground text-right">{v}</dd>
    </div>
  );
}