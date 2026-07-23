import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { HireflyLogo } from "@/components/HireflyLogo";
import { registerAccount, RegistrationError } from "@/services/auth";
import { toast } from "sonner";
import { usePostHog } from "@posthog/react";

const schema = z
  .object({
    name: z.string().min(2, "Ingresa tu nombre"),
    email: z.string().email("Correo inválido"),
    company: z.string().min(2, "Ingresa el nombre de la empresa"),
    password: z.string().min(8, "Mínimo 8 caracteres"),
    confirm: z.string(),
    terms: z.literal(true, { errorMap: () => ({ message: "Debes aceptar los términos" }) }),
  })
  .refine((d) => d.password === d.confirm, {
    path: ["confirm"],
    message: "Las contraseñas no coinciden",
  });

type Values = z.infer<typeof schema>;

export const Route = createFileRoute("/registro")({
  head: () => ({
    meta: [
      { title: "Crear cuenta — Hirefly" },
      { name: "description", content: "Crea tu cuenta en Hirefly." },
    ],
  }),
  component: Registro,
});

function Registro() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const posthog = usePostHog();
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      password: "",
      confirm: "",
      terms: false as unknown as true,
    },
  });

  const onSubmit = async (v: Values) => {
    setSubmitError(null);
    setLoading(true);
    try {
      const result = await registerAccount({
        fullName: v.name,
        email: v.email,
        companyName: v.company,
        password: v.password,
      });

      posthog.identify(v.email, { email: v.email, company: v.company });
      posthog.capture("user_registered", {
        requires_email_confirmation: result.requiresEmailConfirmation,
        company: v.company,
      });

      if (result.requiresEmailConfirmation) {
        toast.success("Revisa tu correo para confirmar tu cuenta.");
        navigate({ to: "/iniciar-sesion" });
        return;
      }

      toast.success("Cuenta creada exitosamente");
      navigate({ to: "/app" });
    } catch (error) {
      posthog.captureException(error instanceof Error ? error : new Error(String(error)));
      setSubmitError(
        error instanceof RegistrationError
          ? error.message
          : "No fue posible crear la cuenta. Inténtalo nuevamente.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="mx-auto max-w-md px-6">
        <Link to="/" className="inline-block">
          <HireflyLogo />
        </Link>
        <div className="mt-6 rounded-xl border border-border bg-card p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-foreground">Crea tu cuenta</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Empieza a organizar tu reclutamiento con Hirefly.
          </p>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
            <F label="Nombre completo" e={form.formState.errors.name?.message}>
              <Input autoComplete="name" disabled={loading} {...form.register("name")} />
            </F>
            <F label="Correo corporativo" e={form.formState.errors.email?.message}>
              <Input
                type="email"
                autoComplete="email"
                disabled={loading}
                {...form.register("email")}
              />
            </F>
            <F label="Nombre de la empresa" e={form.formState.errors.company?.message}>
              <Input autoComplete="organization" disabled={loading} {...form.register("company")} />
            </F>
            <F label="Contraseña" e={form.formState.errors.password?.message}>
              <Input
                type="password"
                autoComplete="new-password"
                disabled={loading}
                {...form.register("password")}
              />
            </F>
            <F label="Confirmar contraseña" e={form.formState.errors.confirm?.message}>
              <Input
                type="password"
                autoComplete="new-password"
                disabled={loading}
                {...form.register("confirm")}
              />
            </F>
            <div className="flex items-start gap-2">
              <Checkbox
                id="terms"
                checked={form.watch("terms") as unknown as boolean}
                onCheckedChange={(v) =>
                  form.setValue("terms", (v === true) as unknown as true, { shouldValidate: true })
                }
                disabled={loading}
              />
              <div>
                <Label htmlFor="terms" className="text-sm font-normal">
                  Acepto los términos y la política de privacidad.
                </Label>
                {form.formState.errors.terms && (
                  <p className="text-xs text-destructive">{form.formState.errors.terms.message}</p>
                )}
              </div>
            </div>
            {submitError && (
              <p className="text-sm text-destructive" role="alert">
                {submitError}
              </p>
            )}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Creando cuenta…" : "Crear cuenta"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            ¿Ya tienes una cuenta?{" "}
            <Link to="/iniciar-sesion" className="font-medium text-primary hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function F({ label, e, children }: { label: string; e?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {e && <p className="text-xs text-destructive">{e}</p>}
    </div>
  );
}
