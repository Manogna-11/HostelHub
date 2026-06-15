import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { FACILITIES, HOSTEL_TYPE_LABEL, type HostelType } from "@/lib/hostels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { Tables } from "@/integrations/supabase/types";

type Hostel = Tables<"hostels">;

const SECURITY_KEYS = [
  { key: "cctv", label: "CCTV" },
  { key: "security_guards", label: "Security Guards" },
  { key: "biometric_entry", label: "Biometric Entry" },
  { key: "visitor_management", label: "Visitor Management" },
];

export type HostelFormValue = {
  name: string; description: string; hostel_type: HostelType;
  address: string; city: string; state: string; pincode: string;
  college_name: string; distance_from_college: string; maps_link: string;
  phone: string; email: string;
  single_fee: string; double_fee: string; triple_fee: string; security_deposit: string;
  mess_veg_nonveg: string; mess_timings: string; rules: string;
  facilities: Record<string, boolean>; security: Record<string, boolean>;
  images: string[];
};

export function HostelForm({
  initial, ownerId, hostelId, onSaved, submitLabel = "Save hostel",
}: {
  initial?: Partial<HostelFormValue>; ownerId: string; hostelId?: string;
  onSaved: (id: string) => void; submitLabel?: string;
}) {
  const [v, setV] = useState<HostelFormValue>({
    name: "", description: "", hostel_type: "coliving",
    address: "", city: "", state: "", pincode: "",
    college_name: "", distance_from_college: "", maps_link: "",
    phone: "", email: "",
    single_fee: "", double_fee: "", triple_fee: "", security_deposit: "",
    mess_veg_nonveg: "Veg & Non-Veg", mess_timings: "Breakfast 7:30-9:30, Lunch 12:30-2:30, Dinner 8-9:30",
    rules: "", facilities: {}, security: {}, images: ["", "", "", "", ""],
    ...initial,
  });
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof HostelFormValue>(k: K, val: HostelFormValue[K]) => setV((s) => ({ ...s, [k]: val }));
  const setImage = (i: number, val: string) => setV((s) => ({ ...s, images: s.images.map((u, idx) => (idx === i ? val : u)) }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const imgs = v.images.map((u) => u.trim()).filter(Boolean);
    if (!v.name.trim()) return toast.error("Hostel name is required.");
    if (imgs.length < 5) return toast.error("Please add at least 5 image URLs.");

    setSaving(true);
    const payload = {
      owner_id: ownerId, name: v.name, description: v.description, hostel_type: v.hostel_type,
      address: v.address, city: v.city, state: v.state, pincode: v.pincode,
      college_name: v.college_name, distance_from_college: v.distance_from_college, maps_link: v.maps_link,
      phone: v.phone, email: v.email,
      single_fee: v.single_fee ? Number(v.single_fee) : null,
      double_fee: v.double_fee ? Number(v.double_fee) : null,
      triple_fee: v.triple_fee ? Number(v.triple_fee) : null,
      security_deposit: v.security_deposit ? Number(v.security_deposit) : null,
      mess_veg_nonveg: v.mess_veg_nonveg, mess_timings: v.mess_timings, rules: v.rules,
      facilities: v.facilities, security_info: v.security, is_published: true,
    };

    let id = hostelId;
    if (hostelId) {
      const { error } = await supabase.from("hostels").update(payload).eq("id", hostelId);
      if (error) { setSaving(false); return toast.error(error.message); }
      await supabase.from("hostel_images").delete().eq("hostel_id", hostelId);
    } else {
      const { data, error } = await supabase.from("hostels").insert(payload).select("id").single();
      if (error || !data) { setSaving(false); return toast.error(error?.message ?? "Failed to save."); }
      id = data.id;
    }
    if (id) {
      await supabase.from("hostel_images").insert(imgs.map((url, i) => ({ hostel_id: id!, url, sort_order: i, category: "Gallery" })));
    }
    setSaving(false);
    toast.success("Hostel saved!");
    if (id) onSaved(id);
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <Card title="Hostel Details">
        <Field label="Hostel Name" full><Input value={v.name} onChange={(e) => set("name", e.target.value)} required /></Field>
        <Field label="Description" full><Textarea rows={3} value={v.description} onChange={(e) => set("description", e.target.value)} /></Field>
        <Field label="Hostel Type">
          <select value={v.hostel_type} onChange={(e) => set("hostel_type", e.target.value as HostelType)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
            {(Object.keys(HOSTEL_TYPE_LABEL) as HostelType[]).map((t) => <option key={t} value={t}>{HOSTEL_TYPE_LABEL[t]}</option>)}
          </select>
        </Field>
      </Card>

      <Card title="Location & Contact">
        <Field label="Full Address" full><Input value={v.address} onChange={(e) => set("address", e.target.value)} /></Field>
        <Field label="City"><Input value={v.city} onChange={(e) => set("city", e.target.value)} /></Field>
        <Field label="State"><Input value={v.state} onChange={(e) => set("state", e.target.value)} /></Field>
        <Field label="Pincode"><Input value={v.pincode} onChange={(e) => set("pincode", e.target.value)} /></Field>
        <Field label="Google Maps Link"><Input value={v.maps_link} onChange={(e) => set("maps_link", e.target.value)} placeholder="https://maps.google.com/..." /></Field>
        <Field label="Nearby College"><Input value={v.college_name} onChange={(e) => set("college_name", e.target.value)} /></Field>
        <Field label="Distance from College"><Input value={v.distance_from_college} onChange={(e) => set("distance_from_college", e.target.value)} placeholder="e.g. 1.2 km" /></Field>
        <Field label="Phone Number"><Input value={v.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
        <Field label="Email"><Input type="email" value={v.email} onChange={(e) => set("email", e.target.value)} /></Field>
      </Card>

      <Card title="Pricing (₹ / month)">
        <Field label="Single Sharing"><Input type="number" value={v.single_fee} onChange={(e) => set("single_fee", e.target.value)} /></Field>
        <Field label="Double Sharing"><Input type="number" value={v.double_fee} onChange={(e) => set("double_fee", e.target.value)} /></Field>
        <Field label="Triple Sharing"><Input type="number" value={v.triple_fee} onChange={(e) => set("triple_fee", e.target.value)} /></Field>
        <Field label="Security Deposit"><Input type="number" value={v.security_deposit} onChange={(e) => set("security_deposit", e.target.value)} /></Field>
      </Card>

      <Card title="Mess">
        <Field label="Veg / Non-Veg"><Input value={v.mess_veg_nonveg} onChange={(e) => set("mess_veg_nonveg", e.target.value)} /></Field>
        <Field label="Mess Timings"><Input value={v.mess_timings} onChange={(e) => set("mess_timings", e.target.value)} /></Field>
      </Card>

      <Card title="Facilities">
        <div className="col-span-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {FACILITIES.map((f) => (
            <label key={f.key} className="flex items-center gap-2 text-sm">
              <Checkbox checked={!!v.facilities[f.key]} onCheckedChange={(c) => set("facilities", { ...v.facilities, [f.key]: !!c })} /> {f.label}
            </label>
          ))}
        </div>
      </Card>

      <Card title="Security">
        <div className="col-span-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {SECURITY_KEYS.map((f) => (
            <label key={f.key} className="flex items-center gap-2 text-sm">
              <Checkbox checked={!!v.security[f.key]} onCheckedChange={(c) => set("security", { ...v.security, [f.key]: !!c })} /> {f.label}
            </label>
          ))}
        </div>
      </Card>

      <Card title="Hostel Images (min 5 URLs)">
        <div className="col-span-2 space-y-2">
          {v.images.map((url, i) => (
            <div key={i} className="flex gap-2">
              <Input value={url} onChange={(e) => setImage(i, e.target.value)} placeholder={`Image URL ${i + 1} (building, rooms, mess, security, study area…)`} />
              {v.images.length > 5 && (
                <Button type="button" variant="ghost" size="icon" onClick={() => set("images", v.images.filter((_, idx) => idx !== i))}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" className="gap-1" onClick={() => set("images", [...v.images, ""])}>
            <Plus className="h-3.5 w-3.5" /> Add image
          </Button>
        </div>
      </Card>

      <div className="col-span-2"><Card title="Rules & Regulations"><Field label="" full><Textarea rows={3} value={v.rules} onChange={(e) => set("rules", e.target.value)} /></Field></Card></div>

      <Button type="submit" size="lg" disabled={saving}>{saving ? "Saving…" : submitLabel}</Button>
    </form>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="stat-card p-5">
      <h2 className="mb-4 font-semibold">{title}</h2>
      <div className="grid grid-cols-2 gap-3">{children}</div>
    </div>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={`space-y-1.5 ${full ? "col-span-2" : ""}`}>
      {label && <Label className="text-xs">{label}</Label>}
      {children}
    </div>
  );
}
