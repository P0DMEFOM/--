import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Project, ProjectFile } from '../types/user';

interface User {
  id: string;
  email: string;
  login: string;
  password: string;
  name: string;
  role: 'photographer' | 'designer' | 'admin';
  department?: string;
  position?: string;
  salary?: number;
  phone?: string;
  telegram?: string;
  avatar?: string;
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  users: User[];
  projects: Project[];
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: Omit<User, 'id'> & { password: string }) => Promise<boolean>;
  addUser: (userData: Omit<User, 'id'>) => void;
  updateUser: (id: string, userData: Partial<User>) => void;
  deleteUser: (id: string) => void;
  addProject: (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProject: (id: string, projectData: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addFileToProject: (projectId: string, file: Omit<ProjectFile, 'id' | 'uploadedAt'>) => void;
  removeFileFromProject: (projectId: string, fileId: string) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users data
const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin',
    login: 'admin',
    password: 'admin',
    name: 'Администратор',
    role: 'admin',
    department: 'Управление',
    position: 'Системный администратор',
    createdAt: new Date()
  },
  {
    id: '2',
    email: 'john@company.com',
    login: 'john@company.com',
    password: 'password123',
    name: 'John Doe',
    role: 'photographer',
    department: 'Engineering',
    position: 'Software Developer',
    salary: 75000,
    createdAt: new Date()
  },
  {
    id: '3',
    email: 'jane@company.com',
    login: 'jane@company.com',
    password: 'password123',
    name: 'Jane Smith',
    role: 'designer',
    department: 'Marketing',
    position: 'Marketing Manager',
    salary: 65000,
    createdAt: new Date()
  }
];

// Mock projects data
const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Свадебный альбом "Анна & Михаил"',
    albumType: 'Свадебный альбом',
    description: 'Создание премиального свадебного альбома для молодоженов',
    status: 'in-progress',
    manager: mockUsers[0], // admin
    photographers: [mockUsers[1]], // John Doe
    designers: [mockUsers[2]], // Jane Smith
    deadline: new Date('2024-03-15'),
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-10'),
    photosCount: 45,
    designsCount: 3,
    files: []
  },
  {
    id: '2',
    title: 'Детская фотосессия "Семья Петровых"',
    albumType: 'Детский альбом',
    description: 'Семейная фотосессия с детьми для создания памятного альбома',
    status: 'planning',
    manager: mockUsers[0],
    photographers: [mockUsers[1]],
    designers: [],
    deadline: new Date('2024-03-20'),
    createdAt: new Date('2024-02-05'),
    updatedAt: new Date('2024-02-05'),
    photosCount: 0,
    designsCount: 0,
    files: []
  },
  {
    id: '3',
    title: 'Корпоративный альбом "ООО Рога и копыта"',
    albumType: 'Корпоративный альбом',
    description: 'Корпоративная фотосессия и создание презентационного альбома',
    status: 'review',
    manager: mockUsers[0],
    photographers: [mockUsers[1]],
    designers: [mockUsers[2]],
    deadline: new Date('2024-02-28'),
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-02-12'),
    photosCount: 30,
    designsCount: 5,
    files: []
  }
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [projects, setProjects] = useState<Project[]>(mockProjects);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock authentication - in real app, this would call an API
    const foundUser = users.find(u => u.login === email || u.email === email);
    if (foundUser) {
      if (foundUser.password === password) {
        setUser(foundUser);
        return true;
      }
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const register = async (userData: Omit<User, 'id'> & { password: string }): Promise<boolean> => {
    // Mock registration - in real app, this would call an API
    const existingUser = users.find(u => u.login === userData.login);
    if (existingUser) {
      return false; // User already exists
    }

    const newUser: User = {
      id: Date.now().toString(),
      email: userData.email,
      login: userData.login,
      password: userData.password,
      name: userData.name,
      role: userData.role,
      department: userData.department,
      position: userData.position,
      salary: userData.salary,
      phone: userData.phone,
      telegram: userData.telegram,
      createdAt: new Date()
    };

    setUsers(prev => [...prev, newUser]);
    setUser(newUser);
    return true;
  };

  const addUser = (userData: Omit<User, 'id'> & { password: string }) => {
    const newUser: User = {
      id: Date.now().toString(),
      ...userData,
      createdAt: new Date()
    };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = (id: string, userData: Partial<User>) => {
    setUsers(prev => prev.map(user => 
      user.id === id ? { ...user, ...userData } : user
    ));
    
    // Update current user if it's the same user being updated
    if (user && user.id === id) {
      setUser(prev => prev ? { ...prev, ...userData } : null);
    }
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(user => user.id !== id));
    
    // Logout if current user is being deleted
    if (user && user.id === id) {
      setUser(null);
    }
  };

  const addProject = (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProject: Project = {
      ...projectData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setProjects(prev => [...prev, newProject]);
  };

  const updateProject = (id: string, projectData: Partial<Project>) => {
    setProjects(prev => prev.map(project => 
      project.id === id 
        ? { ...project, ...projectData, updatedAt: new Date() } 
        : project
    ));
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(project => project.id !== id));
  };

  const addFileToProject = (projectId: string, fileData: Omit<ProjectFile, 'id' | 'uploadedAt'>) => {
    const newFile: ProjectFile = {
      ...fileData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      uploadedAt: new Date()
    };

    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? { 
            ...project, 
            files: [...project.files, newFile],
            updatedAt: new Date()
          }
        : project
    ));
  };

  const removeFileFromProject = (projectId: string, fileId: string) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? { 
            ...project, 
            files: project.files.filter(file => file.id !== fileId),
            updatedAt: new Date()
          }
        : project
    ));
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
    isAuthenticated: !!user
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