-- Complaints: enforce ownership
DELETE FROM public.complaints WHERE user_id IS NULL;
ALTER TABLE public.complaints ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.complaints ALTER COLUMN user_id SET NOT NULL;

-- Inquiries: enforce ownership
DELETE FROM public.inquiries WHERE user_id IS NULL;
ALTER TABLE public.inquiries ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.inquiries ALTER COLUMN user_id SET NOT NULL;

-- Hostels: hide owner email/phone from anonymous users via column-level grants
REVOKE SELECT ON public.hostels FROM anon;
GRANT SELECT (
  rules, id, owner_id, name, description, hostel_type, address, city, state,
  pincode, college_name, distance_from_college, maps_link, latitude, longitude,
  single_fee, double_fee, triple_fee, security_deposit, mess_veg_nonveg,
  mess_timings, mess_menu, security_info, facilities, rating, review_count,
  is_published, created_at, updated_at
) ON public.hostels TO anon;

-- Rooms: restrict public reads to rooms of published hostels (or owner's own)
DROP POLICY IF EXISTS "Anyone can view rooms" ON public.rooms;
CREATE POLICY "View rooms of published hostels"
ON public.rooms
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM public.hostels h
    WHERE h.id = rooms.hostel_id
      AND (h.is_published = true OR h.owner_id = auth.uid())
  )
);