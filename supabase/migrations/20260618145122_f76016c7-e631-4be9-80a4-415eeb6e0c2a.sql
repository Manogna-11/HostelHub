
CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hostel_id uuid NOT NULL REFERENCES public.hostels(id) ON DELETE CASCADE,
  sharing_type text NOT NULL DEFAULT 'Single Sharing',
  name text,
  phone text,
  message text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own bookings"
  ON public.bookings FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners view bookings for their hostels"
  ON public.bookings FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.hostels h WHERE h.id = bookings.hostel_id AND h.owner_id = auth.uid()));

CREATE POLICY "Owners update bookings for their hostels"
  ON public.bookings FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.hostels h WHERE h.id = bookings.hostel_id AND h.owner_id = auth.uid()));

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.complaints ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE POLICY "Residents can post complaints"
  ON public.complaints FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM public.bookings b WHERE b.hostel_id = complaints.hostel_id AND b.user_id = auth.uid())
  );

CREATE POLICY "Users view their own complaints"
  ON public.complaints FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
