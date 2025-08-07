import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Project, ProjectFile } from '../types/user';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'photographer' | 'designer' | 'admin';
  department?: string;
  position?: string;
  salary?: number;
  phone?: string;
  telegram?: string;
  avatar?: string;
  createdAt: Date;
  password?: string;
}

interface AuthContextType {
  user: User | null;
  users: User[];
  projects: Project[];
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: Omit<User, 'id'> & { password: string }) => Promise<boolean>;
  addUser: (userData: Omit<User, 'id'> & { password: string }) => Promise<void>;
  updateUser: (id: string, userData: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  addProject: (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProject: (id: string, projectData: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addFileToProject: (projectId: string, file: Omit<ProjectFile, 'id' | 'uploadedAt'>) => Promise<void>;
  removeFileFromProject: (projectId: string, fileId: string) => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Простая система аутентификации без базы данных
const ADMIN_CREDENTIALS = {
  email: 'admin',
  password: 'admin'
};

// Тестовые данные
const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@photoalbums.com',
    name: 'Администратор',
    role: 'admin',
    department: 'Управление',
    position: 'Главный менеджер',
    salary: 80000,
    phone: '+7 (495) 123-45-67',
    telegram: '@admin',
    createdAt: new Date('2024-01-01')
  },
  {
    id: '2',
    email: 'anna.ivanova@photoalbums.com',
    name: 'Анна Иванова',
    role: 'photographer',
    department: 'Фотостудия',
    position: 'Старший фотограф',
    salary: 60000,
    phone: '+7 (495) 123-45-68',
    telegram: '@anna_photo',
    createdAt: new Date('2024-01-15')
  },
  {
    id: '3',
    email: 'elena.sidorova@photoalbums.com',
    name: 'Елена Сидорова',
    role: 'designer',
    department: 'Дизайн',
    position: 'Ведущий дизайнер',
    salary: 55000,
    phone: '+7 (495) 123-45-69',
    telegram: '@elena_design',
    createdAt: new Date('2024-01-20')
  },
  {
    id: '4',
    email: 'mikhail.petrov@photoalbums.com',
    name: 'Михаил Петров',
    role: 'photographer',
    department: 'Фотостудия',
    position: 'Фотограф',
    salary: 45000,
    phone: '+7 (495) 123-45-70',
    telegram: '@mikhail_photo',
    createdAt: new Date('2024-02-01')
  }
];

const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Свадебный альбом Анны и Михаила',
    albumType: 'Свадебный альбом',
    description: 'Создание премиального свадебного альбома с фотосессией в парке и студии',
    status: 'in-progress',
    manager: mockUsers[0],
    photographers: [mockUsers[1]],
    designers: [mockUsers[2]],
    deadline: new Date('2024-03-15'),
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-10'),
    photosCount: 0,
    designsCount: 0,
    files: []
  },
  {
    id: '2',
    title: 'Выпускной альбом 11-А класса',
    albumType: 'Выпускной альбом',
    description: 'Групповые и индивидуальные фотографии выпускников с торжественной церемонии',
    status: 'planning',
    manager: mockUsers[0],
    photographers: [mockUsers[3]],
    designers: [mockUsers[2]],
    deadline: new Date('2024-06-01'),
    createdAt: new Date('2024-02-05'),
    updatedAt: new Date('2024-02-05'),
    photosCount: 0,
    designsCount: 0,
    files: []
  }
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Проверяем сохраненную сессию
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('currentUser');
      }
    }
    
    // Загружаем сохраненных пользователей
    const savedUsers = localStorage.getItem('users');
    if (savedUsers) {
      try {
        const parsedUsers = JSON.parse(savedUsers);
        // Преобразуем строки дат обратно в объекты Date
        const usersWithDates = parsedUsers.map((user: any) => ({
          ...user,
          createdAt: new Date(user.createdAt)
        }));
        setUsers(usersWithDates);
      } catch (error) {
        localStorage.removeItem('users');
      }
    }
    
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('=== ПОПЫТКА ВХОДА ===');
      console.log('Введенный email:', email);
      console.log('Введенный пароль:', password);
      console.log('Всего пользователей в системе:', users.length);
      
      // Показываем всех пользователей с их данными для входа
      console.log('Список всех пользователей:');
      users.forEach((u, index) => {
        console.log(`${index + 1}. Имя: ${u.name}`);
        console.log(`   Email: "${u.email}"`);
        console.log(`   Пароль: "${u.password || 'НЕТ ПАРОЛЯ'}"`);
        console.log(`   Роль: ${u.role}`);
        console.log('   ---');
      });

      // Проверяем админа
      if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
        console.log('✅ Вход как админ');
        const adminUser = users.find(u => u.role === 'admin') || users[0];
        setUser(adminUser);
        localStorage.setItem('currentUser', JSON.stringify(adminUser));
        return true;
      }
      
      // Проверяем созданных пользователей
      console.log('Ищем пользователя среди созданных...');
      const foundUser = users.find(u => u.email === email && u.password === password);
      
      if (foundUser) {
        console.log('✅ Пользователь найден:', foundUser.name);
        setUser(foundUser);
        localStorage.setItem('currentUser', JSON.stringify(foundUser));
        return true;
      } else {
        console.log('❌ Пользователь не найден');
        console.log('Проверяем точные совпадения:');
        users.forEach(u => {
          const emailMatch = u.email === email;
          const passwordMatch = u.password === password;
          console.log(`Пользователь ${u.name}:`);
          console.log(`  Email совпадает: ${emailMatch} ("${u.email}" === "${email}")`);
          console.log(`  Пароль совпадает: ${passwordMatch} ("${u.password}" === "${password}")`);
        });
      }
      
      return false;
    } catch (error) {
      console.error('Ошибка при входе:', error);
      return false;
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const register = async (userData: Omit<User, 'id'> & { password: string }): Promise<boolean> => {
    try {
      const newUser: User = {
        ...userData,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date()
      };
      setUsers(prev => [...prev, newUser]);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const addUser = async (userData: Omit<User, 'id'> & { password: string }): Promise<void> => {
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: userData.name,
      email: userData.email,
      role: userData.role,
      department: userData.department,
      position: userData.position,
      salary: userData.salary,
      phone: userData.phone,
      telegram: userData.telegram,
      avatar: userData.avatar,
      password: userData.password,
      createdAt: new Date()
    };
    
    console.log('=== СОЗДАНИЕ НОВОГО ПОЛЬЗОВАТЕЛЯ ===');
    console.log('Имя:', newUser.name);
    console.log('Email для входа:', newUser.email);
    console.log('Пароль для входа:', newUser.password);
    console.log('Роль:', newUser.role);
    console.log('ID:', newUser.id);
    
    setUsers(prev => [...prev, newUser]);
    
    // Сохраняем пользователей в localStorage для постоянства
    const updatedUsers = [...users, newUser];
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    console.log('✅ Пользователь сохранен в localStorage');
    console.log('Общее количество пользователей:', updatedUsers.length);
  };

  const updateUser = async (id: string, userData: Partial<User>): Promise<void> => {
    const updatedUsers = users.map(u => u.id === id ? { ...u, ...userData } : u);
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    if (user && user.id === id) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
  };

  const deleteUser = async (id: string): Promise<void> => {
    const updatedUsers = users.filter(u => u.id !== id);
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    if (user && user.id === id) {
      setUser(null);
      localStorage.removeItem('currentUser');
    }
  };

  const addProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
    const newProject: Project = {
      ...projectData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date(),
      photosCount: 0,
      designsCount: 0,
      files: []
    };
    setProjects(prev => [...prev, newProject]);
  };

  const updateProject = async (id: string, projectData: Partial<Project>): Promise<void> => {
    setProjects(prev => prev.map(p => 
      p.id === id 
        ? { 
            ...p, 
            ...projectData, 
            updatedAt: new Date(),
            photosCount: projectData.files ? projectData.files.filter(f => f.type.startsWith('image/')).length : p.photosCount,
            designsCount: projectData.files ? projectData.files.filter(f => f.type.includes('design') || f.name.toLowerCase().includes('макет') || f.name.toLowerCase().includes('design')).length : p.designsCount
          }
        : p
    ));
  };

  const deleteProject = async (id: string): Promise<void> => {
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const addFileToProject = async (projectId: string, fileData: Omit<ProjectFile, 'id' | 'uploadedAt'>): Promise<void> => {
    const newFile: ProjectFile = {
      ...fileData,
      id: Math.random().toString(36).substr(2, 9),
      uploadedAt: new Date()
    };

    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const updatedFiles = [...p.files, newFile];
        return {
          ...p,
          files: updatedFiles,
          photosCount: updatedFiles.filter(f => f.type.startsWith('image/')).length,
          designsCount: updatedFiles.filter(f => f.type.includes('design') || f.name.toLowerCase().includes('макет') || f.name.toLowerCase().includes('design')).length,
          updatedAt: new Date()
        };
      }
      return p;
    }));
  };

  const removeFileFromProject = async (projectId: string, fileId: string): Promise<void> => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const updatedFiles = p.files.filter(f => f.id !== fileId);
        return {
          ...p,
          files: updatedFiles,
          photosCount: updatedFiles.filter(f => f.type.startsWith('image/')).length,
          designsCount: updatedFiles.filter(f => f.type.includes('design') || f.name.toLowerCase().includes('макет') || f.name.toLowerCase().includes('design')).length,
          updatedAt: new Date()
        };
      }
      return p;
    }));
  };

  const value: AuthContextType = {
    user,
    users,
    projects,
    login,
    logout,
    register,
    addUser,
    updateUser,
    deleteUser,
    addProject,
    updateProject,
    deleteProject,
    addFileToProject,
    removeFileFromProject,
    isAuthenticated: !!user,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};