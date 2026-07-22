import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AppHeader } from "@/components/AppHeader";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ColorPickerField } from "@/components/ColorPickerField";
import { CompanyLogo } from "@/components/CompanyLogo";
import { useCompany, updateCompany } from "@/lib/company-store";
import { demoCompany } from "@/mocks/company";
import { toast } from "sonner";
import { Upload, RotateCcw, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/app/configuracion/empresa")({
  component: CompanySettings,
});

function CompanySettings() {
  const company = useCompany();
  const [form, setForm] = useState(company);
  const [logoPreview, setLogoPreview] = useState<string | undefined>(company.logoUrl);

  useEffect(() => {
    setForm(company);
    setLogoPreview(company.logoUrl);
  }, [company]);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm({ ...form, [k]: v });

  const onLogo = (file?: File) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setLogoPreview(url);
    setForm({ ...form, logoUrl: url });
  };

  const save = () => {
    updateCompany({ ...form, logoUrl: logoPreview });
    toast.success("Cambios guardados");
  };

  const reset = () => {
    setForm({ ...form, primaryColor: demoCompany.primaryColor, secondaryColor: demoCompany.secondaryColor });
    toast("Colores restablecidos");
  };

  return (
    <>
      <AppHeader title="Configuración · Empresa" />
      <main className="flex-1 space-y-6 p-6">
        <PageHeader
          title="Configuración de la empresa"
          description="Personaliza cómo verán tu empresa los candidatos."
          actions={
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link to="/empresas/$companySlug/empleos" params={{ companySlug: form.slug }}>
                  <ExternalLink className="mr-2 h-4 w-4" /> Ver página pública
                </Link>
              </Button>
              <Button onClick={save}>Guardar cambios</Button>
            </div>
          }
        />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card title="Información general">
              <div className="grid gap-4 md:grid-cols-2">
                <F label="Nombre de la empresa"><Input value={form.name} onChange={(e) => set("name", e.target.value)} /></F>
                <F label="Slug público"><Input value={form.slug} onChange={(e) => set("slug", e.target.value.replace(/\s+/g, "-").toLowerCase())} /></F>
                <F label="Sitio web"><Input value={form.website} onChange={(e) => set("website", e.target.value)} /></F>
                <F label="Correo de contacto"><Input type="email" value={form.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} /></F>
                <div className="md:col-span-2">
                  <F label="Descripción">
                    <Textarea rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} />
                  </F>
                </div>
              </div>
            </Card>

            <Card title="Identidad visual">
              <div className="flex flex-wrap items-center gap-4">
                <CompanyLogo name={form.name} logoUrl={logoPreview} color={form.primaryColor} size={56} />
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground hover:bg-accent">
                  <Upload className="h-4 w-4" /> Cargar logo
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => onLogo(e.target.files?.[0])} />
                </label>
                <p className="text-xs text-muted-foreground">La previsualización es local. No se sube ningún archivo.</p>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <ColorPickerField label="Color principal" value={form.primaryColor} onChange={(v) => set("primaryColor", v)} />
                <ColorPickerField label="Color secundario" value={form.secondaryColor} onChange={(v) => set("secondaryColor", v)} />
              </div>
              <div className="mt-4 flex gap-3">
                <div className="h-10 flex-1 rounded-md" style={{ backgroundColor: form.primaryColor }} />
                <div className="h-10 flex-1 rounded-md" style={{ backgroundColor: form.secondaryColor }} />
              </div>
              <div className="mt-3">
                <Button variant="ghost" size="sm" onClick={reset}>
                  <RotateCcw className="mr-2 h-3.5 w-3.5" /> Restablecer colores
                </Button>
              </div>
            </Card>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Vista previa white label</h3>
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${form.primaryColor}22` }}>
                <div className="flex items-center gap-2">
                  <CompanyLogo name={form.name} logoUrl={logoPreview} color={form.primaryColor} size={28} />
                  <span className="text-sm font-semibold" style={{ color: form.secondaryColor }}>{form.name}</span>
                </div>
                <span className="rounded-md px-2 py-1 text-xs font-medium text-white" style={{ backgroundColor: form.primaryColor }}>
                  Visitar sitio
                </span>
              </div>
              <div className="p-4">
                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm font-semibold text-foreground">Desarrollador Frontend</p>
                  <p className="text-xs text-muted-foreground">Ingeniería · Remoto</p>
                  <button
                    className="mt-3 w-full rounded-md py-1.5 text-xs font-medium text-white"
                    style={{ backgroundColor: form.primaryColor }}
                  >
                    Ver posición
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}
function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}