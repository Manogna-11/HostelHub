REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.refresh_hostel_rating() FROM PUBLIC, anon, authenticated;

DROP POLICY IF EXISTS "Authenticated users create inquiries" ON public.inquiries;
CREATE POLICY "Users create their own inquiries" ON public.inquiries
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);