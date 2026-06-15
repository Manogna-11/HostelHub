-- ============================================================
-- HostelHub: Discovery & Management Platform schema
-- ============================================================

-- Drop legacy single-hostel tables (restructure approved)
DROP TABLE IF EXISTS public.chat_history CASCADE;
DROP TABLE IF EXISTS public.feedback CASCADE;
DROP TABLE IF EXISTS public.notices CASCADE;
DROP TABLE IF EXISTS public.mess_menu CASCADE;
DROP TABLE IF EXISTS public.complaints CASCADE;
DROP TABLE IF EXISTS public.rooms CASCADE;

-- Clean up legacy profile columns not used in the new model
ALTER TABLE public.profiles DROP COLUMN IF EXISTS student_id;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS admin_id;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS room_number;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS designation;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS gender;

-- hostel type enum
DO $$ BEGIN
  CREATE TYPE public.hostel_type AS ENUM ('boys', 'girls', 'coliving');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ============================================================
-- HOSTELS
-- ============================================================
CREATE TABLE public.hostels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  hostel_type public.hostel_type NOT NULL DEFAULT 'coliving',
  address text,
  city text,
  state text,
  pincode text,
  college_name text,
  distance_from_college text,
  maps_link text,
  latitude double precision,
  longitude double precision,
  phone text,
  email text,
  single_fee integer,
  double_fee integer,
  triple_fee integer,
  security_deposit integer,
  rules text,
  mess_veg_nonveg text,
  mess_timings text,
  mess_menu jsonb NOT NULL DEFAULT '{}'::jsonb,
  security_info jsonb NOT NULL DEFAULT '{}'::jsonb,
  facilities jsonb NOT NULL DEFAULT '{}'::jsonb,
  rating numeric(2,1) NOT NULL DEFAULT 0,
  review_count integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.hostels TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hostels TO authenticated;
GRANT ALL ON public.hostels TO service_role;
ALTER TABLE public.hostels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published hostels" ON public.hostels
  FOR SELECT USING (is_published = true OR auth.uid() = owner_id);
CREATE POLICY "Owners insert their hostels" ON public.hostels
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners update their hostels" ON public.hostels
  FOR UPDATE TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners delete their hostels" ON public.hostels
  FOR DELETE TO authenticated USING (auth.uid() = owner_id);

-- ============================================================
-- HOSTEL IMAGES
-- ============================================================
CREATE TABLE public.hostel_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hostel_id uuid NOT NULL REFERENCES public.hostels(id) ON DELETE CASCADE,
  url text NOT NULL,
  category text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.hostel_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hostel_images TO authenticated;
GRANT ALL ON public.hostel_images TO service_role;
ALTER TABLE public.hostel_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view hostel images" ON public.hostel_images
  FOR SELECT USING (true);
CREATE POLICY "Owners manage their hostel images" ON public.hostel_images
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.hostels h WHERE h.id = hostel_id AND h.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.hostels h WHERE h.id = hostel_id AND h.owner_id = auth.uid()));

-- ============================================================
-- ROOMS (inventory)
-- ============================================================
CREATE TABLE public.rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hostel_id uuid NOT NULL REFERENCES public.hostels(id) ON DELETE CASCADE,
  room_number text NOT NULL,
  capacity integer NOT NULL DEFAULT 1,
  occupied_beds integer NOT NULL DEFAULT 0,
  room_type text,
  monthly_fee integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.rooms TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rooms TO authenticated;
GRANT ALL ON public.rooms TO service_role;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view rooms" ON public.rooms
  FOR SELECT USING (true);
CREATE POLICY "Owners manage their rooms" ON public.rooms
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.hostels h WHERE h.id = hostel_id AND h.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.hostels h WHERE h.id = hostel_id AND h.owner_id = auth.uid()));

-- ============================================================
-- RESIDENTS
-- ============================================================
CREATE TABLE public.residents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hostel_id uuid NOT NULL REFERENCES public.hostels(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text,
  room_number text,
  joining_date date,
  fee_status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.residents TO authenticated;
GRANT ALL ON public.residents TO service_role;
ALTER TABLE public.residents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage their residents" ON public.residents
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.hostels h WHERE h.id = hostel_id AND h.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.hostels h WHERE h.id = hostel_id AND h.owner_id = auth.uid()));

-- ============================================================
-- REVIEWS
-- ============================================================
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hostel_id uuid NOT NULL REFERENCES public.hostels(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name text,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  images jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews" ON public.reviews
  FOR SELECT USING (true);
CREATE POLICY "Users insert their own reviews" ON public.reviews
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update their own reviews" ON public.reviews
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete their own reviews" ON public.reviews
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- INQUIRIES
-- ============================================================
CREATE TABLE public.inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hostel_id uuid NOT NULL REFERENCES public.hostels(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  phone text,
  email text,
  message text,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.inquiries TO authenticated;
GRANT ALL ON public.inquiries TO service_role;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners view inquiries for their hostels" ON public.inquiries
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.hostels h WHERE h.id = hostel_id AND h.owner_id = auth.uid()) OR auth.uid() = user_id);
CREATE POLICY "Authenticated users create inquiries" ON public.inquiries
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Owners update inquiry status" ON public.inquiries
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.hostels h WHERE h.id = hostel_id AND h.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.hostels h WHERE h.id = hostel_id AND h.owner_id = auth.uid()));

-- ============================================================
-- COMPLAINTS
-- ============================================================
CREATE TABLE public.complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hostel_id uuid NOT NULL REFERENCES public.hostels(id) ON DELETE CASCADE,
  resident_name text,
  title text NOT NULL,
  description text,
  category text,
  priority text,
  status text NOT NULL DEFAULT 'pending',
  ai_summary text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.complaints TO authenticated;
GRANT ALL ON public.complaints TO service_role;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage their complaints" ON public.complaints
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.hostels h WHERE h.id = hostel_id AND h.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.hostels h WHERE h.id = hostel_id AND h.owner_id = auth.uid()));

-- ============================================================
-- updated_at triggers
-- ============================================================
CREATE TRIGGER trg_hostels_updated BEFORE UPDATE ON public.hostels
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_rooms_updated BEFORE UPDATE ON public.rooms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_residents_updated BEFORE UPDATE ON public.residents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_complaints_updated BEFORE UPDATE ON public.complaints
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- Rating aggregation trigger on reviews
-- ============================================================
CREATE OR REPLACE FUNCTION public.refresh_hostel_rating()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  hid uuid;
BEGIN
  hid := COALESCE(NEW.hostel_id, OLD.hostel_id);
  UPDATE public.hostels h SET
    rating = COALESCE((SELECT ROUND(AVG(rating)::numeric, 1) FROM public.reviews WHERE hostel_id = hid), 0),
    review_count = (SELECT COUNT(*) FROM public.reviews WHERE hostel_id = hid)
  WHERE h.id = hid;
  RETURN NULL;
END; $$;

CREATE TRIGGER trg_reviews_rating
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.refresh_hostel_rating();

-- ============================================================
-- Simplify new-user trigger (role from metadata, default student)
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _role public.app_role;
BEGIN
  _role := COALESCE(NULLIF(NEW.raw_user_meta_data->>'role',''), 'student')::public.app_role;
  INSERT INTO public.profiles (id, name, email, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    NEW.raw_user_meta_data->>'phone'
  ) ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, _role)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;