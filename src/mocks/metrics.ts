import type { Metrics } from "./types";
import { jobs } from "./jobs";
import { candidates } from "./candidates";

export const metrics: Metrics = {
  openJobs: jobs.filter((j) => j.status === "abierta").length,
  inProgress: jobs.filter((j) => j.status === "en_curso").length,
  totalCandidates: 128,
  newThisWeek: 24,
};

export const stageDistribution = [
  { stage: "Nuevos", count: candidates.filter((c) => c.stage === "nuevo").length + 30 },
  { stage: "En revisión", count: candidates.filter((c) => c.stage === "en_revision").length + 22 },
  { stage: "Entrevista", count: candidates.filter((c) => c.stage === "entrevista").length + 12 },
  { stage: "Oferta", count: candidates.filter((c) => c.stage === "oferta").length + 4 },
  { stage: "Contratados", count: candidates.filter((c) => c.stage === "contratado").length + 2 },
];