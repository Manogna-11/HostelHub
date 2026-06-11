
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'student');
CREATE TYPE public.complaint_status AS ENUM ('open', 'in_progress', 'resolved');
CREATE TYPE public.complaint_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE public.complaint_category AS ENUM ('electrical','plumbing','cleaning','internet','furniture','mess','other');
CREATE TYPE public.notice_priority AS ENUM ('low','medium','high');
CREATE TYPE public.room_status AS ENUM ('available','occupied','full','maintenance');
CREATE TYPE public.sentiment AS ENUM ('positive','neutral','negative');

-- Profiles (students + admins basic info)
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id TEXT,
  name TEXT NOT NULL DEFAULT '',
  email TEXT,
  phone TEXT,
  gender TEXT,
  department TEXT,
  year TEXT,
  room_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'admin')
$$;

-- updated_at helper
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- new user trigger: create profile + default student role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, student_id, phone, gender, department, year)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name',''),
    NEW.email,
    NEW.raw_user_meta_data->>'student_id',
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'gender',
    NEW.raw_user_meta_data->>'department',
    NEW.raw_user_meta_data->>'year'
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'student')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Profiles policies
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id OR public.is_admin(auth.uid()));
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id OR public.is_admin(auth.uid()));
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins delete profiles" ON public.profiles FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- Rooms
CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_number TEXT NOT NULL UNIQUE,
  capacity INT NOT NULL DEFAULT 2,
  occupied_count INT NOT NULL DEFAULT 0,
  floor INT NOT NULL DEFAULT 1,
  room_type TEXT NOT NULL DEFAULT 'Standard',
  status room_status NOT NULL DEFAULT 'available',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rooms TO authenticated;
GRANT ALL ON public.rooms TO service_role;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authed views rooms" ON public.rooms FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage rooms" ON public.rooms FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE TRIGGER trg_rooms_updated BEFORE UPDATE ON public.rooms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Complaints
CREATE TABLE public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category complaint_category NOT NULL DEFAULT 'other',
  priority complaint_priority NOT NULL DEFAULT 'medium',
  status complaint_status NOT NULL DEFAULT 'open',
  ai_summary TEXT,
  room_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.complaints TO authenticated;
GRANT ALL ON public.complaints TO service_role;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students view own complaints" ON public.complaints FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "Students create complaints" ON public.complaints FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner or admin update complaints" ON public.complaints FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.is_admin(auth.uid())) WITH CHECK (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "Owner or admin delete complaints" ON public.complaints FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE TRIGGER trg_complaints_updated BEFORE UPDATE ON public.complaints FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Notices
CREATE TABLE public.notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority notice_priority NOT NULL DEFAULT 'medium',
  ai_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notices TO authenticated;
GRANT ALL ON public.notices TO service_role;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authed views notices" ON public.notices FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage notices" ON public.notices FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE TRIGGER trg_notices_updated BEFORE UPDATE ON public.notices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Feedback
CREATE TABLE public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INT NOT NULL DEFAULT 5,
  feedback_text TEXT NOT NULL,
  sentiment sentiment,
  sentiment_score NUMERIC,
  ai_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.feedback TO authenticated;
GRANT ALL ON public.feedback TO service_role;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students view own feedback" ON public.feedback FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "Students create feedback" ON public.feedback FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Mess menu
CREATE TABLE public.mess_menu (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week TEXT NOT NULL,
  breakfast TEXT,
  lunch TEXT,
  snacks TEXT,
  dinner TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (day_of_week)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mess_menu TO authenticated;
GRANT ALL ON public.mess_menu TO service_role;
ALTER TABLE public.mess_menu ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authed views menu" ON public.mess_menu FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage menu" ON public.mess_menu FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE TRIGGER trg_mess_updated BEFORE UPDATE ON public.mess_menu FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Chat history
CREATE TABLE public.chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_history TO authenticated;
GRANT ALL ON public.chat_history TO service_role;
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own chat" ON public.chat_history FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
