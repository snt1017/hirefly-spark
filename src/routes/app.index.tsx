import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { PageHeader } from "@/components/PageHeader";
import { MetricCard } from "@/components/MetricCard";
import { JobsTable } from "@/components/JobsTable";
import { Briefcase, Users, TrendingUp, Sparkles, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { jobs } from "@/mocks/jobs";
import { metrics, stageDistribution } from "@/mocks/metrics";
import { recentActivity } from "@/mocks/activity";
import { supabase } from "@/utils/supabase";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { usePostHog } from "@posthog/react";

export const Route = createFileRoute("/app/")({
  component: Dashboard,
});

function Dashboard() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [todosError, setTodosError] = useState<string | null>(null);
  const max = Math.max(...stageDistribution.map((s) => s.count));
  const recent = jobs.slice(0, 5);

  useEffect(() => {
    async function getTodos() {
      const { data, error } = await supabase.from("todos").select("id, name");

      if (error) {
        setTodosError(error.message);
        return;
      }

      setTodos(data ?? []);
    }

    void getTodos();
  }, []);

  return (
    <>
      <AppHeader title="Inicio" />
      <main className="flex-1 space-y-6 p-6">
        <PageHeader
          title="Buenos días, Sofía"
          description="Aquí tienes un resumen de tus procesos de selección."
          actions={<NewJobButton />}
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Vacantes abiertas" value={metrics.openJobs} icon={Briefcase} />
          <MetricCard label="Procesos en curso" value={metrics.inProgress} icon={TrendingUp} />
          <MetricCard label="Candidatos recibidos" value={metrics.totalCandidates} icon={Users} />
          <MetricCard
            label="Nuevos esta semana"
            value={metrics.newThisWeek}
            icon={Sparkles}
            hint="+18% vs semana pasada"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-3">
            <h2 className="text-base font-semibold text-foreground">Vacantes recientes</h2>
            <JobsTable jobs={recent} />
          </div>
          <div className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">Actividad reciente</h2>
            <ul className="rounded-lg border border-border bg-card divide-y divide-border">
              {recentActivity.map((a) => (
                <li key={a.id} className="p-4">
                  <p className="text-sm text-foreground">{a.text}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{a.date}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-base font-semibold text-foreground">
            Distribución de candidatos por etapa
          </h2>
          <div className="mt-4 space-y-3">
            {stageDistribution.map((s) => (
              <div key={s.stage}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{s.stage}</span>
                  <span className="text-muted-foreground">{s.count}</span>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${(s.count / max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-base font-semibold text-foreground">Tareas</h2>
          {todosError ? (
            <p className="mt-3 text-sm text-destructive">
              No se pudieron cargar las tareas: {todosError}
            </p>
          ) : todos.length ? (
            <ul className="mt-3 divide-y divide-border">
              {todos.map((todo) => (
                <li key={todo.id} className="py-3 text-sm text-foreground">
                  {todo.name}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">No hay tareas para mostrar.</p>
          )}
        </div>
      </main>
    </>
  );
}

interface Todo {
  id: string;
  name: string;
}

function NewJobButton() {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const areaRef = useRef<HTMLInputElement>(null);
  const posthog = usePostHog();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Nueva vacante
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva vacante</DialogTitle>
          <DialogDescription>
            Completa la información básica. Podrás editar detalles después.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Título</Label>
            <Input ref={titleRef} placeholder="Ej: Desarrollador Frontend" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Área</Label>
              <Input ref={areaRef} placeholder="Ingeniería" />
            </div>
            <div className="space-y-1.5">
              <Label>Ubicación</Label>
              <Input placeholder="Bogotá, Colombia" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Descripción</Label>
            <Textarea rows={3} placeholder="Describe la vacante…" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            disabled={saving}
            onClick={async () => {
              setSaving(true);
              await new Promise((r) => setTimeout(r, 500));
              posthog.capture("job_created", { area: areaRef.current?.value || undefined });
              setSaving(false);
              setOpen(false);
              toast.success("Vacante creada como borrador");
            }}
          >
            {saving ? "Guardando…" : "Guardar borrador"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
