import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PublicCareersHeader } from "@/components/PublicCareersHeader";
import { useCompany } from "@/lib/company-store";
import { jobs } from "@/mocks/jobs";
import { FilterSelect } from "@/components/FilterSelect";
import { MapPin, Briefcase, Clock } from "lucide-react";
import { CompanyLogo } from "@/components/CompanyLogo";

export const Route = createFileRoute("/empresas/$companySlug/empleos/")({
  head: () => ({ meta: [{ title: "Empleos" }, { name: "description", content: "Vacantes abiertas" }] }),
  component: PublicJobs,
});

function PublicJobs() {
  const company = useCompany();
  const [area, setArea] = useState("all");
  const [location, setLocation] = useState("all");
  const [modality, setModality] = useState("all");

  const open = jobs.filter((j) => j.status === "abierta");
  const areas = Array.from(new Set(open.map((j) => j.area)));
  const locs = Array.from(new Set(open.map((j) => j.location)));
  const mods = Array.from(new Set(open.map((j) => j.modality)));

  const filtered = useMemo(
    () =>
      open.filter(
        (j) =>
          (area === "all" || j.area === area) &&
          (location === "all" || j.location === location) &&
          (modality === "all" || j.modality === modality),
      ),
    [area, location, modality, open],
  );

  return (
    <div className="min-h-screen bg-background">
      <PublicCareersHeader company={company} />
      <section
        className="border-b border-border"
        style={{ background: `linear-gradient(180deg, ${company.primaryColor}0d, transparent)` }}
      >
        <div className="mx-auto max-w-6xl px-6 py-16 text-center">
          <h1 className="text-4xl font-semibold tracking-tight" style={{ color: company.secondaryColor }}>
            Construye el futuro con {company.name}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Únete a un equipo que utiliza tecnología y diseño para resolver problemas reales.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold text-foreground">Posiciones abiertas</h2>
          <span className="text-sm text-muted-foreground">{filtered.length} vacantes</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <FilterSelect value={area} onChange={setArea} options={[{ value: "all", label: "Todas las áreas" }, ...areas.map((a) => ({ value: a, label: a }))]} className="w-[200px]" />
          <FilterSelect value={location} onChange={setLocation} options={[{ value: "all", label: "Todas las ubicaciones" }, ...locs.map((l) => ({ value: l, label: l }))]} className="w-[220px]" />
          <FilterSelect value={modality} onChange={setModality} options={[{ value: "all", label: "Todas las modalidades" }, ...mods.map((m) => ({ value: m, label: m }))]} className="w-[200px]" />
        </div>

        <ul className="mt-6 space-y-3">
          {filtered.map((j) => (
            <li key={j.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold" style={{ color: company.secondaryColor }}>{j.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{j.description}</p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" /> {j.area}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {j.location} · {j.modality}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {j.contractType}</span>
                  </div>
                </div>
                <Link
                  to="/empresas/$companySlug/empleos/$jobSlug"
                  params={{ companySlug: company.slug, jobSlug: j.slug }}
                  className="inline-flex shrink-0 items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-white"
                  style={{ backgroundColor: company.primaryColor }}
                >
                  Ver posición
                </Link>
              </div>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              No hay vacantes abiertas para los filtros seleccionados.
            </li>
          )}
        </ul>
      </section>

      <footer className="border-t border-border bg-muted/30">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-6 py-8 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <CompanyLogo name={company.name} logoUrl={company.logoUrl} color={company.primaryColor} size={32} />
            <div>
              <p className="text-sm font-semibold text-foreground">{company.name}</p>
              <p className="text-xs text-muted-foreground">{company.contactEmail} · {company.website}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Portal de empleos creado con Hirefly</p>
        </div>
      </footer>
    </div>
  );
}