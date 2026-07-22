import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { StageBadge } from "@/components/StatusBadge";
import { CandidateStageSelect } from "@/components/CandidateStageSelect";
import { useCandidate, setStage, addNote, toggleFavorite } from "@/lib/candidate-store";
import { getJob } from "@/mocks/jobs";
import { candidates as seed } from "@/mocks/candidates";
import { Download, Mail, Star, MapPin, Phone, Linkedin, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/candidatos/$candidateId")({
  loader: ({ params }) => {
    const c = seed.find((x) => x.id === params.candidateId);
    if (!c) throw notFound();
    return { id: params.candidateId };
  },
  component: CandidateDetail,
  notFoundComponent: () => <div className="p-6">Candidato no encontrado.</div>,
});

function CandidateDetail() {
  const { id } = Route.useLoaderData();
  const candidate = useCandidate(id);
  const [note, setNote] = useState("");

  if (!candidate) return <div className="p-6">Candidato no encontrado.</div>;
  const job = getJob(candidate.jobId);
  const initials = candidate.name.split(" ").map((n) => n[0]).slice(0, 2).join("");

  return (
    <>
      <AppHeader title={candidate.name} />
      <main className="flex-1 space-y-6 p-6">
        <div>
          <Button asChild variant="ghost" size="sm">
            <Link
              to="/app/vacantes/$jobId/candidatos"
              params={{ jobId: candidate.jobId }}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Volver a candidatos
            </Link>
          </Button>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-semibold">
                {initials}
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-foreground">{candidate.name}</h1>
                <p className="text-sm text-muted-foreground">{candidate.headline}</p>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {candidate.location}</span>
                  <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {candidate.email}</span>
                  <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {candidate.phone}</span>
                  {candidate.linkedin && (
                    <a href={candidate.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                      <Linkedin className="h-3.5 w-3.5" /> LinkedIn
                    </a>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Aplicó a</span>
                  {job && (
                    <Link to="/app/vacantes/$jobId" params={{ jobId: job.id }} className="font-medium text-primary hover:underline">
                      {job.title}
                    </Link>
                  )}
                  <StageBadge stage={candidate.stage} />
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <CandidateStageSelect value={candidate.stage} onChange={(s) => { setStage(candidate.id, s); toast.success("Etapa actualizada"); }} />
              <Button
                variant="outline"
                onClick={() => toast("Esta función estará disponible al conectar el almacenamiento.")}
              >
                <Download className="mr-2 h-4 w-4" /> Descargar CV
              </Button>
              <Button variant="outline" onClick={() => toast("Se abrirá el flujo de contacto (simulado).")}>
                <Mail className="mr-2 h-4 w-4" /> Contactar
              </Button>
              <Button
                variant={candidate.favorite ? "default" : "outline"}
                size="icon"
                onClick={() => { toggleFavorite(candidate.id); toast.success(candidate.favorite ? "Retirado de favoritos" : "Marcado como favorito"); }}
                aria-label="Marcar favorito"
              >
                <Star className={`h-4 w-4 ${candidate.favorite ? "fill-current" : ""}`} />
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="resumen">
          <TabsList>
            <TabsTrigger value="resumen">Resumen</TabsTrigger>
            <TabsTrigger value="experiencia">Experiencia</TabsTrigger>
            <TabsTrigger value="educacion">Educación</TabsTrigger>
            <TabsTrigger value="notas">Notas</TabsTrigger>
            <TabsTrigger value="actividad">Actividad</TabsTrigger>
          </TabsList>

          <TabsContent value="resumen" className="mt-4">
            <Card>
              <p className="text-sm text-foreground/90">
                {candidate.name} tiene experiencia como {candidate.headline.toLowerCase()}. Reside en {candidate.location} y aplicó a la vacante de {job?.title ?? "—"}.
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="experiencia" className="mt-4 space-y-3">
            {candidate.experience.map((e, i) => (
              <Card key={i}>
                <div className="flex items-baseline justify-between">
                  <h4 className="font-semibold text-foreground">{e.role}</h4>
                  <span className="text-xs text-muted-foreground">{e.period}</span>
                </div>
                <p className="text-sm text-muted-foreground">{e.company}</p>
                <p className="mt-2 text-sm text-foreground/90">{e.description}</p>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="educacion" className="mt-4 space-y-3">
            {candidate.education.map((e, i) => (
              <Card key={i}>
                <div className="flex items-baseline justify-between">
                  <h4 className="font-semibold text-foreground">{e.degree}</h4>
                  <span className="text-xs text-muted-foreground">{e.period}</span>
                </div>
                <p className="text-sm text-muted-foreground">{e.school}</p>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="notas" className="mt-4">
            <Card>
              <Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Escribe una nota interna sobre el candidato…" />
              <div className="mt-2 flex justify-end">
                <Button
                  size="sm"
                  disabled={!note.trim()}
                  onClick={() => { addNote(candidate.id, note.trim()); setNote(""); toast.success("Nota agregada"); }}
                >
                  Agregar nota
                </Button>
              </div>
              <div className="mt-4 space-y-3">
                {candidate.notes.length === 0 && <p className="text-sm text-muted-foreground">Aún no hay notas.</p>}
                {candidate.notes.map((n) => (
                  <div key={n.id} className="rounded-lg border border-border p-3">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{n.author}</span><span>{n.date}</span>
                    </div>
                    <p className="mt-1 text-sm text-foreground/90">{n.text}</p>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="actividad" className="mt-4">
            <Card>
              <ul className="space-y-3">
                {candidate.activity.map((a, i) => (
                  <li key={i} className="flex justify-between text-sm">
                    <span className="text-foreground/90">{a.text}</span>
                    <span className="text-muted-foreground">{a.date}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-border bg-card p-5">{children}</div>;
}