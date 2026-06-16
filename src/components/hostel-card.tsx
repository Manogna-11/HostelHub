import { Link } from "@tanstack/react-router";
import { MapPin, Star, BedDouble } from "lucide-react";
import { formatINR, facilityList, HOSTEL_TYPE_LABEL, type HostelType } from "@/lib/hostels";
import { Badge } from "@/components/ui/badge";

export type HostelCardData = {
  id: string;
  name: string;
  city: string | null;
  college_name: string | null;
  distance_from_college: string | null;
  hostel_type: HostelType;
  single_fee: number | null;
  double_fee: number | null;
  triple_fee: number | null;
  rating: number;
  review_count: number;
  facilities: unknown;
  image?: string | null;
  available_beds?: number | null;
};

const PLACEHOLDER = "https://picsum.photos/seed/hostelhub/800/600";

export function HostelCard({ hostel }: { hostel: HostelCardData }) {
  const fromFee = Math.min(
    ...[hostel.single_fee, hostel.double_fee, hostel.triple_fee].filter((f): f is number => f != null),
  );
  const facilities = facilityList(hostel.facilities).slice(0, 3);

  return (
    <Link
      to="/hostel/$id"
      params={{ id: hostel.id }}
      className="stat-card group flex flex-col overflow-hidden p-0 transition-shadow hover:shadow-[var(--shadow-elevated)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={hostel.image || PLACEHOLDER}
          alt={hostel.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <Badge className="absolute left-3 top-3 bg-background/90 text-foreground hover:bg-background/90">
          {HOSTEL_TYPE_LABEL[hostel.hostel_type]}
        </Badge>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-tight">{hostel.name}</h3>
          {hostel.review_count > 0 && (
            <span className="flex shrink-0 items-center gap-1 text-sm font-medium">
              <Star className="h-3.5 w-3.5 fill-warning text-warning" /> {hostel.rating}
            </span>
          )}
        </div>
        <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" /> {hostel.city}
          {hostel.distance_from_college && hostel.college_name ? ` · ${hostel.distance_from_college} from ${hostel.college_name}` : ""}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {facilities.map((f) => (
            <span key={f} className="rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
              {f}
            </span>
          ))}
        </div>
        <div className="mt-auto flex items-end justify-between pt-4">
          <div>
            <span className="text-lg font-bold">{formatINR(Number.isFinite(fromFee) ? fromFee : null)}</span>
            <span className="text-xs text-muted-foreground">/mo onwards</span>
          </div>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <BedDouble className="h-3.5 w-3.5" /> {hostel.review_count} reviews
          </span>
        </div>
      </div>
    </Link>
  );
}
