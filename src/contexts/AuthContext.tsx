import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';
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

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Загрузка данных пользователя
  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error) throw error;

      if (profile) {
        const userData: User = {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          role: profile.role,
          department: profile.department,
          position: profile.position,
          salary: profile.salary,
          phone: profile.phone,
          telegram: profile.telegram,
          avatar: profile.avatar,
          createdAt: new Date(profile.created_at)
        };
        setUser(userData);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  // Загрузка всех пользователей
  const loadUsers = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const usersData: User[] = profiles.map(profile => ({
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role,
        department: profile.department,
        position: profile.position,
        salary: profile.salary,
        phone: profile.phone,
        telegram: profile.telegram,
        avatar: profile.avatar,
        createdAt: new Date(profile.created_at)
      }));

      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  // Загрузка проектов
  const loadProjects = async () => {
    try {
      const { data: projectsData, error } = await supabase
        .from('projects')
        .select(`
          *,
          manager:profiles!projects_manager_id_fkey(*),
          project_members(
            user_id,
            role,
            profiles(*)
          ),
          project_files(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const projects: Project[] = projectsData.map(project => {
        const manager = project.manager ? {
          id: project.manager.id,
          email: project.manager.email,
          name: project.manager.name,
          role: project.manager.role,
          department: project.manager.department,
          position: project.manager.position,
          salary: project.manager.salary,
          phone: project.manager.phone,
          telegram: project.manager.telegram,
          avatar: project.manager.avatar,
          createdAt: new Date(project.manager.created_at)
        } : undefined;

        const photographers = project.project_members
          .filter((member: any) => member.role === 'photographer')
          .map((member: any) => ({
            id: member.profiles.id,
            email: member.profiles.email,
            name: member.profiles.name,
            role: member.profiles.role,
            department: member.profiles.department,
            position: member.profiles.position,
            salary: member.profiles.salary,
            phone: member.profiles.phone,
            telegram: member.profiles.telegram,
            avatar: member.profiles.avatar,
            createdAt: new Date(member.profiles.created_at)
          }));

        const designers = project.project_members
          .filter((member: any) => member.role === 'designer')
          .map((member: any) => ({
            id: member.profiles.id,
            email: member.profiles.email,
            name: member.profiles.name,
            role: member.profiles.role,
            department: member.profiles.department,
            position: member.profiles.position,
            salary: member.profiles.salary,
            phone: member.profiles.phone,
            telegram: member.profiles.telegram,
            avatar: member.profiles.avatar,
            createdAt: new Date(member.profiles.created_at)
          }));

        const files: ProjectFile[] = project.project_files.map((file: any) => ({
          id: file.id,
          name: file.name,
          type: file.file_type,
          size: file.file_size,
          preview: file.preview_url,
          uploadedBy: users.find(u => u.id === file.uploaded_by) || {
            id: file.uploaded_by,
            email: '',
            name: 'Unknown User',
            role: 'photographer',
            createdAt: new Date()
          },
          uploadedAt: new Date(file.uploaded_at)
        }));

        return {
          id: project.id,
          title: project.title,
          albumType: project.album_type,
          description: project.description,
          status: project.status,
          manager,
          photographers,
          designers,
          deadline: new Date(project.deadline),
          createdAt: new Date(project.created_at),
          updatedAt: new Date(project.updated_at),
          photosCount: files.filter(f => f.type.startsWith('image/')).length,
          designsCount: files.filter(f => f.type.includes('design') || f.name.toLowerCase().includes('макет') || f.name.toLowerCase().includes('design')).length,
          files
        };
      });

      setProjects(projects);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  // Инициализация
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          await loadUserProfile(session.user);
        }
        
        await loadUsers();
        await loadProjects();
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await loadUserProfile(session.user);
        await loadUsers();
        await loadProjects();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.user) {
        await loadUserProfile(data.user);
        await loadUsers();
        await loadProjects();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const register = async (userData: Omit<User, 'id'> & { password: string }): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        // Обновляем профиль с дополнительными данными
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            name: userData.name,
            role: userData.role,
            department: userData.department,
            position: userData.position,
            salary: userData.salary,
            phone: userData.phone,
            telegram: userData.telegram
          })
          .eq('id', data.user.id);

        if (profileError) throw profileError;

        await loadUsers();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const addUser = async (userData: Omit<User, 'id'> & { password: string }): Promise<void> => {
    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        user_metadata: {
          name: userData.name
        }
      });

      if (error) throw error;

      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: userData.email,
            name: userData.name,
            role: userData.role,
            department: userData.department,
            position: userData.position,
            salary: userData.salary,
            phone: userData.phone,
            telegram: userData.telegram
          });

        if (profileError) throw profileError;
        await loadUsers();
      }
    } catch (error) {
      console.error('Add user error:', error);
      throw error;
    }
  };

  const updateUser = async (id: string, userData: Partial<User>): Promise<void> => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: userData.name,
          role: userData.role,
          department: userData.department,
          position: userData.position,
          salary: userData.salary,
          phone: userData.phone,
          telegram: userData.telegram
        })
        .eq('id', id);

      if (error) throw error;

      await loadUsers();
      
      if (user && user.id === id) {
        setUser(prev => prev ? { ...prev, ...userData } : null);
      }
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  };

  const deleteUser = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase.auth.admin.deleteUser(id);
      if (error) throw error;

      await loadUsers();
      
      if (user && user.id === id) {
        setUser(null);
      }
    } catch (error) {
      console.error('Delete user error:', error);
      throw error;
    }
  };

  const addProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
    try {
      const { data: project, error } = await supabase
        .from('projects')
        .insert({
          title: projectData.title,
          album_type: projectData.albumType,
          description: projectData.description,
          status: projectData.status,
          manager_id: projectData.manager?.id,
          deadline: projectData.deadline.toISOString().split('T')[0]
        })
        .select()
        .single();

      if (error) throw error;

      // Добавляем участников проекта
      if (project) {
        const members = [
          ...projectData.photographers.map(p => ({
            project_id: project.id,
            user_id: p.id,
            role: 'photographer' as const
          })),
          ...projectData.designers.map(d => ({
            project_id: project.id,
            user_id: d.id,
            role: 'designer' as const
          }))
        ];

        if (members.length > 0) {
          const { error: membersError } = await supabase
            .from('project_members')
            .insert(members);

          if (membersError) throw membersError;
        }
      }

      await loadProjects();
    } catch (error) {
      console.error('Add project error:', error);
      throw error;
    }
  };

  const updateProject = async (id: string, projectData: Partial<Project>): Promise<void> => {
    try {
      const updateData: any = {};
      
      if (projectData.title) updateData.title = projectData.title;
      if (projectData.albumType) updateData.album_type = projectData.albumType;
      if (projectData.description !== undefined) updateData.description = projectData.description;
      if (projectData.status) updateData.status = projectData.status;
      if (projectData.manager) updateData.manager_id = projectData.manager.id;
      if (projectData.deadline) updateData.deadline = projectData.deadline.toISOString().split('T')[0];

      const { error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      // Обновляем участников проекта если они изменились
      if (projectData.photographers || projectData.designers) {
        // Удаляем старых участников
        const { error: deleteError } = await supabase
          .from('project_members')
          .delete()
          .eq('project_id', id);

        if (deleteError) throw deleteError;

        // Добавляем новых участников
        const members = [
          ...(projectData.photographers || []).map(p => ({
            project_id: id,
            user_id: p.id,
            role: 'photographer' as const
          })),
          ...(projectData.designers || []).map(d => ({
            project_id: id,
            user_id: d.id,
            role: 'designer' as const
          }))
        ];

        if (members.length > 0) {
          const { error: membersError } = await supabase
            .from('project_members')
            .insert(members);

          if (membersError) throw membersError;
        }
      }

      await loadProjects();
    } catch (error) {
      console.error('Update project error:', error);
      throw error;
    }
  };

  const deleteProject = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadProjects();
    } catch (error) {
      console.error('Delete project error:', error);
      throw error;
    }
  };

  const addFileToProject = async (projectId: string, fileData: Omit<ProjectFile, 'id' | 'uploadedAt'>): Promise<void> => {
    try {
      const { error } = await supabase
        .from('project_files')
        .insert({
          project_id: projectId,
          name: fileData.name,
          file_type: fileData.type,
          file_size: fileData.size,
          preview_url: fileData.preview,
          file_url: fileData.preview || '',
          uploaded_by: fileData.uploadedBy.id
        });

      if (error) throw error;
      await loadProjects();
    } catch (error) {
      console.error('Add file error:', error);
      throw error;
    }
  };

  const removeFileFromProject = async (projectId: string, fileId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('project_files')
        .delete()
        .eq('id', fileId);

      if (error) throw error;
      await loadProjects();
    } catch (error) {
      console.error('Remove file error:', error);
      throw error;
    }
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