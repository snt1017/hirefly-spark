import type { Job } from "@/mocks/types";

export function JobCard({
  job,
  onClick,
  accent,
}: {
  job: Job;
  onClick?: () => void;
  accent?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="group w-full rounded-xl border border-border bg-card p-5 text-left transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-foreground" style={accent ? { color: accent } : undefined}>
            {job.title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {job.area} · {job.location} · {job.modality}
          </p>
          <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{job.description}</p>
        </div>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {job.contractType}
        </span>
      </div>
    </button>
  );
}