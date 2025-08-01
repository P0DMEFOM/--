/*
  # Инициализация базы данных PhotoAlbums

  1. Новые таблицы
    - `profiles` - профили пользователей (расширение auth.users)
    - `projects` - проекты фотоальбомов
    - `project_files` - файлы проектов
    - `project_members` - участники проектов
    - `calendar_events` - события календаря
    - `comments` - комментарии к проектам

  2. Безопасность
    - Включен RLS для всех таблиц
    - Политики доступа для каждой роли
*/

-- Создание таблицы профилей пользователей (расширение auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('photographer', 'designer', 'admin')),
  department text,
  position text,
  salary integer,
  phone text,
  telegram text,
  avatar text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Создание таблицы проектов
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  album_type text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'in-progress', 'review', 'completed')),
  manager_id uuid REFERENCES profiles(id),
  deadline date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Создание таблицы участников проектов
CREATE TABLE IF NOT EXISTS project_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('photographer', 'designer')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(project_id, user_id, role)
);

-- Создание таблицы файлов проектов
CREATE TABLE IF NOT EXISTS project_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  file_type text NOT NULL,
  file_size integer NOT NULL,
  preview_url text,
  file_url text NOT NULL,
  uploaded_by uuid REFERENCES profiles(id),
  uploaded_at timestamptz DEFAULT now()
);

-- Создание таблицы событий календаря
CREATE TABLE IF NOT EXISTS calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  event_date date NOT NULL,
  event_time time NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('meeting', 'photoshoot', 'design', 'deadline', 'other')),
  created_by uuid REFERENCES profiles(id),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Создание таблицы комментариев
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  author_id uuid REFERENCES profiles(id),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Включение RLS для всех таблиц
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Политики для таблицы profiles
CREATE POLICY "Users can read all profiles" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert profiles" ON profiles FOR INSERT TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update profiles" ON profiles FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "Admins can delete profiles" ON profiles FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Политики для таблицы projects
CREATE POLICY "Users can read projects they're involved in" ON projects FOR SELECT TO authenticated USING (
  manager_id = auth.uid() OR
  EXISTS (SELECT 1 FROM project_members WHERE project_id = id AND user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can insert projects" ON projects FOR INSERT TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Managers and admins can update projects" ON projects FOR UPDATE TO authenticated USING (
  manager_id = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can delete projects" ON projects FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Политики для таблицы project_members
CREATE POLICY "Users can read project members" ON project_members FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM projects p 
    WHERE p.id = project_id AND (
      p.manager_id = auth.uid() OR
      EXISTS (SELECT 1 FROM project_members pm WHERE pm.project_id = p.id AND pm.user_id = auth.uid()) OR
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    )
  )
);
CREATE POLICY "Managers and admins can manage project members" ON project_members FOR ALL TO authenticated USING (
  EXISTS (
    SELECT 1 FROM projects p 
    WHERE p.id = project_id AND (
      p.manager_id = auth.uid() OR
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    )
  )
);

-- Политики для таблицы project_files
CREATE POLICY "Project members can read files" ON project_files FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM projects p 
    WHERE p.id = project_id AND (
      p.manager_id = auth.uid() OR
      EXISTS (SELECT 1 FROM project_members pm WHERE pm.project_id = p.id AND pm.user_id = auth.uid()) OR
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    )
  )
);
CREATE POLICY "Project members can upload files" ON project_files FOR INSERT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM projects p 
    WHERE p.id = project_id AND (
      p.manager_id = auth.uid() OR
      EXISTS (SELECT 1 FROM project_members pm WHERE pm.project_id = p.id AND pm.user_id = auth.uid()) OR
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    )
  )
);
CREATE POLICY "File uploaders and admins can delete files" ON project_files FOR DELETE TO authenticated USING (
  uploaded_by = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Политики для таблицы calendar_events
CREATE POLICY "Users can read all calendar events" ON calendar_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create calendar events" ON calendar_events FOR INSERT TO authenticated USING (created_by = auth.uid());
CREATE POLICY "Event creators and admins can update events" ON calendar_events FOR UPDATE TO authenticated USING (
  created_by = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Event creators and admins can delete events" ON calendar_events FOR DELETE TO authenticated USING (
  created_by = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Политики для таблицы comments
CREATE POLICY "Project members can read comments" ON comments FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM projects p 
    WHERE p.id = project_id AND (
      p.manager_id = auth.uid() OR
      EXISTS (SELECT 1 FROM project_members pm WHERE pm.project_id = p.id AND pm.user_id = auth.uid()) OR
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    )
  )
);
CREATE POLICY "Project members can create comments" ON comments FOR INSERT TO authenticated USING (
  author_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM projects p 
    WHERE p.id = project_id AND (
      p.manager_id = auth.uid() OR
      EXISTS (SELECT 1 FROM project_members pm WHERE pm.project_id = p.id AND pm.user_id = auth.uid()) OR
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    )
  )
);
CREATE POLICY "Comment authors and admins can update comments" ON comments FOR UPDATE TO authenticated USING (
  author_id = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Comment authors and admins can delete comments" ON comments FOR DELETE TO authenticated USING (
  author_id = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Создание индексов для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_projects_manager_id ON projects(manager_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_deadline ON projects(deadline);
CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_project_files_project_id ON project_files(project_id);
CREATE INDEX IF NOT EXISTS idx_project_files_uploaded_by ON project_files(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_calendar_events_date ON calendar_events(event_date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_created_by ON calendar_events(created_by);
CREATE INDEX IF NOT EXISTS idx_comments_project_id ON comments(project_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);

-- Функция для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Функция для создания профиля при регистрации
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'name', 'Новый пользователь'), 'photographer');
  RETURN new;
END;
$$ language plpgsql security definer;

-- Триггер для автоматического создания профиля
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Вставка тестового администратора
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@photoalbums.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Администратор"}',
  false,
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (id, email, name, role, department, position, created_at) VALUES
('00000000-0000-0000-0000-000000000001', 'admin@photoalbums.com', 'Администратор', 'admin', 'Управление', 'Системный администратор', now())
ON CONFLICT (id) DO NOTHING;