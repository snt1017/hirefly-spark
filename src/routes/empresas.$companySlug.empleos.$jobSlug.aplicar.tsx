import { createFileRoute, useNavigate, notFound } from "@tanstack/react-router";
import { PublicCareersHeader } from "@/components/PublicCareersHeader";
import { ApplicationForm } from "@/components/ApplicationForm";
import { useCompany } from "@/lib/company-store";
import { getJob } from "@/mocks/jobs";

export const Route = createFileRoute("/empresas/$companySlug/empleos/$jobSlug/aplicar")({
  loader: ({ params }) => {
    const job = getJob(params.jobSlug);
    if (!job) throw notFound();
    return { job };
  },
  component: ApplyPage,
  notFoundComponent: () => <div className="p-6">Vacante no disponible.</div>,
});

function ApplyPage() {
  const { job } = Route.useLoaderData();
  const company = useCompany();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <PublicCareersHeader company={company} />
      <div className="mx-auto max-w-2xl px-6 py-10">
        <p className="text-sm text-muted-foreground">Aplicando a</p>
        <h1 className="text-2xl font-semibold" style={{ color: company.secondaryColor }}>{job.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{job.area} · {job.location} · {job.modality}</p>
        <div className="mt-6 rounded-xl border border-border bg-card p-6">
          <ApplicationForm
            primaryColor={company.primaryColor}
            onSubmit={() =>
              navigate({
                to: "/empresas/$companySlug/empleos/$jobSlug/confirmacion",
                params: { companySlug: company.slug, jobSlug: job.slug },
              })
            }
          />
        </div>
      </div>
    </div>
  );
}