import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PublicCareersHeader } from "@/components/PublicCareersHeader";
import { useCompany } from "@/lib/company-store";
import { getJob } from "@/mocks/jobs";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/empresas/$companySlug/empleos/$jobSlug/confirmacion")({
  loader: ({ params }) => {
    const job = getJob(params.jobSlug);
    if (!job) throw notFound();
    return { job };
  },
  component: Confirmation,
  notFoundComponent: () => <div className="p-6">Vacante no disponible.</div>,
});

function Confirmation() {
  const { job } = Route.useLoaderData();
  const company = useCompany();
  return (
    <div className="min-h-screen bg-background">
      <PublicCareersHeader company={company} />
      <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-20 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: `${company.primaryColor}1a`, color: company.primaryColor }}>
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold" style={{ color: company.secondaryColor }}>¡Tu aplicación fue recibida!</h1>
        <p className="mt-2 text-muted-foreground">
          Gracias por postularte a <span className="font-medium text-foreground">{job.title}</span>. El equipo de {company.name} revisará tu información y te contactará si tu perfil avanza en el proceso.
        </p>
        <Link
          to="/empresas/$companySlug/empleos"
          params={{ companySlug: company.slug }}
          className="mt-6 inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-semibold text-white"
          style={{ backgroundColor: company.primaryColor }}
        >
          Ver más vacantes
        </Link>
      </div>
    </div>
  );
}