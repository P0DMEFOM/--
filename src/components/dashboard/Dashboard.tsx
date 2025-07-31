import React from 'react';
import { 
  Camera, 
  Palette, 
  FolderOpen,
  Calendar,
  Users,
  DollarSign,
  Upload,
  MessageCircle,
  UserPlus,
  Search,
  Settings,
  Phone,
  Mail
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

export function Dashboard() {
  const { user } = useAuth();

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    let greeting = 'Добро пожаловать';
    
    if (hour < 12) greeting = 'Доброе утро';
    else if (hour < 18) greeting = 'Добрый день';
    else greeting = 'Добрый вечер';

    return `${greeting}, ${user?.name}!`;
  };

  const getRoleSpecificGuide = () => {
    switch (user?.role) {
      case 'photographer':
        return {
          title: 'Руководство для фотографа',
          sections: [
            {
              title: 'Ваши основные задачи:',
              items: [
                'Просматривать назначенные вам проекты в разделе "Проекты"',
                'Загружать фотографии для проектов через "Загрузить фото"',
                'Просматривать свою галерею в разделе "Моя галерея"',
                'Отслеживать дедлайны в календаре'
              ]
            },
            {
              title: 'Как работать с проектами:',
              items: [
                '1. Перейдите в раздел "Проекты" - там вы увидите все проекты, где вы назначены фотографом',
                '2. Выберите проект и ознакомьтесь с техническим заданием',
                '3. После съемки загрузите фотографии через "Загрузить фото"',
                '4. Выберите нужный проект и загрузите все отснятые материалы',
                '5. Уведомите менеджера о завершении съемки'
              ]
            }
          ]
        };
      case 'designer':
        return {
          title: 'Руководство для дизайнера',
          sections: [
            {
              title: 'Ваши основные задачи:',
              items: [
                'Работать с проектами, где вы назначены дизайнером',
                'Создавать макеты альбомов на основе загруженных фотографий',
                'Использовать готовые шаблоны из раздела "Шаблоны"',
                'Загружать готовые макеты через "Дизайн-макеты"'
              ]
            },
            {
              title: 'Рабочий процесс:',
              items: [
                '1. Проверяйте раздел "Проекты" на наличие новых заданий',
                '2. Дождитесь загрузки фотографий от фотографа',
                '3. Скачайте фотографии и создайте макеты альбома',
                '4. Загрузите готовые макеты через соответствующий раздел',
                '5. Отправьте проект на согласование менеджеру'
              ]
            }
          ]
        };
      case 'admin':
        return {
          title: 'Руководство для менеджера',
          sections: [
            {
              title: 'Управление проектами:',
              items: [
                'Создавайте новые проекты через кнопку "Создать проект"',
                'Назначайте фотографов и дизайнеров на проекты',
                'Контролируйте сроки выполнения через календарь',
                'Отслеживайте статус всех проектов'
              ]
            },
            {
              title: 'Управление персоналом:',
              items: [
                'Добавляйте новых сотрудников через "Добавить сотрудника"',
                'Редактируйте информацию о сотрудниках в разделе "Сотрудники"',
                'Просматривайте зарплаты в разделе "Зарплаты"',
                'Связывайтесь с сотрудниками через контактную информацию'
              ]
            }
          ]
        };
      default:
        return {
          title: 'Общее руководство',
          sections: []
        };
    }
  };

  const commonSections = [
    {
      title: 'Общие функции для всех сотрудников:',
      items: [
        'Просматривайте информацию о коллегах в разделе "Сотрудники"',
        'Проверяйте зарплатную информацию в разделе "Зарплаты"',
        'Планируйте события в "Календаре" - все могут добавлять события',
        'Используйте поиск для быстрого нахождения проектов и сотрудников',
        'Связывайтесь с коллегами через контактную информацию'
      ]
    },
    {
      title: 'Работа с календарем:',
      items: [
        'Кликните на любую дату для просмотра событий',
        'Добавляйте новые события через кнопку "Добавить событие"',
        'Выбирайте тип события: встреча, фотосессия, дизайн, дедлайн',
        'Все сотрудники видят события, добавленные коллегами',
        'Удалять можно только свои события (админы могут удалять любые)'
      ]
    },
    {
      title: 'Контакты и связь:',
      items: [
        'В разделах "Сотрудники" и "Зарплаты" есть кнопка "Связаться"',
        'Кликните на email для отправки письма',
        'Кликните на телефон для звонка',
        'Вся контактная информация доступна всем сотрудникам'
      ]
    },
    {
      title: 'Поиск и фильтрация:',
      items: [
        'Используйте поиск в верхней части страницы',
        'В проектах можно искать по названию и описанию',
        'В сотрудниках поиск работает по имени, email и отделу',
        'Фильтруйте проекты по статусу для удобства'
      ]
    }
  ];

  const roleGuide = getRoleSpecificGuide();

  return (
    <div className="p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{getWelcomeMessage()}</h1>
        <p className="text-gray-600">
          Добро пожаловать в корпоративную платформу управления фотоальбомами
        </p>
      </div>

      {/* Role-specific guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Camera className="h-6 w-6 mr-2 text-blue-600" />
            {roleGuide.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {roleGuide.sections.map((section, index) => (
              <div key={index}>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{section.title}</h3>
                <ul className="space-y-2">
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Common functions */}
      {commonSections.map((section, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="flex items-center">
              {index === 0 && <Users className="h-5 w-5 mr-2 text-green-600" />}
              {index === 1 && <Calendar className="h-5 w-5 mr-2 text-purple-600" />}
              {index === 2 && <MessageCircle className="h-5 w-5 mr-2 text-orange-600" />}
              {index === 3 && <Search className="h-5 w-5 mr-2 text-indigo-600" />}
              {section.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {section.items.map((item, itemIndex) => (
                <li key={itemIndex} className="flex items-start">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}

      {/* Quick navigation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FolderOpen className="h-5 w-5 mr-2 text-blue-600" />
            Быстрая навигация
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center p-3 bg-blue-50 rounded-lg">
              <FolderOpen className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h4 className="font-medium text-gray-900">Проекты</h4>
                <p className="text-sm text-gray-600">Управление проектами</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-green-50 rounded-lg">
              <Users className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <h4 className="font-medium text-gray-900">Сотрудники</h4>
                <p className="text-sm text-gray-600">Контакты коллег</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-purple-50 rounded-lg">
              <Calendar className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <h4 className="font-medium text-gray-900">Календарь</h4>
                <p className="text-sm text-gray-600">Планирование событий</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
              <DollarSign className="h-8 w-8 text-yellow-600 mr-3" />
              <div>
                <h4 className="font-medium text-gray-900">Зарплаты</h4>
                <p className="text-sm text-gray-600">Информация о выплатах</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-indigo-50 rounded-lg">
              <Upload className="h-8 w-8 text-indigo-600 mr-3" />
              <div>
                <h4 className="font-medium text-gray-900">Загрузка</h4>
                <p className="text-sm text-gray-600">Файлы и материалы</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-red-50 rounded-lg">
              <MessageCircle className="h-8 w-8 text-red-600 mr-3" />
              <div>
                <h4 className="font-medium text-gray-900">Скрипт</h4>
                <p className="text-sm text-gray-600">Общение с клиентами</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Phone className="h-5 w-5 mr-2 text-green-600" />
            Нужна помощь?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Если у вас остались вопросы по работе с системой, обратитесь к администратору
            </p>
            <div className="flex items-center justify-center space-x-6">
              <div className="flex items-center">
                <Mail className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm text-gray-600">admin@photoalbums.com</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm text-gray-600">+7 (495) 123-45-67</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}