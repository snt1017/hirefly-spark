export function HireflyLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
        H
      </div>
      <span className="text-lg font-semibold tracking-tight text-foreground">Hirefly</span>
    </div>
  );
}