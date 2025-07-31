import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Edit, 
  Save, 
  X, 
  Calendar,
  User,
  Camera,
  Palette,
  Clock,
  CheckCircle,
  Upload,
  Image,
  FileText,
  Trash2,
  Download
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import { Project, ProjectFile } from '../../types/user';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: File[]) => void;
  projectId: string;
}

function FileUploadModal({ isOpen, onClose, onUpload }: FileUploadModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = () => {
    if (selectedFiles.length > 0) {
      onUpload(selectedFiles);
      setSelectedFiles([]);
      onClose();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Загрузить файлы</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Upload Area */}
          <div
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept="image/*,video/*,.pdf,.doc,.docx"
            />
            
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="bg-blue-100 p-4 rounded-full">
                  <Upload className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Перетащите файлы сюда или нажмите для выбора
                </h3>
                <p className="text-gray-600 mt-1">
                  Поддерживаются изображения, видео и документы до 10MB
                </p>
              </div>
            </div>
          </div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Выбранные файлы ({selectedFiles.length})</h3>
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {file.type.startsWith('image/') ? (
                        <Image className="h-8 w-8 text-blue-500" />
                      ) : (
                        <FileText className="h-8 w-8 text-gray-500" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{file.name}</h4>
                      <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={selectedFiles.length === 0}
            >
              Загрузить файлы ({selectedFiles.length})
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ProjectDetailProps {
  projectId: string;
  onBack: () => void;
}

export function ProjectDetail({ projectId, onBack }: ProjectDetailProps) {
  const { user, users, projects, updateProject, addFileToProject, removeFileFromProject } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Project>>({});
  const [showUploadModal, setShowUploadModal] = useState(false);

  const project = projects.find(p => p.id === projectId);

  if (!project) {
    return (
      <div className="p-6">
        <Card className="text-center py-12">
          <CardContent>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Проект не найден</h3>
            <p className="text-gray-600 mb-4">Возможно, проект был удален или у вас нет доступа к нему</p>
            <Button onClick={onBack}>Вернуться к списку проектов</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusInfo = (status: string) => {
    const statusMap = {
      'planning': { label: 'Планирование', color: 'bg-gray-100 text-gray-800', icon: Clock },
      'in-progress': { label: 'В работе', color: 'bg-blue-100 text-blue-800', icon: Camera },
      'review': { label: 'На проверке', color: 'bg-yellow-100 text-yellow-800', icon: Palette },
      'completed': { label: 'Завершен', color: 'bg-green-100 text-green-800', icon: CheckCircle }
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.planning;
  };

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

  const handleEdit = () => {
    setEditData({
      title: project.title,
      albumType: project.albumType,
      description: project.description,
      status: project.status,
      deadline: project.deadline.toISOString().split('T')[0],
      manager: project.manager,
      photographers: project.photographers,
      designers: project.designers
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    const updateData: Partial<Project> = {
      ...editData,
      deadline: editData.deadline ? new Date(editData.deadline) : project.deadline,
      manager: editData.manager ? users.find(u => u.id === (editData.manager as any)?.id || editData.manager) : project.manager
    };

    updateProject(projectId, updateData);
    setIsEditing(false);
    setEditData({});
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({});
  };

  const handleFileUpload = (files: File[]) => {
    files.forEach(file => {
      const fileData: Omit<ProjectFile, 'id' | 'uploadedAt'> = {
        name: file.name,
        type: file.type,
        size: file.size,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
        uploadedBy: user!
      };
      
      addFileToProject(projectId, fileData);
    });
  };

  const handleFileDelete = (fileId: string) => {
    const file = project.files.find(f => f.id === fileId);
    if (file?.preview) {
      URL.revokeObjectURL(file.preview);
    }
    removeFileFromProject(projectId, fileId);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image;
    if (type.startsWith('video/')) return Camera;
    return FileText;
  };

  const handleChange = (field: string, value: any) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotographerToggle = (photographerId: string) => {
    setEditData(prev => {
      const currentPhotographers = prev.photographers || project.photographers;
      const isSelected = currentPhotographers.some(p => p.id === photographerId);
      
      if (isSelected) {
        return {
          ...prev,
          photographers: currentPhotographers.filter(p => p.id !== photographerId)
        };
      } else {
        const photographer = users.find(u => u.id === photographerId);
        return {
          ...prev,
          photographers: photographer ? [...currentPhotographers, photographer] : currentPhotographers
        };
      }
    });
  };

  const handleDesignerToggle = (designerId: string) => {
    setEditData(prev => {
      const currentDesigners = prev.designers || project.designers;
      const isSelected = currentDesigners.some(d => d.id === designerId);
      
      if (isSelected) {
        return {
          ...prev,
          designers: currentDesigners.filter(d => d.id !== designerId)
        };
      } else {
        const designer = users.find(u => u.id === designerId);
        return {
          ...prev,
          designers: designer ? [...currentDesigners, designer] : currentDesigners
        };
      }
    });
  };
  const statusInfo = getStatusInfo(project.status);
  const StatusIcon = statusInfo.icon;

  return (
    <>
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад к проектам
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? (
                <input
                  type="text"
                  value={editData.title || ''}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="text-3xl font-bold bg-transparent border-b-2 border-blue-500 focus:outline-none"
                />
              ) : (
                project.title
              )}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditing ? (
                <select
                  value={editData.albumType || ''}
                  onChange={(e) => handleChange('albumType', e.target.value)}
                  className="bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500"
                >
                  {albumTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              ) : (
                project.albumType
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Отмена
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Сохранить
              </Button>
            </>
          ) : (
            <Button onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Редактировать
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Details */}
          <Card>
            <CardHeader>
              <CardTitle>Информация о проекте</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Описание</label>
                {isEditing ? (
                  <textarea
                    value={editData.description || ''}
                    onChange={(e) => handleChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-600">{project.description || 'Описание не указано'}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Статус</label>
                  {isEditing ? (
                    <select
                      value={editData.status || ''}
                      onChange={(e) => handleChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="planning">Планирование</option>
                      <option value="in-progress">В работе</option>
                      <option value="review">На проверке</option>
                      <option value="completed">Завершен</option>
                    </select>
                  ) : (
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                      <StatusIcon className="h-4 w-4 mr-2" />
                      {statusInfo.label}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Дедлайн</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={editData.deadline || ''}
                      onChange={(e) => handleChange('deadline', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      {project.deadline.toLocaleDateString('ru-RU')}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Менеджер
                  </label>
                  {isEditing ? (
                    <select
                      value={(editData.manager as any)?.id || ''}
                      onChange={(e) => handleChange('manager', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Не назначен</option>
                      {managers.map(manager => (
                        <option key={manager.id} value={manager.id}>{manager.name}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="flex items-center text-gray-600">
                      <User className="h-4 w-4 mr-2" />
                      {project.manager?.name || 'Не назначен'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Фотографы
                  </label>
                  {isEditing ? (
                    <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2">
                      {photographers.map(photographer => (
                        <label key={photographer.id} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={(editData.photographers || project.photographers).some(p => p.id === photographer.id)}
                            onChange={() => handlePhotographerToggle(photographer.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{photographer.name}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center text-gray-600">
                      <Camera className="h-4 w-4 mr-2" />
                      {project.photographers.length > 0 
                        ? project.photographers.map(p => p.name).join(', ')
                        : 'Не назначены'
                      }
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Дизайнеры
                  </label>
                  {isEditing ? (
                    <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2">
                      {designers.map(designer => (
                        <label key={designer.id} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={(editData.designers || project.designers).some(d => d.id === designer.id)}
                            onChange={() => handleDesignerToggle(designer.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{designer.name}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center text-gray-600">
                      <Palette className="h-4 w-4 mr-2" />
                      {project.designers.length > 0 
                        ? project.designers.map(d => d.name).join(', ')
                        : 'Не назначены'
                      }
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Files */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Файлы проекта</CardTitle>
                <Button size="sm" onClick={() => setShowUploadModal(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Загрузить файлы
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {project.files.map(file => {
                  const FileIcon = getFileIcon(file.type);
                  return (
                  <div key={file.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {file.preview ? (
                          <img 
                            src={file.preview} 
                            alt={file.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <FileIcon className="h-6 w-6 text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{file.name}</h4>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(file.size)} • Загружен {file.uploadedBy.name} • {file.uploadedAt.toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-1" />
                        Скачать
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleFileDelete(file.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  );
                })}
                {project.files.length === 0 && (
                  <div className="text-center py-8">
                    <Upload className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-3">Файлы еще не загружены</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowUploadModal(true)}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Загрузить первые файлы
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Статистика</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Фотографий</span>
                <span className="font-semibold">{project.photosCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Макетов</span>
                <span className="font-semibold">{project.designsCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Файлов</span>
                <span className="font-semibold">{project.files.length}</span>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Временная шкала</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-gray-900">Проект создан</p>
                  <p className="text-sm text-gray-500">{project.createdAt.toLocaleDateString('ru-RU')}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-gray-900">Последнее обновление</p>
                  <p className="text-sm text-gray-500">{project.updatedAt.toLocaleDateString('ru-RU')}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-gray-900">Дедлайн</p>
                  <p className="text-sm text-gray-500">{project.deadline.toLocaleDateString('ru-RU')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>

      {/* File Upload Modal */}
      <FileUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleFileUpload}
        projectId={projectId}
      />
    </>
  );
}