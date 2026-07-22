import { Link } from "@tanstack/react-router";
import { CompanyLogo } from "./CompanyLogo";
import type { Company } from "@/mocks/types";

export function PublicCareersHeader({ company }: { company: Company }) {
  return (
    <header
      className="border-b"
      style={{ borderColor: `${company.primaryColor}22` }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          to="/empresas/$companySlug/empleos"
          params={{ companySlug: company.slug }}
          className="flex items-center gap-3"
        >
          <CompanyLogo name={company.name} logoUrl={company.logoUrl} color={company.primaryColor} />
          <span className="text-base font-semibold" style={{ color: company.secondaryColor }}>
            {company.name}
          </span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Sobre nosotros</a>
          <Link
            to="/empresas/$companySlug/empleos"
            params={{ companySlug: company.slug }}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Vacantes
          </Link>
          <a
            href={company.website}
            target="_blank"
            rel="noreferrer"
            className="rounded-md px-3 py-1.5 text-sm font-medium text-white"
            style={{ backgroundColor: company.primaryColor }}
          >
            Visitar sitio web
          </a>
        </nav>
      </div>
    </header>
  );
}