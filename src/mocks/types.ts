// Types shared across mock data. These will map cleanly to Supabase later.
export type JobStatus = "abierta" | "en_curso" | "finalizada" | "borrador" | "pausada";
export type ApplicationStage =
  | "nuevo"
  | "en_revision"
  | "preseleccionado"
  | "entrevista"
  | "oferta"
  | "contratado"
  | "no_continua";

export interface Company {
  id: string;
  name: string;
  slug: string;
  description: string;
  website: string;
  contactEmail: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

export interface Job {
  id: string;
  slug: string;
  title: string;
  area: string;
  location: string;
  modality: "Remoto" | "Presencial" | "Híbrido";
  contractType: "Tiempo completo" | "Medio tiempo" | "Contrato" | "Prácticas";
  status: JobStatus;
  candidates: number;
  publishedAt: string;
  updatedAt: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  headline: string;
  linkedin?: string;
  jobId: string;
  appliedAt: string;
  stage: ApplicationStage;
  favorite?: boolean;
  experience: { company: string; role: string; period: string; description: string }[];
  education: { school: string; degree: string; period: string }[];
  notes: { id: string; author: string; text: string; date: string }[];
  activity: { date: string; text: string }[];
}

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  submittedAt: string;
}

export interface ActivityItem {
  id: string;
  type: "application" | "status" | "company" | "job";
  text: string;
  date: string;
}

export interface Metrics {
  openJobs: number;
  inProgress: number;
  totalCandidates: number;
  newThisWeek: number;
}

export const STAGE_LABELS: Record<ApplicationStage, string> = {
  nuevo: "Nuevo",
  en_revision: "En revisión",
  preseleccionado: "Preseleccionado",
  entrevista: "Entrevista",
  oferta: "Oferta",
  contratado: "Contratado",
  no_continua: "No continúa",
};

export const STATUS_LABELS: Record<JobStatus, string> = {
  abierta: "Abierta",
  en_curso: "En curso",
  finalizada: "Finalizada",
  borrador: "Borrador",
  pausada: "Pausada",
};