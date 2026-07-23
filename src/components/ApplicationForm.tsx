import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload } from "lucide-react";
import { usePostHog } from "@posthog/react";

const schema = z.object({
  name: z.string().min(2, "Ingresa tu nombre completo"),
  email: z.string().email("Correo inválido"),
  phone: z.string().min(5, "Ingresa un teléfono válido"),
  location: z.string().min(2, "Indica ciudad o país"),
  linkedin: z.string().url("URL inválida").or(z.literal("")),
  portfolio: z.string().url("URL inválida").or(z.literal("")),
  motivation: z.string().min(20, "Cuéntanos un poco más (mínimo 20 caracteres)"),
  consent: z.literal(true, {
    errorMap: () => ({ message: "Debes aceptar el tratamiento de datos" }),
  }),
});

export type ApplicationValues = z.infer<typeof schema>;

export function ApplicationForm({
  primaryColor,
  onSubmit,
}: {
  primaryColor: string;
  onSubmit: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const posthog = usePostHog();

  const form = useForm<ApplicationValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      location: "",
      linkedin: "",
      portfolio: "",
      motivation: "",
      consent: false as unknown as true,
    },
  });

  const submit = async (v: ApplicationValues) => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 700));
    posthog.capture("job_application_submitted", {
      has_linkedin: !!v.linkedin,
      has_portfolio: !!v.portfolio,
      has_resume: !!file,
      location: v.location,
    });
    setSubmitting(false);
    onSubmit();
  };

  return (
    <form onSubmit={form.handleSubmit(submit)} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nombre completo" error={form.formState.errors.name?.message}>
          <Input {...form.register("name")} placeholder="María Pérez" />
        </Field>
        <Field label="Correo" error={form.formState.errors.email?.message}>
          <Input type="email" {...form.register("email")} placeholder="tu@correo.com" />
        </Field>
        <Field label="Teléfono" error={form.formState.errors.phone?.message}>
          <Input {...form.register("phone")} placeholder="+57 300 000 0000" />
        </Field>
        <Field label="Ciudad o país" error={form.formState.errors.location?.message}>
          <Input {...form.register("location")} placeholder="Bogotá, Colombia" />
        </Field>
        <Field label="LinkedIn (opcional)" error={form.formState.errors.linkedin?.message}>
          <Input {...form.register("linkedin")} placeholder="https://linkedin.com/in/…" />
        </Field>
        <Field label="Portafolio (opcional)" error={form.formState.errors.portfolio?.message}>
          <Input {...form.register("portfolio")} placeholder="https://…" />
        </Field>
      </div>

      <div className="space-y-1.5">
        <Label>Hoja de vida (PDF o DOCX)</Label>
        <label className="flex cursor-pointer items-center gap-3 rounded-md border border-dashed border-input bg-background px-4 py-3 text-sm text-muted-foreground hover:bg-accent">
          <Upload className="h-4 w-4" />
          <span>
            {file ? `${file.name} · ${Math.round(file.size / 1024)} KB` : "Selecciona un archivo"}
          </span>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>
        <p className="text-xs text-muted-foreground">
          Este prototipo no sube archivos. Se muestra el nombre y tamaño localmente.
        </p>
      </div>

      <Field
        label="¿Por qué te interesa esta posición?"
        error={form.formState.errors.motivation?.message}
      >
        <Textarea
          rows={4}
          {...form.register("motivation")}
          placeholder="Cuéntanos qué te motiva…"
        />
      </Field>

      <div className="flex items-start gap-2">
        <Checkbox
          id="consent"
          checked={form.watch("consent") as unknown as boolean}
          onCheckedChange={(v) =>
            form.setValue("consent", (v === true) as unknown as true, { shouldValidate: true })
          }
        />
        <div>
          <Label htmlFor="consent" className="text-sm font-normal">
            Autorizo el tratamiento de mis datos personales según la política de privacidad.
          </Label>
          {form.formState.errors.consent && (
            <p className="mt-1 text-xs text-destructive">{form.formState.errors.consent.message}</p>
          )}
        </div>
      </div>

      <Button
        type="submit"
        disabled={submitting}
        className="w-full text-white"
        style={{ backgroundColor: primaryColor }}
      >
        {submitting ? "Enviando…" : "Enviar aplicación"}
      </Button>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
