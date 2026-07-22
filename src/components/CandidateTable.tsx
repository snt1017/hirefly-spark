import { Link } from "@tanstack/react-router";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CandidateStageSelect } from "./CandidateStageSelect";
import { setStage } from "@/lib/candidate-store";
import type { Candidate } from "@/mocks/types";
import { getJob } from "@/mocks/jobs";

export function CandidateTable({
  candidates,
  showJob = true,
}: {
  candidates: Candidate[];
  showJob?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Correo</TableHead>
            <TableHead>Ubicación</TableHead>
            {showJob && <TableHead>Vacante</TableHead>}
            <TableHead>Aplicó</TableHead>
            <TableHead>Etapa</TableHead>
            <TableHead className="text-right">Acción</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {candidates.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="font-medium">{c.name}</TableCell>
              <TableCell className="text-muted-foreground">{c.email}</TableCell>
              <TableCell className="text-muted-foreground">{c.location}</TableCell>
              {showJob && (
                <TableCell className="text-muted-foreground">{getJob(c.jobId)?.title ?? "—"}</TableCell>
              )}
              <TableCell className="text-muted-foreground">{c.appliedAt}</TableCell>
              <TableCell>
                <CandidateStageSelect value={c.stage} onChange={(s) => setStage(c.id, s)} />
              </TableCell>
              <TableCell className="text-right">
                <Button asChild size="sm" variant="ghost">
                  <Link to="/app/candidatos/$candidateId" params={{ candidateId: c.id }}>Ver perfil</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}