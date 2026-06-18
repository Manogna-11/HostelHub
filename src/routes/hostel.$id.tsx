import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft, MapPin, Star, Phone, Mail, MessageCircle, Send, Bot, Loader2,
  ShieldCheck, UtensilsCrossed, BedDouble, Check, Camera, CalendarCheck, Users, AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { askHostelAssistant } from "@/lib/ai.functions";
import { useAuth } from "@/hooks/use-auth";
import {
  formatINR, facilityList, HOSTEL_TYPE_LABEL, SHARING_TYPES, type HostelType,
} from "@/lib/hostels";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/hostel/$id")({
  component: HostelDetails,
});

type Hostel = Tables<"hostels">;
type Img = Tables<"hostel_images">;
type Review = Tables<"reviews">;
type Room = Tables<"rooms">;
type Booking = Tables<"bookings">;

const BROWSER_KEY = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY;

function HostelDetails() {
  const { id } = Route.useParams();
  const { user, profile } = useAuth();
  const [hostel, setHostel] = useState<Hostel | null>(null);
  const [images, setImages] = useState<Img[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(0);

  const load = async () => {
    const [{ data: h }, { data: imgs }, { data: rv }, { data: rm }] = await Promise.all([
      supabase.from("hostels").select("*").eq("id", id).maybeSingle(),
      supabase.from("hostel_images").select("*").eq("hostel_id", id).order("sort_order"),
      supabase.from("reviews").select("*").eq("hostel_id", id).order("created_at", { ascending: false }),
      supabase.from("rooms").select("*").eq("hostel_id", id).order("room_number"),
    ]);
    setHostel((h as Hostel) ?? null);
    setImages((imgs as Img[]) ?? []);
    setReviews((rv as Review[]) ?? []);
    setRooms((rm as Room[]) ?? []);
    setLoading(false);
  };

  const loadBooking = async () => {
    if (!user) { setBooking(null); return; }
    const { data } = await supabase
      .from("bookings")
      .select("*")
      .eq("hostel_id", id)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .maybeSingle();
    setBooking((data as Booking) ?? null);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);
  useEffect(() => { loadBooking(); /* eslint-disable-next-line */ }, [id, user?.id]);


  if (loading) return <div className="flex h-screen items-center justify-center text-muted-foreground">Loading hostel…</div>;
  if (!hostel) return (
    <div className="flex h-screen flex-col items-center justify-center gap-3">
      <p className="text-lg font-medium">Hostel not found</p>
      <Button asChild variant="outline"><Link to="/browse">Back to browse</Link></Button>
    </div>
  );

  const facilities = facilityList(hostel.facilities);
  const security = (hostel.security_info ?? {}) as Record<string, boolean>;
  const totalBeds = rooms.reduce((s, r) => s + Math.max(0, r.capacity), 0);
  const availableBeds = rooms.reduce((s, r) => s + Math.max(0, r.capacity - r.occupied_beds), 0);
  const residentsCount = totalBeds - availableBeds;
  const gallery = images.length ? images : [];
  const mapQuery = hostel.latitude && hostel.longitude
    ? `${hostel.latitude},${hostel.longitude}`
    : encodeURIComponent(`${hostel.name} ${hostel.address ?? ""} ${hostel.city ?? ""}`);

  return (
    <div className="min-h-screen bg-background pb-16">
      <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 lg:px-6">
          <Link to="/browse" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to results
          </Link>
          <Button asChild variant="outline" size="sm"><Link to="/auth">Sign in</Link></Button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 lg:px-6">
        {/* Gallery */}
        <div className="grid gap-3 lg:grid-cols-[2fr_1fr]">
          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-muted">
            <img src={gallery[active]?.url || "https://picsum.photos/seed/hh/1200/800"} alt={hostel.name} className="h-full w-full object-cover" />
            <Badge className="absolute left-3 top-3 bg-background/90 text-foreground hover:bg-background/90">
              {HOSTEL_TYPE_LABEL[hostel.hostel_type as HostelType]}
            </Badge>
          </div>
          <div className="grid grid-cols-4 gap-2 lg:grid-cols-2">
            {gallery.slice(0, 6).map((im, i) => (
              <button key={im.id} onClick={() => setActive(i)} className={`relative aspect-square overflow-hidden rounded-lg ${active === i ? "ring-2 ring-primary" : ""}`}>
                <img src={im.url} alt={im.category ?? hostel.name} loading="lazy" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* Main */}
          <div className="space-y-8">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h1 className="text-2xl font-bold">{hostel.name}</h1>
                {hostel.review_count > 0 && (
                  <span className="flex items-center gap-1 text-sm font-semibold">
                    <Star className="h-4 w-4 fill-warning text-warning" /> {hostel.rating} ({hostel.review_count} reviews)
                  </span>
                )}
              </div>
              <p className="mt-1 flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-4 w-4" /> {hostel.address}, {hostel.city}, {hostel.state}
              </p>
              {hostel.college_name && (
                <p className="mt-1 text-sm text-muted-foreground">{hostel.distance_from_college} from {hostel.college_name}</p>
              )}
              {hostel.description && <p className="mt-4 text-sm leading-relaxed">{hostel.description}</p>}
            </div>

            {/* Occupancy */}
            <Section title="Occupancy" icon={Users}>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border border-border p-3 text-center">
                  <div className="text-lg font-bold">{residentsCount}</div>
                  <div className="text-xs text-muted-foreground">Residents</div>
                </div>
                <div className="rounded-lg border border-border p-3 text-center">
                  <div className="text-lg font-bold text-success">{availableBeds}</div>
                  <div className="text-xs text-muted-foreground">Vacancies</div>
                </div>
                <div className="rounded-lg border border-border p-3 text-center">
                  <div className="text-lg font-bold">{totalBeds}</div>
                  <div className="text-xs text-muted-foreground">Total beds</div>
                </div>
              </div>
            </Section>


            {/* Pricing */}
            <Section title="Pricing" icon={BedDouble}>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <PriceBox label="Single Sharing" value={hostel.single_fee} />
                <PriceBox label="Double Sharing" value={hostel.double_fee} />
                <PriceBox label="Triple Sharing" value={hostel.triple_fee} />
                <PriceBox label="Security Deposit" value={hostel.security_deposit} />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{availableBeds} beds available across {rooms.length} rooms.</p>
            </Section>

            {/* Amenities */}
            <Section title="Amenities">
              {facilities.length ? (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {facilities.map((f) => (
                    <span key={f} className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-success" /> {f}</span>
                  ))}
                </div>
              ) : <p className="text-sm text-muted-foreground">Not specified.</p>}
            </Section>

            {/* Security */}
            <Section title="Security & Safety" icon={ShieldCheck}>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {["CCTV", "Security Guards", "Biometric Entry", "Visitor Management"].map((s) => {
                  const key = s.toLowerCase().replace(/ /g, "_");
                  const has = security[key] ?? facilities.includes(s) ?? false;
                  return (
                    <span key={s} className="flex items-center gap-2 text-sm">
                      <Check className={`h-4 w-4 ${has ? "text-success" : "text-muted-foreground/40"}`} /> {s}
                    </span>
                  );
                })}
              </div>
            </Section>

            {/* Mess */}
            <Section title="Mess & Food" icon={UtensilsCrossed}>
              <p className="text-sm"><span className="text-muted-foreground">Type:</span> {hostel.mess_veg_nonveg ?? "Not specified"}</p>
              <p className="text-sm"><span className="text-muted-foreground">Timings:</span> {hostel.mess_timings ?? "Not specified"}</p>
            </Section>

            {/* Rules */}
            {hostel.rules && (
              <Section title="Rules & Regulations">
                <p className="whitespace-pre-line text-sm leading-relaxed">{hostel.rules}</p>
              </Section>
            )}

            {/* Map */}
            <Section title="Location" icon={MapPin}>
              {BROWSER_KEY ? (
                <iframe
                  title="Hostel location"
                  className="h-64 w-full rounded-xl border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps/embed/v1/place?key=${BROWSER_KEY}&q=${mapQuery}`}
                />
              ) : (
                <a href={hostel.maps_link ?? "#"} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline">
                  Open in Google Maps
                </a>
              )}
            </Section>

            {/* Reviews */}
            <Section title={`Reviews (${reviews.length})`} icon={Star}>
              <ReviewForm hostelId={id} userId={user?.id} authorName={profile?.name} onAdded={load} />
              <div className="mt-4 space-y-4">
                {reviews.length === 0 && <p className="text-sm text-muted-foreground">No reviews yet. Be the first!</p>}
                {reviews.map((r) => (
                  <div key={r.id} className="border-b border-border pb-3 last:border-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{r.author_name ?? "Student"}</span>
                      <span className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? "fill-warning text-warning" : "text-muted-foreground/30"}`} />
                        ))}
                      </span>
                    </div>
                    {r.comment && <p className="mt-1 text-sm text-muted-foreground">{r.comment}</p>}
                  </div>
                ))}
              </div>
            </Section>
          </div>

          {/* Sidebar */}
          <div className="space-y-5 lg:sticky lg:top-20 lg:h-fit">
            <BookingCard
              hostel={hostel}
              booking={booking}
              availableBeds={availableBeds}
              userId={user?.id}
              userName={profile?.name}
              userPhone={profile?.phone}
              onChanged={loadBooking}
            />
            {booking && <ComplaintCard hostelId={id} userId={user?.id} authorName={profile?.name} />}
            <ContactCard hostel={hostel} userId={user?.id} userName={profile?.name} userEmail={profile?.email} />
            <AssistantCard hostel={hostel} facilities={facilities} availableBeds={availableBeds} />
          </div>

        </div>
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon?: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <div className="stat-card p-5">
      <h2 className="mb-3 flex items-center gap-2 font-semibold">{Icon && <Icon className="h-4 w-4 text-primary" />} {title}</h2>
      {children}
    </div>
  );
}

function PriceBox({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="rounded-lg border border-border p-3 text-center">
      <div className="text-lg font-bold">{formatINR(value)}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function ContactCard({ hostel, userId, userName, userEmail }: { hostel: Hostel; userId?: string; userName?: string | null; userEmail?: string | null }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ name: userName ?? "", phone: "", email: userEmail ?? "", message: "" });
  const phone = (hostel.phone ?? "").replace(/[^0-9+]/g, "");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) { toast.error("Please sign in to send an inquiry."); navigate({ to: "/auth" }); return; }
    if (!form.name || !form.message) return toast.error("Name and message are required.");
    setSending(true);
    const { error } = await supabase.from("inquiries").insert({
      hostel_id: hostel.id, user_id: userId, name: form.name, phone: form.phone, email: form.email, message: form.message,
    });
    setSending(false);
    if (error) return toast.error("Could not send inquiry.");
    toast.success("Inquiry sent! The hostel will get back to you.");
    setForm({ ...form, message: "" });
    setOpen(false);
  };

  return (
    <div className="stat-card p-5">
      <h2 className="mb-3 font-semibold">Contact Hostel</h2>
      <div className="grid grid-cols-3 gap-2">
        <a href={`tel:${phone}`} className="flex flex-col items-center gap-1 rounded-lg border border-border py-3 text-xs hover:bg-accent">
          <Phone className="h-4 w-4 text-primary" /> Call
        </a>
        <a href={`mailto:${hostel.email ?? ""}`} className="flex flex-col items-center gap-1 rounded-lg border border-border py-3 text-xs hover:bg-accent">
          <Mail className="h-4 w-4 text-primary" /> Email
        </a>
        <a href={`https://wa.me/${phone.replace("+", "")}`} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-1 rounded-lg border border-border py-3 text-xs hover:bg-accent">
          <MessageCircle className="h-4 w-4 text-primary" /> WhatsApp
        </a>
      </div>
      <Button className="mt-3 w-full" onClick={() => setOpen((o) => !o)}>{open ? "Close" : "Send Inquiry"}</Button>
      {open && (
        <form onSubmit={submit} className="mt-3 space-y-2">
          <div className="space-y-1"><Label className="text-xs">Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          <div className="space-y-1"><Label className="text-xs">Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div className="space-y-1"><Label className="text-xs">Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div className="space-y-1"><Label className="text-xs">Message</Label><Textarea rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required /></div>
          <Button type="submit" className="w-full" disabled={sending}>{sending ? "Sending…" : "Send Inquiry"}</Button>
        </form>
      )}
    </div>
  );
}

function ReviewForm({ hostelId, userId, authorName, onAdded }: { hostelId: string; userId?: string; authorName?: string | null; onAdded: () => void }) {
  const navigate = useNavigate();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  if (!userId) {
    return (
      <div className="rounded-lg border border-dashed border-border p-4 text-center text-sm">
        <p className="mb-2 text-muted-foreground">Sign in to rate and review this hostel.</p>
        <Button size="sm" variant="outline" onClick={() => navigate({ to: "/auth" })}>Sign in</Button>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("reviews").insert({
      hostel_id: hostelId, user_id: userId, author_name: authorName ?? "Student", rating, comment,
    });
    setSaving(false);
    if (error) return toast.error("Could not submit review.");
    toast.success("Thanks for your review!");
    setComment(""); setRating(5);
    onAdded();
  };

  return (
    <form onSubmit={submit} className="rounded-lg border border-border p-4">
      <div className="mb-2 flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <button type="button" key={i} onClick={() => setRating(i + 1)}>
            <Star className={`h-5 w-5 ${i < rating ? "fill-warning text-warning" : "text-muted-foreground/30"}`} />
          </button>
        ))}
      </div>
      <Textarea rows={2} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share your experience…" />
      <Button type="submit" size="sm" className="mt-2 gap-1" disabled={saving}>
        <Camera className="h-3.5 w-3.5" /> {saving ? "Posting…" : "Post review"}
      </Button>
    </form>
  );
}

function AssistantCard({ hostel, facilities, availableBeds }: { hostel: Hostel; facilities: string[]; availableBeds: number }) {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    { role: "assistant", content: `Hi! Ask me anything about ${hostel.name} — fees, WiFi, security, food or availability.` },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const context = [
    `Name: ${hostel.name}`, `Type: ${HOSTEL_TYPE_LABEL[hostel.hostel_type as HostelType]}`,
    `Location: ${hostel.address}, ${hostel.city}, ${hostel.state}`,
    hostel.college_name ? `Distance: ${hostel.distance_from_college} from ${hostel.college_name}` : "",
    `Single fee: ${formatINR(hostel.single_fee)}, Double: ${formatINR(hostel.double_fee)}, Triple: ${formatINR(hostel.triple_fee)}, Deposit: ${formatINR(hostel.security_deposit)}`,
    `Amenities: ${facilities.join(", ") || "not specified"}`,
    `Mess: ${hostel.mess_veg_nonveg ?? "n/a"}, timings ${hostel.mess_timings ?? "n/a"}`,
    `Available beds: ${availableBeds}`, `Contact: ${hostel.phone ?? ""} ${hostel.email ?? ""}`,
    hostel.rules ? `Rules: ${hostel.rules}` : "",
  ].filter(Boolean).join("\n");

  const send = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    const history = messages.filter((m) => m.role === "user" || m.role === "assistant").slice(-8);
    setMessages((m) => [...m, { role: "user", content: msg }]);
    setInput("");
    setLoading(true);
    try {
      const res = await askHostelAssistant({ data: { context, history, message: msg } });
      setMessages((m) => [...m, { role: "assistant", content: res.reply }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Sorry, I'm having trouble right now. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stat-card flex flex-col p-5">
      <h2 className="mb-3 flex items-center gap-2 font-semibold"><Bot className="h-4 w-4 text-primary" /> Ask AI about this hostel</h2>
      <div className="mb-3 max-h-64 space-y-2 overflow-y-auto">
        {messages.map((m, i) => (
          <div key={i} className={`rounded-lg px-3 py-2 text-sm ${m.role === "user" ? "ml-6 bg-primary text-primary-foreground" : "mr-6 bg-secondary text-secondary-foreground"}`}>
            {m.content}
          </div>
        ))}
        {loading && <div className="mr-6 flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm text-muted-foreground"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…</div>}
        <div ref={endRef} />
      </div>
      <div className="flex gap-2">
        <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Is WiFi available?" />
        <Button size="icon" onClick={send} disabled={loading}><Send className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}
