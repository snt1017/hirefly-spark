import type { ApplicationStage, JobStatus } from "@/mocks/types";
import { STAGE_LABELS, STATUS_LABELS } from "@/mocks/types";
import { cn } from "@/lib/utils";

const jobStyles: Record<JobStatus, string> = {
  abierta: "bg-emerald-50 text-emerald-700 border-emerald-200",
  en_curso: "bg-blue-50 text-blue-700 border-blue-200",
  finalizada: "bg-slate-100 text-slate-700 border-slate-200",
  borrador: "bg-amber-50 text-amber-700 border-amber-200",
  pausada: "bg-orange-50 text-orange-700 border-orange-200",
};

const stageStyles: Record<ApplicationStage, string> = {
  nuevo: "bg-blue-50 text-blue-700 border-blue-200",
  en_revision: "bg-amber-50 text-amber-700 border-amber-200",
  preseleccionado: "bg-violet-50 text-violet-700 border-violet-200",
  entrevista: "bg-indigo-50 text-indigo-700 border-indigo-200",
  oferta: "bg-teal-50 text-teal-700 border-teal-200",
  contratado: "bg-emerald-50 text-emerald-700 border-emerald-200",
  no_continua: "bg-rose-50 text-rose-700 border-rose-200",
};

export function JobStatusBadge({ status }: { status: JobStatus }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium", jobStyles[status])}>
      {STATUS_LABELS[status]}
    </span>
  );
}

export function StageBadge({ stage }: { stage: ApplicationStage }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium", stageStyles[stage])}>
      {STAGE_LABELS[stage]}
    </span>
  );
}