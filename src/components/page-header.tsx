import { cn } from "@/lib/utils";

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
  tint = "primary",
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  tint?: "primary" | "success" | "warning" | "destructive";
}) {
  const tints: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    destructive: "bg-destructive/10 text-destructive",
  };
  return (
    <div className="stat-card flex items-center gap-4 p-5">
      <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl", tints[tint])}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="min-w-0">
        <div className="text-2xl font-bold">{value}</div>
        <div className="truncate text-sm text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}
