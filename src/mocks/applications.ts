import type { Application } from "./types";
import { candidates } from "./candidates";

export const applications: Application[] = candidates.map((c, i) => ({
  id: `app-${i + 1}`,
  jobId: c.jobId,
  candidateId: c.id,
  submittedAt: c.appliedAt,
}));