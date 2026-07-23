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
import { signIn } from "@/lib/session";
import { toast } from "sonner";
import { usePostHog } from "@posthog/react";

const schema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(4, "Ingresa tu contraseña"),
  remember: z.boolean().optional(),
});
type Values = z.infer<typeof schema>;

export const Route = createFileRoute("/iniciar-sesion")({
  head: () => ({
    meta: [
      { title: "Iniciar sesión — Hirefly" },
      { name: "description", content: "Ingresa a Hirefly." },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const posthog = usePostHog();
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "demo@hirefly.co", password: "demo1234", remember: true },
  });

  const onSubmit = async (v: Values) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    signIn(v.email);
    posthog.identify(v.email, { email: v.email });
    posthog.capture("user_signed_in");
    setLoading(false);
    toast.success("¡Bienvenida de vuelta!");
    navigate({ to: "/app" });
  };

  return (
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="mx-auto max-w-md px-6">
        <Link to="/" className="inline-block">
          <HireflyLogo />
        </Link>
        <div className="mt-6 rounded-xl border border-border bg-card p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-foreground">Inicia sesión</h1>
          <p className="mt-1 text-sm text-muted-foreground">Ingresa a tu cuenta de Hirefly.</p>
          <div className="mt-4 rounded-md bg-primary-light p-3 text-xs text-primary">
            Cuenta demo: <span className="font-medium">demo@hirefly.co</span> ·{" "}
            <span className="font-medium">demo1234</span>
          </div>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label>Correo</Label>
              <Input type="email" {...form.register("email")} />
              {form.formState.errors.email && (
                <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>Contraseña</Label>
                <a href="#" className="text-xs text-primary hover:underline">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <Input type="password" {...form.register("password")} />
              {form.formState.errors.password && (
                <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={form.watch("remember")}
                onCheckedChange={(v) => form.setValue("remember", v === true)}
              />
              <Label htmlFor="remember" className="text-sm font-normal">
                Recordarme
              </Label>
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Ingresando…" : "Iniciar sesión"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            ¿No tienes cuenta?{" "}
            <Link to="/registro" className="font-medium text-primary hover:underline">
              Crea una gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
