import React, { useState } from 'react';
import { UserPlus, Eye, EyeOff } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { useAuth } from '../../contexts/AuthContext';

export function AddEmployee() {
  const { user, addUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    login: '',
    phone: '',
    telegram: '',
    password: '',
    role: 'photographer',
    department: '',
    position: '',
    salary: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (user?.role !== 'admin') {
      alert('У вас нет прав для выполнения этого действия');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await addUser({
        name: formData.name,
        email: formData.email,
        login: formData.login,
        password: formData.password,
        phone: formData.phone,
        telegram: formData.telegram,
        role: formData.role as 'photographer' | 'designer' | 'admin',
        department: formData.department,
        position: formData.position,
        salary: formData.salary ? parseInt(formData.salary) : undefined
      });
      
      setLoading(false);
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        login: '',
        phone: '',
        telegram: '',
        password: '',
        role: 'photographer',
        department: '',
        position: '',
        salary: ''
      });
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Ошибка при создании сотрудника');
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (user?.role !== 'admin') {
    return (
      <div className="p-6">
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-red-500 mb-4">
              <UserPlus className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Доступ запрещен</h3>
            <p className="text-gray-600">
              Только администраторы могут добавлять новых сотрудников
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Добавить сотрудника</h1>
        <p className="text-gray-600 mt-1">
          Создайте новый аккаунт для сотрудника компании
        </p>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-green-600">
              <UserPlus className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <p className="text-green-800 font-medium">Сотрудник успешно добавлен!</p>
              <p className="text-green-700 text-sm">Данные для входа отправлены на указанный email</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-600">
              <UserPlus className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Информация о сотруднике</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Полное имя *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Логин для входа *
                </label>
                <input
                  type="text"
                  name="login"
                  value={formData.login}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Логин для входа в систему"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Телефон
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+7 (495) 123-45-67"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telegram
                  </label>
                  <input
                    type="text"
                    name="telegram"
                    value={formData.telegram}
                    onChange={handleChange}
                    placeholder="@username"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Пароль *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Роль *
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="photographer">Фотограф</option>
                    <option value="designer">Дизайнер</option>
                    <option value="admin">Администратор</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Отдел
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="Например: Фотостудия, Дизайн"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Должность
                  </label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    placeholder="Например: Старший фотограф"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Зарплата (руб.)
                  </label>
                  <input
                    type="number"
                    name="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    placeholder="50000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button type="button" variant="outline">
                  Отмена
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Создание...' : 'Создать сотрудника'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <h4 className="font-medium text-blue-900 mb-3">Информация для входа:</h4>
          <div className="text-sm text-blue-700">
            <p>Сотрудники смогут войти в систему используя:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><strong>Логин:</strong> тот который вы укажете в поле "Логин для входа"</li>
              <li><strong>Пароль:</strong> тот который вы укажете в поле "Пароль"</li>
            </ul>
            <p className="mt-2 text-xs">Убедитесь, что сообщили сотруднику его данные для входа</p>
          </div>
        </Card>
      </div>
    </div>
  );
}