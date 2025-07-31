import React, { useState, useCallback } from 'react';
import { Upload, X, Camera, FileText, Image, Download, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import { ProjectFile } from '../../types/user';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  preview?: string;
  progress: number;
}

export function UploadArea() {
  const { user, projects, addFileToProject, removeFileFromProject } = useAuth();
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [selectedProject, setSelectedProject] = useState('');

  const selectedProjectData = projects.find(p => p.id === selectedProject);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleFiles = (fileList: File[]) => {
    if (!selectedProject) {
      alert('Пожалуйста, выберите проект перед загрузкой файлов');
      return;
    }

    const newFiles: UploadedFile[] = fileList.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      progress: 0
    }));

    setFiles(prev => [...prev, ...newFiles]);

    // Симуляция загрузки
    newFiles.forEach(file => {
      const interval = setInterval(() => {
        setFiles(prev => prev.map(f => 
          f.id === file.id 
            ? { ...f, progress: Math.min(f.progress + 10, 100) }
            : f
        ));
      }, 200);

      setTimeout(() => {
        clearInterval(interval);
        setFiles(prev => prev.map(f => 
          f.id === file.id ? { ...f, progress: 100 } : f
        ));
        
        // Добавляем файл в проект после завершения загрузки
        const fileData: Omit<ProjectFile, 'id' | 'uploadedAt'> = {
          name: file.name,
          type: file.type,
          size: file.size,
          preview: file.preview,
          uploadedBy: user!
        };
        addFileToProject(selectedProject, fileData);
      }, 2000);
    });
  };

  const removeFile = (id: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  const removeProjectFile = (fileId: string) => {
    if (selectedProject) {
      removeFileFromProject(selectedProject, fileId);
    }
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

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Загрузка файлов</h1>
        <p className="text-gray-600 mt-1">
          Загрузите фотографии и другие материалы для ваших проектов
        </p>
      </div>

      {/* Выбор проекта */}
      <Card>
        <CardHeader>
          <CardTitle>Выберите проект</CardTitle>
        </CardHeader>
        <CardContent>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Выберите проект...</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {/* Область загрузки */}
      <Card>
        <CardContent className="p-6">
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
              onChange={(e) => e.target.files && handleFiles(Array.from(e.target.files))}
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
              
              <Button variant="outline">
                Выбрать файлы
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Список загруженных файлов */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Загруженные файлы ({files.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {files.map(file => {
                const FileIcon = getFileIcon(file.type);
                return (
                  <div key={file.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
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
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{file.name}</h4>
                      <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                      
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">
                            {file.progress === 100 ? 'Загружено' : 'Загрузка...'}
                          </span>
                          <span className="font-medium">{file.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              file.progress === 100 ? 'bg-green-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${file.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => removeFile(file.id)}
                      className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Файлы проекта */}
      {selectedProjectData && selectedProjectData.files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Файлы проекта "{selectedProjectData.title}"</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {selectedProjectData.files.map(file => {
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
                        onClick={() => removeProjectFile(file.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}