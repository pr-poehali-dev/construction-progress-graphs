import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import * as XLSX from 'xlsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Icon from '@/components/ui/icon';
import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { ProjectStats } from '@/components/dashboard/ProjectStats';
import { StageTimeline } from '@/components/dashboard/StageTimeline';
import { ObjectTableRow } from '@/components/dashboard/ObjectTableRow';
import { ObjectEditDialog } from '@/components/dashboard/ObjectEditDialog';
import { mockProjects, KOAP_VIOLATIONS, Project, ProjectObject } from '@/components/dashboard/mockData';

export default function Index() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [projects] = useState<Project[]>(mockProjects);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [editingObject, setEditingObject] = useState<ProjectObject | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleExportToExcel = (obj: ProjectObject) => {
    const exportData = [{
      'Название': obj.name,
      'Регион': obj.region,
      'Район': obj.district,
      'Местоположение': obj.location,
      'Координаты': obj.coordinates,
      'Обследование': obj.inspection ? 'Да' : 'Нет',
      'Разрешение на установку опор': obj.poleInstallationPermit ? 'Да' : 'Нет',
      'Разрешение на подключение к сети': obj.powerConnectionPermit ? 'Да' : 'Нет',
      'Другие разрешения': obj.otherPermits,
      'Номер оборудования': obj.equipmentNumber,
      'Количество': obj.quantity,
      'Сертификат поверки': obj.verificationCertificate ? 'Да' : 'Нет',
      'Исполнительная документация': obj.executiveDocumentation ? 'Да' : 'Нет',
      'Строительные работы': obj.constructionWork ? 'Да' : 'Нет',
      'Пуско-наладочные работы': obj.commissioningWork ? 'Да' : 'Нет',
      'Обустройство движения': obj.trafficArrangement ? 'Да' : 'Нет',
      'Загрузка в сеть': obj.webUpload ? 'Да' : 'Нет',
      'Фиксация нарушений': obj.violationRecording ? 'Да' : 'Нет',
      'Типы нарушений': obj.violationTypes.join(', '),
      'Ссылка на документацию': obj.documentationUrl,
      'Статус работ': obj.workStatus,
      'Примечания': obj.notes,
      'Ссылка на мессенджер': obj.messengerLink,
    }];

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Объект');
    XLSX.writeFile(wb, `${obj.name.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`);
  };

  const handleEditObject = (obj: ProjectObject) => {
    setEditingObject(obj);
    setIsEditDialogOpen(true);
  };

  const handleSaveObject = (updatedObj: ProjectObject) => {
    console.log('Сохранение объекта:', updatedObj);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Icon name="building" className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Управление проектами
                </h1>
                <p className="text-sm text-muted-foreground">Дорожная инфраструктура РФ</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <Icon name="log-out" className="h-4 w-4 mr-2" />
                Выход
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!selectedProject ? (
          <div>
            <ProjectStats projects={projects} />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onSelect={setSelectedProject}
                />
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <Button variant="ghost" onClick={() => setSelectedProject(null)}>
                <Icon name="arrow-left" className="h-4 w-4 mr-2" />
                Назад к проектам
              </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-3 mb-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon name="folder" className="h-5 w-5 text-primary" />
                    </div>
                    {selectedProject.name}
                  </CardTitle>
                  <CardDescription>
                    {new Date(selectedProject.startDate).toLocaleDateString('ru-RU')} - {new Date(selectedProject.endDate).toLocaleDateString('ru-RU')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Бюджет</p>
                      <p className="text-2xl font-bold">{(selectedProject.budget / 1000000).toFixed(1)} млн ₽</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Использовано</p>
                      <p className="text-2xl font-bold">{(selectedProject.spent / 1000000).toFixed(1)} млн ₽</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Прогресс</p>
                      <p className="text-2xl font-bold">{selectedProject.progress}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Объектов</p>
                      <p className="text-2xl font-bold">{selectedProject.objects.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Этапы проекта</CardTitle>
                </CardHeader>
                <CardContent>
                  <StageTimeline stages={selectedProject.stages} />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Объекты проекта</CardTitle>
                <CardDescription>Подробная информация о {selectedProject.objects.length} объектах</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="table" className="w-full">
                  <TabsList>
                    <TabsTrigger value="table">
                      <Icon name="table" className="h-4 w-4 mr-2" />
                      Таблица
                    </TabsTrigger>
                    <TabsTrigger value="grid">
                      <Icon name="grid" className="h-4 w-4 mr-2" />
                      Карточки
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="table" className="mt-4">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Название</TableHead>
                            <TableHead>Регион/Район</TableHead>
                            <TableHead>Статус</TableHead>
                            <TableHead>Прогресс</TableHead>
                            <TableHead className="text-right">Действия</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedProject.objects.map((obj) => (
                            <ObjectTableRow
                              key={obj.id}
                              object={obj}
                              onEdit={handleEditObject}
                              onExport={handleExportToExcel}
                            />
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>

                  <TabsContent value="grid" className="mt-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {selectedProject.objects.map((obj) => (
                        <Card key={obj.id} className="hover:shadow-lg transition-shadow">
                          <CardHeader>
                            <CardTitle className="text-lg">{obj.name}</CardTitle>
                            <CardDescription>{obj.region}, {obj.district}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Статус:</span>
                                <span className="font-medium">{obj.workStatus}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Координаты:</span>
                                <span className="font-medium">{obj.coordinates}</span>
                              </div>
                              <div className="flex gap-2 mt-4">
                                <Button size="sm" variant="outline" onClick={() => handleEditObject(obj)} className="flex-1">
                                  <Icon name="pencil" className="h-4 w-4 mr-1" />
                                  Редактировать
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleExportToExcel(obj)}>
                                  <Icon name="download" className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <ObjectEditDialog
        object={editingObject}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleSaveObject}
        violationTypes={KOAP_VIOLATIONS}
      />
    </div>
  );
}
