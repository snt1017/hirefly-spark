import { Link } from "@tanstack/react-router";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { JobStatusBadge } from "./StatusBadge";
import type { Job } from "@/mocks/types";

export function JobsTable({ jobs }: { jobs: Job[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vacante</TableHead>
            <TableHead>Área</TableHead>
            <TableHead>Ubicación</TableHead>
            <TableHead>Modalidad</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Candidatos</TableHead>
            <TableHead>Publicada</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((j) => (
            <TableRow key={j.id}>
              <TableCell className="font-medium">{j.title}</TableCell>
              <TableCell className="text-muted-foreground">{j.area}</TableCell>
              <TableCell className="text-muted-foreground">{j.location}</TableCell>
              <TableCell className="text-muted-foreground">{j.modality}</TableCell>
              <TableCell><JobStatusBadge status={j.status} /></TableCell>
              <TableCell className="text-right">{j.candidates}</TableCell>
              <TableCell className="text-muted-foreground">{j.publishedAt}</TableCell>
              <TableCell className="text-right">
                <Button asChild size="sm" variant="ghost">
                  <Link to="/app/vacantes/$jobId" params={{ jobId: j.id }}>Ver detalle</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}