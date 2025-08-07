import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/auth/LoginForm';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Dashboard } from './components/dashboard/Dashboard';
import { ProjectsList } from './components/projects/ProjectsList';
import { UploadArea } from './components/upload/UploadArea';
import { AddEmployee } from './components/admin/AddEmployee';
import { EmployeesList } from './components/admin/EmployeesList';
import { SalaryManagement } from './components/admin/SalaryManagement';
import { Calendar } from './components/calendar/Calendar';
import { Script } from './components/script/Script';
import { ProjectDetail } from './components/projects/ProjectDetail';

function AppContent() {
  const { isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectId(projectId);
    setActiveTab('project-detail');
  };

  const handleBackToProjects = () => {
    setSelectedProjectId(null);
    setActiveTab('projects');
  };
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'projects':
        return <ProjectsList onProjectSelect={handleProjectSelect} />;
      case 'project-detail':
        return selectedProjectId ? (
          <ProjectDetail 
            projectId={selectedProjectId} 
            onBack={handleBackToProjects}
          />
        ) : <ProjectsList onProjectSelect={handleProjectSelect} />;
      case 'add-employee':
        return <AddEmployee />;
      case 'employees':
        return <EmployeesList />;
      case 'salary':
        return <SalaryManagement />;
      case 'calendar':
        return <Calendar />;
      case 'script':
        return <Script />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;