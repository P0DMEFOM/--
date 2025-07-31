import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  User,
  Camera,
  Palette,
  Clock,
  CheckCircle,
  X,
  FolderOpen
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import { Project } from '../../types/user';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onProjectSelect?: (projectId: string) => void;
}

function CreateProjectModal({ isOpen, onClose, onSave }: CreateProjectModalProps) {
  const { user, users } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    albumType: '',
    description: '',
    managerId: user?.id || '',
    photographerIds: [] as string[],
    designerIds: [] as string[],
    deadline: ''
  });
  const [loading, setLoading] = useState(false);

  const albumTypes = [
    'Свадебный альбом',
    'Выпускной альбом',
    'Детский альбом',
    'Корпоративный альбом',
    'Семейный альбом',
    'Портретная съемка'
  ];

  const photographers = users.filter(u => u.role === 'photographer');
  const designers = users.filter(u => u.role === 'designer');
  const managers = users.filter(u => u.role === 'admin');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const manager = users.find(u => u.id === formData.managerId);
    const photographers = users.filter(u => formData.photographerIds.includes(u.id));
    const designers = users.filter(u => formData.designerIds.includes(u.id));

    const projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> = {
      title: formData.title,
      albumType: formData.albumType,
      description: formData.description,
      status: 'planning',
      manager: manager || undefined,
      photographers: photographers,
      designers: designers,
      deadline: new Date(formData.deadline),
      photosCount: 0,
      designsCount: 0,
      files: []
    };

    await onSave(projectData);
    setLoading(false);
    setFormData({
      title: '',
      albumType: '',
      description: '',
      managerId: user?.id || '',
      photographerIds: [],
      designerIds: [],
      deadline: ''
    });
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleMultiSelect = (field: 'photographerIds' | 'designerIds', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value) 
        ? prev[field].filter(id => id !== value)
        : [...prev[field], value]
    }));
  };
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Создать новый проект</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Название проекта *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Например: Свадебный альбом Анны и Михаила"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Тип альбома *
              </label>
              <select
                name="albumType"
                value={formData.albumType}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Выберите тип альбома</option>
                {albumTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Описание проекта
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Опишите детали проекта, особые требования или пожелания клиента"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Менеджер *
              </label>
              <select
                name="managerId"
                value={formData.managerId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Выберите менеджера</option>
                {managers.map(manager => (
                  <option key={manager.id} value={manager.id}>{manager.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Фотографы
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2">
                {photographers.map(photographer => (
                  <label key={photographer.id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.photographerIds.includes(photographer.id)}
                      onChange={() => handleMultiSelect('photographerIds', photographer.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{photographer.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Дизайнеры
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2">
                {designers.map(designer => (
                  <label key={designer.id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.designerIds.includes(designer.id)}
                      onChange={() => handleMultiSelect('designerIds', designer.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{designer.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Дата завершения *
            </label>
            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              required
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Создание...' : 'Создать проект'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
export function ProjectsList({ onProjectSelect }: { onProjectSelect?: (projectId: string) => void }) {
  const { user, users, projects, addProject } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);


  const getStatusInfo = (status: string) => {
    const statusMap = {
      'planning': { label: 'Планирование', color: 'bg-gray-100 text-gray-800', icon: Clock },
      'in-progress': { label: 'В работе', color: 'bg-blue-100 text-blue-800', icon: Camera },
      'review': { label: 'На проверке', color: 'bg-yellow-100 text-yellow-800', icon: Palette },
      'completed': { label: 'Завершен', color: 'bg-green-100 text-green-800', icon: CheckCircle }
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.planning;
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    
    // Фильтрация по роли пользователя
    if (user?.role === 'photographer') {
      return matchesSearch && matchesStatus && project.photographers.some(p => p.id === user.id);
    } else if (user?.role === 'designer') {
      return matchesSearch && matchesStatus && project.designers.some(d => d.id === user.id);
    }
    
    return matchesSearch && matchesStatus;
  });

  const handleCreateProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    addProject(projectData);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Проекты</h1>
          <p className="text-gray-600 mt-1">
            Управляйте вашими проектами фотоальбомов
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Создать проект
          </Button>
      </div>

      {/* Фильтры и поиск */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск проектов..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Все статусы</option>
                <option value="planning">Планирование</option>
                <option value="in-progress">В работе</option>
                <option value="review">На проверке</option>
                <option value="completed">Завершен</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Список проектов */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProjects.map((project) => {
          const statusInfo = getStatusInfo(project.status);
          const StatusIcon = statusInfo.icon;
          
          return (
            <Card 
              key={project.id} 
              className="hover:shadow-lg transition-all duration-200 cursor-pointer"
              onClick={() => onProjectSelect?.(project.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{project.title}</CardTitle>
                    <p className="text-sm font-medium text-blue-600 mb-1">{project.albumType}</p>
                    <p className="text-gray-600 text-sm">{project.description}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${statusInfo.color}`}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusInfo.label}
                  </span>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {/* Команда */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-500">Менеджер:</span>
                      <span className="text-gray-600">{project.manager?.name || 'Не назначен'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Camera className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-500">Фотографы:</span>
                      <span className="text-gray-600">
                        {project.photographers.length > 0 
                          ? project.photographers.map(p => p.name).join(', ')
                          : 'Не назначены'
                        }
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Palette className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-500">Дизайнеры:</span>
                      <span className="text-gray-600">
                        {project.designers.length > 0 
                          ? project.designers.map(d => d.name).join(', ')
                          : 'Не назначены'
                        }
                      </span>
                    </div>
                  </div>

                  {/* Статистика и даты */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-4">
                      <span className="text-gray-600">Фото: {project.photosCount}</span>
                      <span className="text-gray-600">Макеты: {project.designsCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1 text-gray-500">
                        <Calendar className="h-4 w-4" />
                        <span>Создан: {project.createdAt.toLocaleDateString('ru-RU')}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-500">
                        <Calendar className="h-4 w-4" />
                        <span>Дедлайн: {project.deadline.toLocaleDateString('ru-RU')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredProjects.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-gray-400 mb-4">
              <FolderOpen className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Проекты не найдены</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Попробуйте изменить параметры поиска или фильтрации'
                : 'У вас пока нет проектов. Создайте первый проект, чтобы начать работу.'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Создать первый проект
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateProject}
      />
    </div>
  );
}