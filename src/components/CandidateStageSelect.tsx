import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STAGE_LABELS, type ApplicationStage } from "@/mocks/types";

const stages: ApplicationStage[] = [
  "nuevo",
  "en_revision",
  "preseleccionado",
  "entrevista",
  "oferta",
  "contratado",
  "no_continua",
];

export function CandidateStageSelect({
  value,
  onChange,
  className,
}: {
  value: ApplicationStage;
  onChange: (v: ApplicationStage) => void;
  className?: string;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as ApplicationStage)}>
      <SelectTrigger className={className ?? "h-8 w-[160px]"}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {stages.map((s) => (
          <SelectItem key={s} value={s}>
            {STAGE_LABELS[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}