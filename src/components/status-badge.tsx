import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  open: "bg-warning/15 text-warning border-warning/30",
  in_progress: "bg-primary/15 text-primary border-primary/30",
  resolved: "bg-success/15 text-success border-success/30",
  available: "bg-success/15 text-success border-success/30",
  occupied: "bg-primary/15 text-primary border-primary/30",
  full: "bg-destructive/15 text-destructive border-destructive/30",
  maintenance: "bg-warning/15 text-warning border-warning/30",
  high: "bg-destructive/15 text-destructive border-destructive/30",
  medium: "bg-warning/15 text-warning border-warning/30",
  low: "bg-muted text-muted-foreground border-border",
  positive: "bg-success/15 text-success border-success/30",
  neutral: "bg-muted text-muted-foreground border-border",
  negative: "bg-destructive/15 text-destructive border-destructive/30",
  paid: "bg-success/15 text-success border-success/30",
  pending: "bg-warning/15 text-warning border-warning/30",
  new: "bg-primary/15 text-primary border-primary/30",
  contacted: "bg-warning/15 text-warning border-warning/30",
  converted: "bg-success/15 text-success border-success/30",
};

const labels: Record<string, string> = {
  in_progress: "In Progress",
};

export function StatusBadge({ value, className }: { value: string; className?: string }) {
  const key = value.toLowerCase();
  const label = labels[key] || value.charAt(0).toUpperCase() + value.slice(1);
  return (
    <Badge variant="outline" className={cn("font-medium capitalize", statusStyles[key] ?? "", className)}>
      {label}
    </Badge>
  );
}
