import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { getUsers, createUser, updateUser, changePassword, getActivityLogs } from '@/lib/auth';

interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'admin' | 'user';
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

interface ActivityLog {
  id: number;
  user_id?: number;
  user_email: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  old_values?: any;
  new_values?: any;
  ip_address: string;
  created_at: string;
}

export default function Admin() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'user' as 'admin' | 'user',
  });

  const [editUser, setEditUser] = useState({
    full_name: '',
    role: 'user' as 'admin' | 'user',
    is_active: true,
  });

  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (token) {
      loadUsers();
      loadActivityLogs();
    }
  }, [token]);

  const loadUsers = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await getUsers(token);
      setUsers(response.users);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось загрузить пользователей',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadActivityLogs = async () => {
    if (!token) return;
    try {
      const response = await getActivityLogs(token, 100);
      setActivityLogs(response.logs);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось загрузить логи',
      });
    }
  };

  const handleCreateUser = async () => {
    if (!token) return;
    if (!newUser.email || !newUser.password) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Заполните все обязательные поля',
      });
      return;
    }

    setLoading(true);
    try {
      await createUser(token, newUser);
      toast({
        title: 'Успешно',
        description: 'Пользователь создан',
      });
      setShowCreateDialog(false);
      setNewUser({ email: '', password: '', full_name: '', role: 'user' });
      loadUsers();
      loadActivityLogs();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось создать пользователя',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async () => {
    if (!token || !selectedUser) return;

    setLoading(true);
    try {
      await updateUser(token, selectedUser.id, editUser);
      toast({
        title: 'Успешно',
        description: 'Пользователь обновлен',
      });
      setShowEditDialog(false);
      loadUsers();
      loadActivityLogs();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось обновить пользователя',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!token || !selectedUser || !newPassword) return;

    setLoading(true);
    try {
      await changePassword(token, selectedUser.id, newPassword);
      toast({
        title: 'Успешно',
        description: 'Пароль изменен',
      });
      setShowPasswordDialog(false);
      setNewPassword('');
      loadActivityLogs();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось изменить пароль',
      });
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setEditUser({
      full_name: user.full_name,
      role: user.role,
      is_active: user.is_active,
    });
    setShowEditDialog(true);
  };

  const openPasswordDialog = (user: User) => {
    setSelectedUser(user);
    setNewPassword('');
    setShowPasswordDialog(true);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Панель администрирования</h1>
            <p className="text-sm text-muted-foreground">
              Вошли как: {user?.email} ({user?.role})
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/')}>
              <Icon name="Home" className="mr-2" size={16} />
              На главную
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <Icon name="LogOut" className="mr-2" size={16} />
              Выйти
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">
              <Icon name="Users" className="mr-2" size={16} />
              Пользователи
            </TabsTrigger>
            <TabsTrigger value="logs">
              <Icon name="FileText" className="mr-2" size={16} />
              Логи активности
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Управление пользователями</CardTitle>
                    <CardDescription>Создание, редактирование и управление учетными записями</CardDescription>
                  </div>
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Icon name="UserPlus" className="mr-2" size={16} />
                    Создать пользователя
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading && users.length === 0 ? (
                  <div className="text-center py-8">
                    <Icon name="Loader2" className="animate-spin mx-auto mb-2" size={32} />
                    <p>Загрузка...</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Имя</TableHead>
                        <TableHead>Роль</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead>Последний вход</TableHead>
                        <TableHead>Создан</TableHead>
                        <TableHead className="text-right">Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium">{u.email}</TableCell>
                          <TableCell>{u.full_name || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
                              {u.role === 'admin' ? 'Администратор' : 'Пользователь'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={u.is_active ? 'success' : 'destructive'}>
                              {u.is_active ? 'Активен' : 'Заблокирован'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {u.last_login ? new Date(u.last_login).toLocaleString('ru-RU') : '-'}
                          </TableCell>
                          <TableCell>{new Date(u.created_at).toLocaleDateString('ru-RU')}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => openEditDialog(u)}>
                              <Icon name="Edit" size={16} />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => openPasswordDialog(u)}>
                              <Icon name="Key" size={16} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Логи активности</CardTitle>
                <CardDescription>История всех действий пользователей в системе</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {activityLogs.map((log) => (
                    <div key={log.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">{log.action}</Badge>
                            <span className="text-sm font-medium">{log.user_email}</span>
                          </div>
                          {log.entity_type && (
                            <p className="text-sm text-muted-foreground">
                              Тип: {log.entity_type} {log.entity_id && `(ID: ${log.entity_id})`}
                            </p>
                          )}
                          {(log.old_values || log.new_values) && (
                            <div className="mt-2 text-xs space-y-1">
                              {log.old_values && (
                                <div className="bg-red-50 p-2 rounded">
                                  <strong>Старые значения:</strong> {JSON.stringify(log.old_values)}
                                </div>
                              )}
                              {log.new_values && (
                                <div className="bg-green-50 p-2 rounded">
                                  <strong>Новые значения:</strong> {JSON.stringify(log.new_values)}
                                </div>
                              )}
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">IP: {log.ip_address}</p>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString('ru-RU')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Создать пользователя</DialogTitle>
            <DialogDescription>Заполните информацию о новом пользователе</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-email">Email *</Label>
              <Input
                id="new-email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Пароль *</Label>
              <Input
                id="new-password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-name">Имя</Label>
              <Input
                id="new-name"
                value={newUser.full_name}
                onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-role">Роль</Label>
              <Select value={newUser.role} onValueChange={(value: 'admin' | 'user') => setNewUser({ ...newUser, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Пользователь</SelectItem>
                  <SelectItem value="admin">Администратор</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Отмена</Button>
            <Button onClick={handleCreateUser} disabled={loading}>
              {loading ? 'Создание...' : 'Создать'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать пользователя</DialogTitle>
            <DialogDescription>Изменение данных пользователя {selectedUser?.email}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Имя</Label>
              <Input
                id="edit-name"
                value={editUser.full_name}
                onChange={(e) => setEditUser({ ...editUser, full_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Роль</Label>
              <Select value={editUser.role} onValueChange={(value: 'admin' | 'user') => setEditUser({ ...editUser, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Пользователь</SelectItem>
                  <SelectItem value="admin">Администратор</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-active"
                checked={editUser.is_active}
                onCheckedChange={(checked) => setEditUser({ ...editUser, is_active: checked })}
              />
              <Label htmlFor="edit-active">Активен</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Отмена</Button>
            <Button onClick={handleEditUser} disabled={loading}>
              {loading ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Изменить пароль</DialogTitle>
            <DialogDescription>Установите новый пароль для {selectedUser?.email}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-password-input">Новый пароль</Label>
              <Input
                id="new-password-input"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>Отмена</Button>
            <Button onClick={handleChangePassword} disabled={loading || !newPassword}>
              {loading ? 'Изменение...' : 'Изменить пароль'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
