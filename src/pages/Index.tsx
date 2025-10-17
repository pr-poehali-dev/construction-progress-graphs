import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

interface Project {
  id: string;
  name: string;
  type: 'road' | 'bridge' | 'utility';
  progress: number;
  budget: number;
  spent: number;
  status: 'on-track' | 'at-risk' | 'delayed';
  startDate: string;
  endDate: string;
  stages: Stage[];
}

interface Stage {
  name: string;
  progress: number;
  startDate: string;
  endDate: string;
  status: 'completed' | 'in-progress' | 'pending';
}

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Автомагистраль М-12',
    type: 'road',
    progress: 67,
    budget: 450000000,
    spent: 301500000,
    status: 'on-track',
    startDate: '2024-01-15',
    endDate: '2025-08-30',
    stages: [
      { name: 'Проектирование', progress: 100, startDate: '2024-01-15', endDate: '2024-03-20', status: 'completed' },
      { name: 'Подготовка территории', progress: 100, startDate: '2024-03-21', endDate: '2024-05-10', status: 'completed' },
      { name: 'Основное строительство', progress: 78, startDate: '2024-05-11', endDate: '2025-06-15', status: 'in-progress' },
      { name: 'Благоустройство', progress: 0, startDate: '2025-06-16', endDate: '2025-08-30', status: 'pending' },
    ],
  },
  {
    id: '2',
    name: 'Мост через реку Волга',
    type: 'bridge',
    progress: 43,
    budget: 820000000,
    spent: 352600000,
    status: 'at-risk',
    startDate: '2024-02-01',
    endDate: '2026-11-20',
    stages: [
      { name: 'Инженерные изыскания', progress: 100, startDate: '2024-02-01', endDate: '2024-04-30', status: 'completed' },
      { name: 'Строительство опор', progress: 85, startDate: '2024-05-01', endDate: '2025-02-28', status: 'in-progress' },
      { name: 'Монтаж пролетов', progress: 12, startDate: '2025-03-01', endDate: '2026-08-15', status: 'in-progress' },
      { name: 'Финишные работы', progress: 0, startDate: '2026-08-16', endDate: '2026-11-20', status: 'pending' },
    ],
  },
  {
    id: '3',
    name: 'Водоснабжение района',
    type: 'utility',
    progress: 89,
    budget: 120000000,
    spent: 106800000,
    status: 'on-track',
    startDate: '2024-03-10',
    endDate: '2025-01-25',
    stages: [
      { name: 'Проектная документация', progress: 100, startDate: '2024-03-10', endDate: '2024-04-25', status: 'completed' },
      { name: 'Прокладка магистралей', progress: 100, startDate: '2024-04-26', endDate: '2024-10-15', status: 'completed' },
      { name: 'Подключение объектов', progress: 95, startDate: '2024-10-16', endDate: '2025-01-10', status: 'in-progress' },
      { name: 'Испытания системы', progress: 40, startDate: '2025-01-11', endDate: '2025-01-25', status: 'in-progress' },
    ],
  },
];

const Index = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const getProjectIcon = (type: string) => {
    switch (type) {
      case 'road':
        return 'Construction';
      case 'bridge':
        return 'Bridge';
      case 'utility':
        return 'Droplet';
      default:
        return 'Building2';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'at-risk':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'delayed':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'on-track':
        return 'В графике';
      case 'at-risk':
        return 'Под угрозой';
      case 'delayed':
        return 'Просрочен';
      default:
        return 'Неизвестно';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Icon name="Building2" className="text-primary" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold">СтройМонитор</h1>
                <p className="text-sm text-muted-foreground">Система управления инфраструктурными проектами</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="px-3 py-1">
                <Icon name="Activity" className="mr-2" size={14} />
                {mockProjects.length} проектов
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <Card className="animate-fade-in border-primary/20 hover:border-primary/40 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Всего проектов</CardTitle>
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Icon name="FolderOpen" className="text-primary" size={20} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-1">{mockProjects.length}</div>
              <p className="text-sm text-muted-foreground">Активных объектов</p>
            </CardContent>
          </Card>

          <Card className="animate-fade-in [animation-delay:100ms] border-secondary/20 hover:border-secondary/40 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Средний прогресс</CardTitle>
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <Icon name="TrendingUp" className="text-secondary" size={20} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-1">
                {Math.round(mockProjects.reduce((acc, p) => acc + p.progress, 0) / mockProjects.length)}%
              </div>
              <p className="text-sm text-muted-foreground">По всем объектам</p>
            </CardContent>
          </Card>

          <Card className="animate-fade-in [animation-delay:200ms] border-orange-500/20 hover:border-orange-500/40 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Требуют внимания</CardTitle>
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Icon name="AlertTriangle" className="text-orange-500" size={20} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-1">
                {mockProjects.filter((p) => p.status === 'at-risk' || p.status === 'delayed').length}
              </div>
              <p className="text-sm text-muted-foreground">Проблемных объектов</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="projects" className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-3 mb-6">
            <TabsTrigger value="projects">Проекты</TabsTrigger>
            <TabsTrigger value="gantt">График Ганта</TabsTrigger>
            <TabsTrigger value="analytics">Аналитика</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-4">
            <div className="grid gap-4">
              {mockProjects.map((project, index) => (
                <Card
                  key={project.id}
                  className="animate-scale-in hover:shadow-lg transition-all cursor-pointer border-border hover:border-primary/40"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => setSelectedProject(selectedProject?.id === project.id ? null : project)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-primary/10 rounded-xl mt-1">
                          <Icon name={getProjectIcon(project.type)} className="text-primary" size={24} />
                        </div>
                        <div>
                          <CardTitle className="text-xl mb-2">{project.name}</CardTitle>
                          <div className="flex gap-2 flex-wrap">
                            <Badge variant="outline" className={getStatusColor(project.status)}>
                              {getStatusText(project.status)}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {project.type === 'road' && 'Дорога'}
                              {project.type === 'bridge' && 'Мост'}
                              {project.type === 'utility' && 'Коммуникации'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Icon
                        name={selectedProject?.id === project.id ? 'ChevronUp' : 'ChevronDown'}
                        className="text-muted-foreground"
                        size={20}
                      />
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Общий прогресс</span>
                        <span className="text-sm font-bold text-primary">{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-3" />
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Icon name="Calendar" size={12} />
                          Начало
                        </p>
                        <p className="text-sm font-medium">
                          {new Date(project.startDate).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Icon name="CalendarCheck" size={12} />
                          Завершение
                        </p>
                        <p className="text-sm font-medium">
                          {new Date(project.endDate).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Icon name="Wallet" size={12} />
                          Бюджет
                        </p>
                        <p className="text-sm font-medium">{formatCurrency(project.budget)}</p>
                      </div>
                    </div>

                    {selectedProject?.id === project.id && (
                      <div className="pt-4 border-t border-border animate-accordion-down space-y-4">
                        <h4 className="font-semibold flex items-center gap-2">
                          <Icon name="ListChecks" size={18} />
                          Этапы строительства
                        </h4>
                        <div className="space-y-3">
                          {project.stages.map((stage, idx) => (
                            <div
                              key={idx}
                              className="p-4 rounded-lg bg-muted/30 border border-border hover:border-primary/30 transition-colors"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-start gap-3">
                                  <div
                                    className={`mt-1 h-2 w-2 rounded-full ${
                                      stage.status === 'completed'
                                        ? 'bg-green-500'
                                        : stage.status === 'in-progress'
                                        ? 'bg-blue-500 animate-pulse'
                                        : 'bg-gray-500'
                                    }`}
                                  />
                                  <div>
                                    <p className="font-medium mb-1">{stage.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(stage.startDate).toLocaleDateString('ru-RU')} -{' '}
                                      {new Date(stage.endDate).toLocaleDateString('ru-RU')}
                                    </p>
                                  </div>
                                </div>
                                <Badge
                                  variant="outline"
                                  className={
                                    stage.status === 'completed'
                                      ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                      : stage.status === 'in-progress'
                                      ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                      : 'bg-gray-500/10 text-gray-500 border-gray-500/20'
                                  }
                                >
                                  {stage.progress}%
                                </Badge>
                              </div>
                              <Progress value={stage.progress} className="h-2" />
                            </div>
                          ))}
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4 pt-4">
                          <div className="p-4 rounded-lg bg-card border border-border">
                            <p className="text-sm text-muted-foreground mb-2">Израсходовано</p>
                            <p className="text-2xl font-bold text-primary">{formatCurrency(project.spent)}</p>
                            <Progress
                              value={(project.spent / project.budget) * 100}
                              className="mt-3 h-2"
                            />
                          </div>
                          <div className="p-4 rounded-lg bg-card border border-border">
                            <p className="text-sm text-muted-foreground mb-2">Остаток бюджета</p>
                            <p className="text-2xl font-bold">{formatCurrency(project.budget - project.spent)}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {Math.round(((project.budget - project.spent) / project.budget) * 100)}% от общего
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="gantt" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Calendar" size={20} />
                  Временная диаграмма проектов
                </CardTitle>
                <CardDescription>График Ганта с визуализацией этапов строительства</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {mockProjects.map((project) => {
                    const projectStart = new Date(project.startDate).getTime();
                    const projectEnd = new Date(project.endDate).getTime();
                    const today = new Date().getTime();
                    const totalDuration = projectEnd - projectStart;
                    
                    return (
                      <div key={project.id} className="space-y-3 animate-fade-in">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Icon name={getProjectIcon(project.type)} className="text-primary" size={18} />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">{project.name}</h4>
                            <p className="text-xs text-muted-foreground">
                              {new Date(project.startDate).toLocaleDateString('ru-RU')} - {new Date(project.endDate).toLocaleDateString('ru-RU')}
                            </p>
                          </div>
                          <Badge variant="outline" className={getStatusColor(project.status)}>
                            {project.progress}%
                          </Badge>
                        </div>

                        <div className="relative pl-4 space-y-2">
                          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-border" />
                          
                          {project.stages.map((stage, idx) => {
                            const stageStart = new Date(stage.startDate).getTime();
                            const stageEnd = new Date(stage.endDate).getTime();
                            const stageDuration = stageEnd - stageStart;
                            
                            const offsetPercent = ((stageStart - projectStart) / totalDuration) * 100;
                            const widthPercent = (stageDuration / totalDuration) * 100;
                            
                            const isActive = today >= stageStart && today <= stageEnd;
                            const isPast = today > stageEnd;
                            
                            return (
                              <div key={idx} className="relative pl-6 pb-4">
                                <div
                                  className={`absolute left-0 top-2 h-3 w-3 rounded-full border-2 ${
                                    stage.status === 'completed'
                                      ? 'bg-green-500 border-green-500'
                                      : stage.status === 'in-progress'
                                      ? 'bg-blue-500 border-blue-500 animate-pulse'
                                      : 'bg-muted border-border'
                                  }`}
                                />
                                
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="font-medium text-sm">{stage.name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {new Date(stage.startDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} - {new Date(stage.endDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })}
                                      </p>
                                    </div>
                                    <Badge
                                      variant="outline"
                                      className={`text-xs ${
                                        stage.status === 'completed'
                                          ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                          : stage.status === 'in-progress'
                                          ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                          : 'bg-gray-500/10 text-gray-500 border-gray-500/20'
                                      }`}
                                    >
                                      {stage.progress}%
                                    </Badge>
                                  </div>

                                  <div className="relative h-8 bg-muted/30 rounded-lg overflow-hidden border border-border">
                                    <div
                                      className={`absolute top-0 h-full rounded-lg transition-all ${
                                        stage.status === 'completed'
                                          ? 'bg-gradient-to-r from-green-500 to-green-600'
                                          : stage.status === 'in-progress'
                                          ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                                          : 'bg-gradient-to-r from-gray-400 to-gray-500'
                                      }`}
                                      style={{
                                        left: `${offsetPercent}%`,
                                        width: `${widthPercent}%`,
                                        opacity: stage.status === 'pending' ? 0.3 : 0.8
                                      }}
                                    >
                                      <div className="h-full flex items-center justify-center">
                                        <div
                                          className="h-full bg-white/20"
                                          style={{ width: `${stage.progress}%` }}
                                        />
                                      </div>
                                    </div>

                                    {isActive && (
                                      <div
                                        className="absolute top-0 bottom-0 w-0.5 bg-orange-500 z-10"
                                        style={{
                                          left: `${((today - projectStart) / totalDuration) * 100}%`
                                        }}
                                      >
                                        <div className="absolute -top-1 -left-1 h-3 w-3 rounded-full bg-orange-500 animate-pulse" />
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-2 text-xs">
                                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                      <div
                                        className={`h-full transition-all ${
                                          stage.status === 'completed'
                                            ? 'bg-green-500'
                                            : stage.status === 'in-progress'
                                            ? 'bg-blue-500'
                                            : 'bg-gray-400'
                                        }`}
                                        style={{ width: `${stage.progress}%` }}
                                      />
                                    </div>
                                    <span className="text-muted-foreground font-medium min-w-[3rem] text-right">
                                      {stage.progress}%
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-8 pt-6 border-t border-border">
                  <div className="flex items-center gap-6 flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-green-500" />
                      <span className="text-sm text-muted-foreground">Завершено</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-blue-500 animate-pulse" />
                      <span className="text-sm text-muted-foreground">В работе</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-gray-500" />
                      <span className="text-sm text-muted-foreground">Запланировано</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-0.5 w-6 bg-orange-500" />
                      <span className="text-sm text-muted-foreground">Текущая дата</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="PieChart" size={20} />
                    Распределение по типам
                  </CardTitle>
                  <CardDescription>Количество проектов каждого типа</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {['road', 'bridge', 'utility'].map((type) => {
                    const count = mockProjects.filter((p) => p.type === type).length;
                    const percentage = (count / mockProjects.length) * 100;
                    return (
                      <div key={type} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">
                            {type === 'road' && '🛣️ Дороги'}
                            {type === 'bridge' && '🌉 Мосты'}
                            {type === 'utility' && '💧 Коммуникации'}
                          </span>
                          <span className="text-muted-foreground">{count} проектов</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="BarChart3" size={20} />
                    Статусы проектов
                  </CardTitle>
                  <CardDescription>Текущее состояние выполнения</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {['on-track', 'at-risk', 'delayed'].map((status) => {
                    const count = mockProjects.filter((p) => p.status === status).length;
                    const percentage = (count / mockProjects.length) * 100;
                    return (
                      <div key={status} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium flex items-center gap-2">
                            <span
                              className={`h-2 w-2 rounded-full ${
                                status === 'on-track'
                                  ? 'bg-green-500'
                                  : status === 'at-risk'
                                  ? 'bg-orange-500'
                                  : 'bg-red-500'
                              }`}
                            />
                            {getStatusText(status)}
                          </span>
                          <span className="text-muted-foreground">{count} проектов</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="DollarSign" size={20} />
                    Финансовый обзор
                  </CardTitle>
                  <CardDescription>Общий бюджет и расходы по всем проектам</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Общий бюджет</p>
                      <p className="text-3xl font-bold">
                        {formatCurrency(mockProjects.reduce((acc, p) => acc + p.budget, 0))}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Израсходовано</p>
                      <p className="text-3xl font-bold text-primary">
                        {formatCurrency(mockProjects.reduce((acc, p) => acc + p.spent, 0))}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Остаток</p>
                      <p className="text-3xl font-bold text-secondary">
                        {formatCurrency(
                          mockProjects.reduce((acc, p) => acc + (p.budget - p.spent), 0)
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="mt-6">
                    <Progress
                      value={
                        (mockProjects.reduce((acc, p) => acc + p.spent, 0) /
                          mockProjects.reduce((acc, p) => acc + p.budget, 0)) *
                        100
                      }
                      className="h-3"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;