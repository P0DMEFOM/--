import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Clock, User, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { useAuth } from '../../contexts/AuthContext';

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  createdBy: string;
  createdByName: string;
  type: 'meeting' | 'photoshoot' | 'design' | 'deadline' | 'other';
}

export function Calendar() {
  const { user, projects } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  
  // Создаем события из дедлайнов проектов
  const projectDeadlineEvents: CalendarEvent[] = projects.map(project => ({
    id: `project-${project.id}`,
    title: `Дедлайн: ${project.title}`,
    description: `Завершение проекта "${project.title}"`,
    date: project.deadline.toISOString().split('T')[0],
    time: '23:59',
    createdBy: project.manager?.id || 'system',
    createdByName: project.manager?.name || 'Система',
    type: 'deadline'
  }));

  const [customEvents, setCustomEvents] = useState<CalendarEvent[]>([
    {
      id: '1',
      title: 'Свадебная фотосессия',
      description: 'Фотосессия для альбома "Анна & Михаил"',
      date: '2024-02-15',
      time: '10:00',
      createdBy: '1',
      createdByName: 'Анна Иванова',
      type: 'photoshoot'
    },
    {
      id: '2',
      title: 'Встреча с клиентом',
      description: 'Обсуждение деталей выпускного альбома',
      date: '2024-02-18',
      time: '14:00',
      createdBy: '3',
      createdByName: 'Елена Сидорова',
      type: 'meeting'
    }
  ]);

  // Объединяем пользовательские события и события дедлайнов проектов
  const events = [...customEvents, ...projectDeadlineEvents];

  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    time: '09:00',
    type: 'other' as CalendarEvent['type']
  });

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Convert to Monday = 0

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getEventsForDate = (dateString: string) => {
    return events.filter(event => event.date === dateString);
  };

  const getEventTypeColor = (type: CalendarEvent['type']) => {
    const colors = {
      meeting: 'bg-blue-100 text-blue-800',
      photoshoot: 'bg-green-100 text-green-800',
      design: 'bg-purple-100 text-purple-800',
      deadline: 'bg-red-100 text-red-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[type];
  };

  const getEventTypeLabel = (type: CalendarEvent['type']) => {
    const labels = {
      meeting: 'Встреча',
      photoshoot: 'Фотосессия',
      design: 'Дизайн',
      deadline: 'Дедлайн',
      other: 'Другое'
    };
    return labels[type];
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (day: number) => {
    const dateString = formatDate(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(dateString);
  };

  const handleAddEvent = () => {
    if (!selectedDate || !newEvent.title.trim()) return;

    const event: CalendarEvent = {
      id: Math.random().toString(36).substr(2, 9),
      title: newEvent.title,
      description: newEvent.description,
      date: selectedDate,
      time: newEvent.time,
      createdBy: user?.id || '',
      createdByName: user?.name || '',
      type: newEvent.type
    };

    setCustomEvents(prev => [...prev, event]);
    setNewEvent({ title: '', description: '', time: '09:00', type: 'other' });
    setShowEventModal(false);
  };

  const handleDeleteEvent = (eventId: string) => {
    // Нельзя удалять события дедлайнов проектов
    if (eventId.startsWith('project-')) {
      return;
    }
    setCustomEvents(prev => prev.filter(event => event.id !== eventId));
  };

  const days = getDaysInMonth(currentDate);
  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Календарь</h1>
          <p className="text-gray-600 mt-1">
            Планирование проектов и событий
          </p>
        </div>
        {selectedDate && (
          <Button onClick={() => setShowEventModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Добавить событие
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </CardTitle>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={handlePrevMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleNextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-4">
                {weekDays.map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                  if (day === null) {
                    return <div key={index} className="p-2 h-20"></div>;
                  }

                  const dateString = formatDate(currentDate.getFullYear(), currentDate.getMonth(), day);
                  const dayEvents = getEventsForDate(dateString);
                  const isSelected = selectedDate === dateString;
                  const isToday = dateString === new Date().toISOString().split('T')[0];

                  return (
                    <div
                      key={day}
                      onClick={() => handleDateClick(day)}
                      className={`p-2 h-20 border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                        isSelected ? 'bg-blue-50 border-blue-300' : ''
                      } ${isToday ? 'bg-yellow-50 border-yellow-300' : ''}`}
                    >
                      <div className={`text-sm font-medium ${isToday ? 'text-yellow-800' : 'text-gray-900'}`}>
                        {day}
                      </div>
                      <div className="mt-1 space-y-1">
                        {dayEvents.slice(0, 2).map(event => (
                          <div
                            key={event.id}
                            className={`text-xs px-1 py-0.5 rounded truncate ${getEventTypeColor(event.type)}`}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{dayEvents.length - 2} еще
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Events for selected date */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedDate 
                  ? `События на ${new Date(selectedDate + 'T00:00:00').toLocaleDateString('ru-RU')}`
                  : 'Выберите дату'
                }
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDate ? (
                <div className="space-y-4">
                  {selectedDateEvents.length === 0 ? (
                    <div className="text-center py-8">
                      <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">Нет событий на эту дату</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-3"
                        onClick={() => setShowEventModal(true)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Добавить событие
                      </Button>
                    </div>
                  ) : (
                    selectedDateEvents.map(event => (
                      <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(event.type)}`}>
                                {getEventTypeLabel(event.type)}
                              </span>
                              <div className="flex items-center text-sm text-gray-500">
                                <Clock className="h-3 w-3 mr-1" />
                                {event.time}
                              </div>
                            </div>
                            <h4 className="font-medium text-gray-900 mb-1">{event.title}</h4>
                            {event.description && (
                              <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                            )}
                            <div className="flex items-center text-xs text-gray-500">
                              <User className="h-3 w-3 mr-1" />
                              {event.createdByName}
                            </div>
                          </div>
                          {(user?.role === 'admin' || user?.id === event.createdBy) && !event.id.startsWith('project-') && (
                            <button
                              onClick={() => handleDeleteEvent(event.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                          {event.id.startsWith('project-') && (
                            <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                              Проект
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Выберите дату в календаре</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Добавить событие</h2>
              <button
                onClick={() => setShowEventModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название события *
                </label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Введите название события"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Описание
                </label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Дополнительная информация о событии"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Время
                  </label>
                  <input
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Тип события
                  </label>
                  <select
                    value={newEvent.type}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, type: e.target.value as CalendarEvent['type'] }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="meeting">Встреча</option>
                    <option value="photoshoot">Фотосессия</option>
                    <option value="design">Дизайн</option>
                    <option value="deadline">Дедлайн</option>
                    <option value="other">Другое</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="outline" onClick={() => setShowEventModal(false)}>
                  Отмена
                </Button>
                <Button onClick={handleAddEvent} disabled={!newEvent.title.trim()}>
                  Добавить событие
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}