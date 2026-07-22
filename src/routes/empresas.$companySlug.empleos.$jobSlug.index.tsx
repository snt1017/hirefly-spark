import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PublicCareersHeader } from "@/components/PublicCareersHeader";
import { useCompany } from "@/lib/company-store";
import { getJob } from "@/mocks/jobs";
import { MapPin, Briefcase, Clock, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/empresas/$companySlug/empleos/$jobSlug/")({
  loader: ({ params }) => {
    const job = getJob(params.jobSlug);
    if (!job) throw notFound();
    return { job };
  },
  component: PublicJobDetail,
  notFoundComponent: () => <div className="p-6">Vacante no disponible.</div>,
});

function PublicJobDetail() {
  const { job } = Route.useLoaderData();
  const company = useCompany();
  return (
    <div className="min-h-screen bg-background">
      <PublicCareersHeader company={company} />
      <div className="mx-auto max-w-4xl px-6 py-10">
        <Link
          to="/empresas/$companySlug/empleos"
          params={{ companySlug: company.slug }}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Ver todas las vacantes
        </Link>
        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight" style={{ color: company.secondaryColor }}>{job.title}</h1>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" /> {job.area}</span>
              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {job.location} · {job.modality}</span>
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {job.contractType}</span>
            </div>
          </div>
          <Link
            to="/empresas/$companySlug/empleos/$jobSlug/aplicar"
            params={{ companySlug: company.slug, jobSlug: job.slug }}
            className="inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-semibold text-white shadow-sm"
            style={{ backgroundColor: company.primaryColor }}
          >
            Aplicar a esta posición
          </Link>
        </div>

        <div className="mt-8 space-y-8">
          <Section title="Descripción"><p className="text-foreground/90">{job.description}</p></Section>
          <Section title="Responsabilidades">
            <ul className="list-disc space-y-1 pl-5 text-foreground/90">
              {job.responsibilities.map((r) => <li key={r}>{r}</li>)}
            </ul>
          </Section>
          <Section title="Requisitos">
            <ul className="list-disc space-y-1 pl-5 text-foreground/90">
              {job.requirements.map((r) => <li key={r}>{r}</li>)}
            </ul>
          </Section>
          <Section title="Beneficios">
            <ul className="list-disc space-y-1 pl-5 text-foreground/90">
              {job.benefits.map((r) => <li key={r}>{r}</li>)}
            </ul>
          </Section>

          <div className="rounded-xl border border-border bg-muted/40 p-6 text-center">
            <p className="text-sm text-muted-foreground">¿Te interesa esta posición?</p>
            <Link
              to="/empresas/$companySlug/empleos/$jobSlug/aplicar"
              params={{ companySlug: company.slug, jobSlug: job.slug }}
              className="mt-3 inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-semibold text-white"
              style={{ backgroundColor: company.primaryColor }}
            >
              Aplicar a esta posición
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <div className="mt-3 text-sm">{children}</div>
    </div>
  );
}