/*
  # Создание схемы базы данных для PhotoAlbums

  1. Новые таблицы
    - `users` - пользователи системы
    - `projects` - проекты фотоальбомов
    - `project_files` - файлы проектов
    - `project_members` - участники проектов
    - `calendar_events` - события календаря
    - `comments` - комментарии к проектам

  2. Безопасность
    - Включен RLS для всех таблиц
    - Политики доступа для каждой роли
*/

-- Создание таблицы пользователей
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  login text UNIQUE NOT NULL,
  password_hash text NOT NULL,
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
  manager_id uuid REFERENCES users(id),
  deadline date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Создание таблицы участников проектов
CREATE TABLE IF NOT EXISTS project_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
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
  uploaded_by uuid REFERENCES users(id),
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
  created_by uuid REFERENCES users(id),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Создание таблицы комментариев
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  author_id uuid REFERENCES users(id),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Включение RLS для всех таблиц
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Политики для таблицы users
CREATE POLICY "Users can read all users" ON users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert users" ON users FOR INSERT TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update users" ON users FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "Admins can delete users" ON users FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Политики для таблицы projects
CREATE POLICY "Users can read projects they're involved in" ON projects FOR SELECT TO authenticated USING (
  manager_id = auth.uid() OR
  EXISTS (SELECT 1 FROM project_members WHERE project_id = id AND user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can insert projects" ON projects FOR INSERT TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Managers and admins can update projects" ON projects FOR UPDATE TO authenticated USING (
  manager_id = auth.uid() OR
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can delete projects" ON projects FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Политики для таблицы project_members
CREATE POLICY "Users can read project members" ON project_members FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM projects p 
    WHERE p.id = project_id AND (
      p.manager_id = auth.uid() OR
      EXISTS (SELECT 1 FROM project_members pm WHERE pm.project_id = p.id AND pm.user_id = auth.uid()) OR
      EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    )
  )
);
CREATE POLICY "Managers and admins can manage project members" ON project_members FOR ALL TO authenticated USING (
  EXISTS (
    SELECT 1 FROM projects p 
    WHERE p.id = project_id AND (
      p.manager_id = auth.uid() OR
      EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
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
      EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    )
  )
);
CREATE POLICY "Project members can upload files" ON project_files FOR INSERT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM projects p 
    WHERE p.id = project_id AND (
      p.manager_id = auth.uid() OR
      EXISTS (SELECT 1 FROM project_members pm WHERE pm.project_id = p.id AND pm.user_id = auth.uid()) OR
      EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    )
  )
);
CREATE POLICY "File uploaders and admins can delete files" ON project_files FOR DELETE TO authenticated USING (
  uploaded_by = auth.uid() OR
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Политики для таблицы calendar_events
CREATE POLICY "Users can read all calendar events" ON calendar_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create calendar events" ON calendar_events FOR INSERT TO authenticated USING (created_by = auth.uid());
CREATE POLICY "Event creators and admins can update events" ON calendar_events FOR UPDATE TO authenticated USING (
  created_by = auth.uid() OR
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Event creators and admins can delete events" ON calendar_events FOR DELETE TO authenticated USING (
  created_by = auth.uid() OR
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Политики для таблицы comments
CREATE POLICY "Project members can read comments" ON comments FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM projects p 
    WHERE p.id = project_id AND (
      p.manager_id = auth.uid() OR
      EXISTS (SELECT 1 FROM project_members pm WHERE pm.project_id = p.id AND pm.user_id = auth.uid()) OR
      EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
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
      EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    )
  )
);
CREATE POLICY "Comment authors and admins can update comments" ON comments FOR UPDATE TO authenticated USING (
  author_id = auth.uid() OR
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Comment authors and admins can delete comments" ON comments FOR DELETE TO authenticated USING (
  author_id = auth.uid() OR
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Создание индексов для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_login ON users(login);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
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
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Вставка тестовых данных
INSERT INTO users (id, email, login, password_hash, name, role, department, position, created_at) VALUES
('00000000-0000-0000-0000-000000000001', 'admin@photoalbums.com', 'admin', 'admin', 'Администратор', 'admin', 'Управление', 'Системный администратор', now()),
('00000000-0000-0000-0000-000000000002', 'john@company.com', 'john@company.com', 'password123', 'John Doe', 'photographer', 'Фотостудия', 'Старший фотограф', now()),
('00000000-0000-0000-0000-000000000003', 'jane@company.com', 'jane@company.com', 'password123', 'Jane Smith', 'designer', 'Дизайн', 'Ведущий дизайнер', now())
ON CONFLICT (id) DO NOTHING;

-- Вставка тестовых проектов
INSERT INTO projects (id, title, album_type, description, status, manager_id, deadline, created_at, updated_at) VALUES
('00000000-0000-0000-0000-000000000101', 'Свадебный альбом "Анна & Михаил"', 'Свадебный альбом', 'Создание премиального свадебного альбома для молодоженов', 'in-progress', '00000000-0000-0000-0000-000000000001', '2024-03-15', '2024-02-01', '2024-02-10'),
('00000000-0000-0000-0000-000000000102', 'Детская фотосессия "Семья Петровых"', 'Детский альбом', 'Семейная фотосессия с детьми для создания памятного альбома', 'planning', '00000000-0000-0000-0000-000000000001', '2024-03-20', '2024-02-05', '2024-02-05'),
('00000000-0000-0000-0000-000000000103', 'Корпоративный альбом "ООО Рога и копыта"', 'Корпоративный альбом', 'Корпоративная фотосессия и создание презентационного альбома', 'review', '00000000-0000-0000-0000-000000000001', '2024-02-28', '2024-01-15', '2024-02-12')
ON CONFLICT (id) DO NOTHING;

-- Вставка участников проектов
INSERT INTO project_members (project_id, user_id, role) VALUES
('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000002', 'photographer'),
('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000003', 'designer'),
('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000002', 'photographer'),
('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000002', 'photographer'),
('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000003', 'designer')
ON CONFLICT (project_id, user_id, role) DO NOTHING;