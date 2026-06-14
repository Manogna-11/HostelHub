ALTER TABLE public.profiles DROP COLUMN IF EXISTS department;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS year;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS admin_id text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS designation text;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _role public.app_role;
BEGIN
  _role := COALESCE(NULLIF(NEW.raw_user_meta_data->>'role',''), 'student')::public.app_role;

  INSERT INTO public.profiles (id, name, email, student_id, admin_id, phone, gender, room_number, designation)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name',''),
    NEW.email,
    NEW.raw_user_meta_data->>'student_id',
    NEW.raw_user_meta_data->>'admin_id',
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'gender',
    NEW.raw_user_meta_data->>'room_number',
    NEW.raw_user_meta_data->>'designation'
  );

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, _role)
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$function$;