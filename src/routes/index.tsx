import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { HireflyLogo } from "@/components/HireflyLogo";
import {
  Briefcase,
  Users,
  BarChart3,
  Palette,
  Globe2,
  ClipboardList,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { JobStatusBadge } from "@/components/StatusBadge";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hirefly — Reclutamiento más organizado, de principio a fin" },
      {
        name: "description",
        content:
          "Hirefly ayuda a tu empresa a publicar vacantes, recibir candidatos y hacer seguimiento a cada proceso desde un solo lugar.",
      },
      { property: "og:title", content: "Hirefly — Plataforma de reclutamiento" },
      {
        property: "og:description",
        content: "Centraliza tus procesos de selección con Hirefly.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <HireflyLogo />
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#producto" className="text-sm text-muted-foreground hover:text-foreground">Producto</a>
            <a href="#como-funciona" className="text-sm text-muted-foreground hover:text-foreground">Cómo funciona</a>
            <a href="#beneficios" className="text-sm text-muted-foreground hover:text-foreground">Beneficios</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/iniciar-sesion">Iniciar sesión</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/registro">Crear cuenta</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center">
        <div>
          <span className="inline-flex rounded-full bg-primary-light px-3 py-1 text-xs font-medium text-primary">
            Plataforma para equipos de talento
          </span>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Reclutamiento más organizado, de principio a fin!!!
          </h1>
          <p className="mt-4 max-w-lg text-lg text-muted-foreground">
            Hirefly ayuda a tu empresa a publicar vacantes, recibir candidatos y hacer seguimiento a cada proceso desde un solo lugar.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/registro">Crear cuenta gratis</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#como-funciona">Ver cómo funciona</a>
            </Button>
          </div>
        </div>
        <DashboardMock />
      </section>

      {/* Features */}
      <section id="producto" className="border-t border-border bg-muted/30 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold text-foreground">Todo lo que necesitas para gestionar talento</h2>
            <p className="mt-3 text-muted-foreground">Diseñado para equipos que quieren procesos claros y candidatos bien atendidos.</p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Globe2, t: "Página de empleos con tu marca", d: "Publica tus vacantes en un portal personalizable con el logo y colores de tu empresa." },
              { icon: Briefcase, t: "Publicación y seguimiento", d: "Crea vacantes y monitorea su estado en tiempo real." },
              { icon: Users, t: "Gestión de candidatos", d: "Toda la información de las personas que aplican en un solo lugar." },
              { icon: ClipboardList, t: "Estado de cada proceso", d: "Sabe en qué etapa está cada candidato sin perder detalles." },
              { icon: Palette, t: "Personalización visual", d: "Adapta la experiencia pública a la identidad de tu empresa." },
              { icon: BarChart3, t: "Información para decidir", d: "Métricas claras para tomar mejores decisiones de contratación." },
            ].map((f) => (
              <div key={f.t} className="rounded-xl border border-border bg-card p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-light text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">{f.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-3xl font-semibold text-foreground">Empieza en tres pasos</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              { n: "01", t: "Configura tu empresa", d: "Define la información y marca que verán los candidatos." },
              { n: "02", t: "Publica tus vacantes", d: "Crea posiciones y publícalas en tu portal de empleos." },
              { n: "03", t: "Recibe candidatos", d: "Revisa aplicaciones y avanza en cada proceso desde Hirefly." },
            ].map((s) => (
              <div key={s.n} className="rounded-xl border border-border p-6">
                <span className="text-sm font-semibold text-primary">{s.n}</span>
                <h3 className="mt-2 text-lg font-semibold text-foreground">{s.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product view */}
      <section className="border-t border-border bg-muted/30 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold text-foreground">Un panel diseñado para tu equipo de talento</h2>
            <p className="mt-3 text-muted-foreground">Vacantes, candidatos y actividad en una sola vista.</p>
          </div>
          <div className="mt-10">
            <DashboardMock large />
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="beneficios" className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-3xl font-semibold text-foreground">Por qué las empresas eligen Hirefly</h2>
          <ul className="mt-8 grid gap-4 md:grid-cols-2">
            {[
              "Menos trabajo manual en la operación.",
              "Información centralizada y siempre disponible.",
              "Mejor experiencia para los candidatos.",
              "Página de empleos con look profesional.",
              "Visibilidad clara del estado de los procesos.",
            ].map((b) => (
              <li key={b} className="flex items-start gap-3 rounded-lg border border-border p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />
                <span className="text-sm text-foreground">{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-6 pb-20">
        <div className="rounded-2xl bg-primary px-8 py-12 text-center text-primary-foreground">
          <h2 className="text-3xl font-semibold">Empieza a organizar tu reclutamiento con Hirefly.</h2>
          <p className="mt-2 text-primary-foreground/80">Empresas de todo tamaño ya usan Hirefly para simplificar sus procesos.</p>
          <Button asChild size="lg" variant="secondary" className="mt-6">
            <Link to="/registro">Crear mi cuenta <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border bg-muted/30">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 md:grid-cols-4">
          <div>
            <HireflyLogo />
            <p className="mt-3 text-sm text-muted-foreground">La plataforma de reclutamiento para equipos que quieren crecer con orden.</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Producto</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>Funcionalidades</li>
              <li>Página de empleos</li>
              <li>Precios</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Empresa</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>Sobre nosotros</li>
              <li>Contacto</li>
              <li>Blog</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Legal</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>Términos</li>
              <li>Privacidad</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Hirefly. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}

function DashboardMock({ large = false }: { large?: boolean }) {
  return (
    <div className={`overflow-hidden rounded-xl border border-border bg-card shadow-xl ${large ? "" : ""}`}>
      <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-2">
        <div className="h-2.5 w-2.5 rounded-full bg-rose-300" />
        <div className="h-2.5 w-2.5 rounded-full bg-amber-300" />
        <div className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
        <span className="ml-3 text-xs text-muted-foreground">app.hirefly.co</span>
      </div>
      <div className="grid grid-cols-4 gap-3 p-4">
        {[
          { l: "Vacantes abiertas", v: "5" },
          { l: "En curso", v: "3" },
          { l: "Candidatos", v: "128" },
          { l: "Nuevos", v: "24" },
        ].map((m) => (
          <div key={m.l} className="rounded-lg border border-border p-3">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{m.l}</p>
            <p className="mt-1 text-lg font-semibold text-foreground">{m.v}</p>
          </div>
        ))}
      </div>
      <div className="px-4 pb-4">
        <p className="text-xs font-medium text-muted-foreground">Vacantes recientes</p>
        <div className="mt-2 divide-y divide-border rounded-lg border border-border">
          {[
            { t: "Desarrollador Frontend", s: "abierta" as const, c: 32 },
            { t: "Product Designer", s: "abierta" as const, c: 21 },
            { t: "Analista de Datos", s: "en_curso" as const, c: 18 },
            { t: "Ejecutivo de Ventas B2B", s: "en_curso" as const, c: 27 },
          ].map((row) => (
            <div key={row.t} className="flex items-center justify-between px-3 py-2 text-sm">
              <span className="font-medium text-foreground">{row.t}</span>
              <div className="flex items-center gap-3">
                <JobStatusBadge status={row.s} />
                <span className="text-xs text-muted-foreground">{row.c} candidatos</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
