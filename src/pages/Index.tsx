import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { ProjectStats } from '@/components/dashboard/ProjectStats';
import { StageTimeline } from '@/components/dashboard/StageTimeline';
import { ObjectTableRow } from '@/components/dashboard/ObjectTableRow';
import { ObjectEditDialog } from '@/components/dashboard/ObjectEditDialog';
import { mockProjects, KOAP_VIOLATIONS, Project, ProjectObject } from '@/components/dashboard/mockData';

interface ProjectObject {
  id: string;
  name: string;
  region: string;
  district: string;
  location: string;
  coordinates: string;
  inspection: boolean;
  poleInstallationPermit: boolean;
  powerConnectionPermit: boolean;
  otherPermits: string;
  equipmentNumber: string;
  quantity: number;
  verificationCertificate: boolean;
  executiveDocumentation: boolean;
  constructionWork: boolean;
  commissioningWork: boolean;
  trafficArrangement: boolean;
  webUpload: boolean;
  violationRecording: boolean;
  violationTypes: string[];
  documentationUrl: string;
  workStatus: 'not-started' | 'in-progress' | 'paused' | 'completed';
  notes: string;
  messengerLink: string;
  stageId?: string;
  deliveryStage?: '1' | '2' | '3' | '4' | '5';
}

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
  objects: ProjectObject[];
}

interface Stage {
  id: string;
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
      { id: 's1-1', name: 'Проектирование', progress: 100, startDate: '2024-01-15', endDate: '2024-03-20', status: 'completed' },
      { id: 's1-2', name: 'Подготовка территории', progress: 100, startDate: '2024-03-21', endDate: '2024-05-10', status: 'completed' },
      { id: 's1-3', name: 'Основное строительство', progress: 78, startDate: '2024-05-11', endDate: '2025-06-15', status: 'in-progress' },
      { id: 's1-4', name: 'Благоустройство', progress: 0, startDate: '2025-06-16', endDate: '2025-08-30', status: 'pending' },
    ],
    objects: [
      {
        id: '1-1',
        name: 'Участок км 10-15',
        region: 'Московская область',
        district: 'Балашихинский',
        location: 'М-12, км 10-15',
        coordinates: '55.7558° N, 37.6173° E',
        inspection: true,
        poleInstallationPermit: true,
        powerConnectionPermit: true,
        otherPermits: 'Разрешение на земляные работы',
        equipmentNumber: 'CAM-M12-001',
        quantity: 5,
        verificationCertificate: true,
        executiveDocumentation: true,
        constructionWork: true,
        commissioningWork: false,
        trafficArrangement: true,
        webUpload: false,
        violationRecording: false,
        violationTypes: ['12.9 ч.3', '12.12 ч.2'],
        documentationUrl: 'https://docs.example.com/m12-km10-15',
        workStatus: 'in-progress',
        notes: 'Ожидается подключение к сети',
        messengerLink: 'https://t.me/road_manager',
      },
      {
        id: '1-2',
        name: 'Участок км 15-20',
        region: 'Московская область',
        district: 'Балашихинский',
        location: 'М-12, км 15-20',
        coordinates: '55.7600° N, 37.6200° E',
        inspection: true,
        poleInstallationPermit: false,
        powerConnectionPermit: false,
        otherPermits: '',
        equipmentNumber: 'CAM-M12-002',
        quantity: 3,
        verificationCertificate: false,
        executiveDocumentation: false,
        constructionWork: false,
        commissioningWork: false,
        trafficArrangement: false,
        webUpload: false,
        violationRecording: false,
        violationTypes: [],
        documentationUrl: '',
        workStatus: 'not-started',
        notes: 'Требуется согласование ТУ',
        messengerLink: '',
      },
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
      { id: 's2-1', name: 'Инженерные изыскания', progress: 100, startDate: '2024-02-01', endDate: '2024-04-30', status: 'completed' },
      { id: 's2-2', name: 'Строительство опор', progress: 85, startDate: '2024-05-01', endDate: '2025-02-28', status: 'in-progress' },
      { id: 's2-3', name: 'Монтаж пролетов', progress: 12, startDate: '2025-03-01', endDate: '2026-08-15', status: 'in-progress' },
      { id: 's2-4', name: 'Финишные работы', progress: 0, startDate: '2026-08-16', endDate: '2026-11-20', status: 'pending' },
    ],
    objects: [
      {
        id: '2-1',
        name: 'Опора №1',
        region: 'Саратовская область',
        district: 'Энгельсский',
        location: 'Мост через Волгу, левый берег',
        coordinates: '51.4831° N, 46.1153° E',
        inspection: true,
        poleInstallationPermit: true,
        powerConnectionPermit: true,
        otherPermits: 'Разрешение Росводресурсов',
        equipmentNumber: 'BRIDGE-V-001',
        quantity: 1,
        verificationCertificate: true,
        executiveDocumentation: true,
        constructionWork: true,
        commissioningWork: true,
        trafficArrangement: true,
        webUpload: true,
        violationRecording: false,
        violationTypes: [],
        documentationUrl: 'https://docs.example.com/bridge-volga',
        workStatus: 'completed',
        notes: 'Готово к эксплуатации',
        messengerLink: 'https://wa.me/79001234567',
      },
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
      { id: 's3-1', name: 'Проектная документация', progress: 100, startDate: '2024-03-10', endDate: '2024-04-25', status: 'completed' },
      { id: 's3-2', name: 'Прокладка магистралей', progress: 100, startDate: '2024-04-26', endDate: '2024-10-15', status: 'completed' },
      { id: 's3-3', name: 'Подключение объектов', progress: 95, startDate: '2024-10-16', endDate: '2025-01-10', status: 'in-progress' },
      { id: 's3-4', name: 'Испытания системы', progress: 40, startDate: '2025-01-11', endDate: '2025-01-25', status: 'in-progress' },
    ],
    objects: [
      {
        id: '3-1',
        name: 'Насосная станция №1',
        region: 'Ленинградская область',
        district: 'Всеволожский',
        location: 'пос. Новое Девяткино',
        coordinates: '60.0500° N, 30.4500° E',
        inspection: true,
        poleInstallationPermit: true,
        powerConnectionPermit: true,
        otherPermits: 'СЭЗ, пожарная безопасность',
        equipmentNumber: 'PUMP-LD-001',
        quantity: 2,
        verificationCertificate: true,
        executiveDocumentation: true,
        constructionWork: true,
        commissioningWork: true,
        trafficArrangement: false,
        webUpload: true,
        violationRecording: false,
        violationTypes: ['12.15 ч.2'],
        documentationUrl: 'https://docs.example.com/pump-ld-001',
        workStatus: 'in-progress',
        notes: 'На стадии испытаний',
        messengerLink: '',
      },
    ],
  },
];

const KOAP_VIOLATIONS = [
  { code: '12.9 ч.1', description: 'Превышение скорости на 20-40 км/ч' },
  { code: '12.9 ч.2', description: 'Превышение скорости на 40-60 км/ч' },
  { code: '12.9 ч.3', description: 'Превышение скорости на 60-80 км/ч' },
  { code: '12.9 ч.4', description: 'Превышение скорости более 80 км/ч' },
  { code: '12.12 ч.1', description: 'Проезд на запрещающий сигнал светофора' },
  { code: '12.12 ч.2', description: 'Повторный проезд на красный свет' },
  { code: '12.13 ч.1', description: 'Выезд на перекресток при заторе' },
  { code: '12.15 ч.1', description: 'Нарушение правил расположения ТС на проезжей части' },
  { code: '12.15 ч.2', description: 'Движение по обочине' },
  { code: '12.15 ч.4', description: 'Выезд на встречную полосу' },
  { code: '12.15 ч.5', description: 'Повторный выезд на встречную полосу' },
  { code: '12.16 ч.1', description: 'Несоблюдение требований дорожной разметки' },
  { code: '12.16 ч.2', description: 'Поворот или разворот в нарушение требований' },
  { code: '12.17 ч.1', description: 'Непредоставление преимущества пешеходам' },
  { code: '12.18', description: 'Непредоставление преимущества ТС с включенным спецсигналом' },
  { code: '12.19 ч.3', description: 'Остановка или стоянка на пешеходном переходе' },
  { code: '12.19 ч.5', description: 'Стоянка на тротуаре' },
];

const Index = () => {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isObjectDialogOpen, setIsObjectDialogOpen] = useState(false);
  const [editingObject, setEditingObject] = useState<ProjectObject | null>(null);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [newProject, setNewProject] = useState<Partial<Project>>({
    name: '',
    type: 'road',
    budget: 0,
    startDate: '',
    endDate: '',
  });
  const [newObject, setNewObject] = useState<Partial<ProjectObject>>({
    name: '',
    region: '',
    district: '',
    location: '',
    coordinates: '',
    inspection: false,
    poleInstallationPermit: false,
    powerConnectionPermit: false,
    otherPermits: '',
    equipmentNumber: '',
    quantity: 1,
    verificationCertificate: false,
    executiveDocumentation: false,
    constructionWork: false,
    commissioningWork: false,
    trafficArrangement: false,
    webUpload: false,
    violationRecording: false,
    violationTypes: [],
    documentationUrl: '',
    workStatus: 'not-started',
    notes: '',
    messengerLink: '',
    operator: 'МТС',
    connectionType: 'GSM',
    tariffCost: 0,
  });
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedObjects, setSelectedObjects] = useState<Set<string>>(new Set());
  const [isBulkStatusDialogOpen, setIsBulkStatusDialogOpen] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<'not-started' | 'in-progress' | 'paused' | 'completed'>('in-progress');
  const [isBulkViolationsDialogOpen, setIsBulkViolationsDialogOpen] = useState(false);
  const [bulkViolations, setBulkViolations] = useState<string[]>([]);
  const [isStageDialogOpen, setIsStageDialogOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<Stage | null>(null);
  const [newStage, setNewStage] = useState<Partial<Stage>>({
    name: '',
    progress: 0,
    startDate: '',
    endDate: '',
    status: 'pending',
  });
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>('all');
  const [deliveryStageFilter, setDeliveryStageFilter] = useState<string>('all');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('project');
    
    if (projectId) {
      const project = projects.find(p => p.id === projectId);
      if (project) {
        setSelectedProject(project);
        setTimeout(() => {
          const element = document.getElementById(`project-${projectId}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    }
  }, [projects]);

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

  const handleAddProject = () => {
    if (!newProject.name || !newProject.startDate || !newProject.endDate) {
      return;
    }

    const project: Project = {
      id: Date.now().toString(),
      name: newProject.name,
      type: newProject.type as 'road' | 'bridge' | 'utility',
      progress: 0,
      budget: newProject.budget || 0,
      spent: 0,
      status: 'on-track',
      startDate: newProject.startDate,
      endDate: newProject.endDate,
      stages: [
        {
          id: `stage-${Date.now()}`,
          name: 'Проектирование',
          progress: 0,
          startDate: newProject.startDate,
          endDate: newProject.startDate,
          status: 'pending',
        },
      ],
      objects: [],
    };

    setProjects([...projects, project]);
    setIsDialogOpen(false);
    setNewProject({
      name: '',
      type: 'road',
      budget: 0,
      startDate: '',
      endDate: '',
    });
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects(projects.filter((p) => p.id !== projectId));
    if (selectedProject?.id === projectId) {
      setSelectedProject(null);
    }
  };

  const handleAddObject = () => {
    if (!currentProjectId || !newObject.name) {
      return;
    }

    const object: ProjectObject = {
      id: Date.now().toString(),
      name: newObject.name || '',
      region: newObject.region || '',
      district: newObject.district || '',
      location: newObject.location || '',
      coordinates: newObject.coordinates || '',
      inspection: newObject.inspection || false,
      poleInstallationPermit: newObject.poleInstallationPermit || false,
      powerConnectionPermit: newObject.powerConnectionPermit || false,
      otherPermits: newObject.otherPermits || '',
      equipmentNumber: newObject.equipmentNumber || '',
      quantity: newObject.quantity || 1,
      verificationCertificate: newObject.verificationCertificate || false,
      executiveDocumentation: newObject.executiveDocumentation || false,
      constructionWork: newObject.constructionWork || false,
      commissioningWork: newObject.commissioningWork || false,
      trafficArrangement: newObject.trafficArrangement || false,
      webUpload: newObject.webUpload || false,
      violationRecording: newObject.violationRecording || false,
      violationTypes: newObject.violationTypes || [],
      documentationUrl: newObject.documentationUrl || '',
      workStatus: newObject.workStatus || 'not-started',
      notes: newObject.notes || '',
      messengerLink: newObject.messengerLink || '',
    };

    setProjects(
      projects.map((p) =>
        p.id === currentProjectId ? { ...p, objects: [...p.objects, object] } : p
      )
    );

    resetObjectForm();
  };

  const handleUpdateObject = () => {
    if (!currentProjectId || !editingObject) {
      return;
    }

    const updatedObject: ProjectObject = {
      ...editingObject,
      name: newObject.name || editingObject.name,
      region: newObject.region || editingObject.region,
      district: newObject.district || editingObject.district,
      location: newObject.location || editingObject.location,
      coordinates: newObject.coordinates || editingObject.coordinates,
      inspection: newObject.inspection !== undefined ? newObject.inspection : editingObject.inspection,
      poleInstallationPermit: newObject.poleInstallationPermit !== undefined ? newObject.poleInstallationPermit : editingObject.poleInstallationPermit,
      powerConnectionPermit: newObject.powerConnectionPermit !== undefined ? newObject.powerConnectionPermit : editingObject.powerConnectionPermit,
      otherPermits: newObject.otherPermits || editingObject.otherPermits,
      equipmentNumber: newObject.equipmentNumber || editingObject.equipmentNumber,
      quantity: newObject.quantity || editingObject.quantity,
      verificationCertificate: newObject.verificationCertificate !== undefined ? newObject.verificationCertificate : editingObject.verificationCertificate,
      executiveDocumentation: newObject.executiveDocumentation !== undefined ? newObject.executiveDocumentation : editingObject.executiveDocumentation,
      constructionWork: newObject.constructionWork !== undefined ? newObject.constructionWork : editingObject.constructionWork,
      commissioningWork: newObject.commissioningWork !== undefined ? newObject.commissioningWork : editingObject.commissioningWork,
      trafficArrangement: newObject.trafficArrangement !== undefined ? newObject.trafficArrangement : editingObject.trafficArrangement,
      webUpload: newObject.webUpload !== undefined ? newObject.webUpload : editingObject.webUpload,
      violationRecording: newObject.violationRecording !== undefined ? newObject.violationRecording : editingObject.violationRecording,
      violationTypes: newObject.violationTypes || editingObject.violationTypes,
      documentationUrl: newObject.documentationUrl || editingObject.documentationUrl,
      workStatus: newObject.workStatus || editingObject.workStatus,
      notes: newObject.notes || editingObject.notes,
      messengerLink: newObject.messengerLink || editingObject.messengerLink,
    };

    setProjects(
      projects.map((p) =>
        p.id === currentProjectId
          ? {
              ...p,
              objects: p.objects.map((obj) => (obj.id === editingObject.id ? updatedObject : obj)),
            }
          : p
      )
    );

    resetObjectForm();
  };

  const handleDeleteObject = (projectId: string, objectId: string) => {
    setProjects(
      projects.map((p) =>
        p.id === projectId ? { ...p, objects: p.objects.filter((obj) => obj.id !== objectId) } : p
      )
    );
  };

  const openAddObjectDialog = (projectId: string) => {
    setCurrentProjectId(projectId);
    setEditingObject(null);
    setNewObject({
      name: '',
      region: '',
      district: '',
      location: '',
      coordinates: '',
      inspection: false,
      poleInstallationPermit: false,
      powerConnectionPermit: false,
      otherPermits: '',
      equipmentNumber: '',
      quantity: 1,
      verificationCertificate: false,
      executiveDocumentation: false,
      constructionWork: false,
      commissioningWork: false,
      trafficArrangement: false,
      webUpload: false,
      violationRecording: false,
      violationTypes: [],
      documentationUrl: '',
      workStatus: 'not-started',
      notes: '',
    });
    setIsObjectDialogOpen(true);
  };

  const openEditObjectDialog = (projectId: string, object: ProjectObject) => {
    setCurrentProjectId(projectId);
    setEditingObject(object);
    setNewObject(object);
    setIsObjectDialogOpen(true);
  };

  const resetObjectForm = () => {
    setIsObjectDialogOpen(false);
    setEditingObject(null);
    setCurrentProjectId(null);
    setNewObject({
      name: '',
      region: '',
      district: '',
      location: '',
      coordinates: '',
      inspection: false,
      poleInstallationPermit: false,
      powerConnectionPermit: false,
      otherPermits: '',
      equipmentNumber: '',
      quantity: 1,
      verificationCertificate: false,
      executiveDocumentation: false,
      constructionWork: false,
      commissioningWork: false,
      trafficArrangement: false,
      webUpload: false,
      violationRecording: false,
      violationTypes: [],
      documentationUrl: '',
      workStatus: 'not-started',
      notes: '',
      messengerLink: '',
    });
  };

  const getWorkStatusText = (status: string) => {
    switch (status) {
      case 'not-started':
        return 'Не взято в работу';
      case 'in-progress':
        return 'В работе';
      case 'paused':
        return 'Приостановлено';
      case 'completed':
        return 'Выполнено';
      default:
        return 'Неизвестно';
    }
  };

  const getWorkStatusColor = (status: string) => {
    switch (status) {
      case 'not-started':
        return 'secondary';
      case 'in-progress':
        return 'default';
      case 'paused':
        return 'outline';
      case 'completed':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const exportToExcel = (projectId: string, selectedOnly: boolean = false) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project || !project.objects.length) return;

    const objectsToExport = selectedOnly 
      ? project.objects.filter(obj => selectedObjects.has(obj.id))
      : project.objects;

    if (objectsToExport.length === 0) return;

    const data = objectsToExport.map((obj) => ({
      'ID': obj.id,
      'Объект': obj.name,
      'Этап сдачи': obj.deliveryStage ? `${obj.deliveryStage} этап` : '-',
      'Регион': obj.region,
      'Район': obj.district,
      'Локация': obj.location,
      'Координаты': obj.coordinates,
      'Обследование': obj.inspection ? 'Выполнено' : 'Не выполнено',
      'ТУ на установку опор': obj.poleInstallationPermit ? 'Получено' : 'Не получено',
      'ТУ на подключение к электропитанию': obj.powerConnectionPermit ? 'Получено' : 'Не получено',
      'Другие разрешения': obj.otherPermits || '-',
      'Номер оборудования': obj.equipmentNumber,
      'Количество': obj.quantity,
      'Свидетельство о поверке': obj.verificationCertificate ? 'Есть' : 'Нет',
      'Исполнительная документация': obj.executiveDocumentation ? 'Готово' : 'Не готово',
      'Строительно-монтажные работы': obj.constructionWork ? 'Завершено' : 'Не завершено',
      'Пуско-наладочные работы': obj.commissioningWork ? 'Завершено' : 'Не завершено',
      'ПОДД': obj.trafficArrangement ? 'Да' : 'Нет',
      'Выгрузка в Паутину': obj.webUpload ? 'Выполнено' : 'Не выполнено',
      'Фиксация нарушений': obj.violationRecording ? 'Да' : 'Нет',
      'Типы нарушений КоАП': obj.violationTypes?.join(', ') || '-',
      'Ссылка на документацию': obj.documentationUrl || '-',
      'Статус работ': getWorkStatusText(obj.workStatus || 'not-started'),
      'Оператор связи': obj.operator || '-',
      'Тип связи': obj.connectionType || '-',
      'Стоимость тарифа (₽/мес)': obj.tariffCost || 0,
      'Примечание': obj.notes || '-',
      'Ссылка на мессенджер': obj.messengerLink || '-',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    
    if (!ws['!cols']) ws['!cols'] = [];
    ws['!cols'][0] = { hidden: true };
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Объекты');

    const suffix = selectedOnly ? `_выбранные_${objectsToExport.length}` : '_объекты';
    const fileName = `${project.name}${suffix}_${new Date().toLocaleDateString('ru-RU')}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const handleImportObjects = (projectId: string, file: File) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet) as any[];
        
        if (!jsonData || jsonData.length === 0) {
          alert('Файл пуст или имеет неверный формат');
          return;
        }

        const project = projects.find(p => p.id === projectId);
        if (!project) return;

        const existingObjectsMap = new Map(project.objects.map(obj => [obj.id, obj]));
        const importedObjects: ProjectObject[] = [];
        let updatedCount = 0;
        let createdCount = 0;

        jsonData.forEach((row) => {
          const objectId = row['ID'] || row['id'] || row['Идентификатор'];
          const existingObject = objectId ? existingObjectsMap.get(objectId) : null;

          const importedObject: ProjectObject = {
            id: existingObject?.id || `obj-${Date.now()}-${Math.random()}`,
            name: row['Объект'] || existingObject?.name || '',
            region: row['Регион'] || existingObject?.region || '',
            district: row['Район'] || existingObject?.district || '',
            location: row['Локация'] || existingObject?.location || '',
            coordinates: row['Координаты'] || existingObject?.coordinates || '',
            inspection: row['Обследование'] === 'Выполнено' || existingObject?.inspection || false,
            poleInstallationPermit: row['ТУ на установку опор'] === 'Получено' || existingObject?.poleInstallationPermit || false,
            powerConnectionPermit: row['ТУ на подключение к электропитанию'] === 'Получено' || existingObject?.powerConnectionPermit || false,
            otherPermits: row['Другие разрешения'] || existingObject?.otherPermits || '',
            equipmentNumber: row['Номер оборудования'] || existingObject?.equipmentNumber || '',
            quantity: Number(row['Количество']) || existingObject?.quantity || 1,
            verificationCertificate: row['Свидетельство о поверке'] === 'Есть' || existingObject?.verificationCertificate || false,
            executiveDocumentation: row['Исполнительная документация'] === 'Готово' || existingObject?.executiveDocumentation || false,
            constructionWork: row['Строительно-монтажные работы'] === 'Завершено' || existingObject?.constructionWork || false,
            commissioningWork: row['Пуско-наладочные работы'] === 'Завершено' || existingObject?.commissioningWork || false,
            trafficArrangement: row['ПОДД'] === 'Да' || existingObject?.trafficArrangement || false,
            webUpload: row['Выгрузка в Паутину'] === 'Выполнено' || existingObject?.webUpload || false,
            violationRecording: row['Фиксация нарушений'] === 'Да' || existingObject?.violationRecording || false,
            violationTypes: row['Типы нарушений КоАП'] 
              ? String(row['Типы нарушений КоАП']).split(',').map(s => s.trim()).filter(Boolean)
              : existingObject?.violationTypes || [],
            documentationUrl: row['Ссылка на документацию'] || existingObject?.documentationUrl || '',
            workStatus: existingObject?.workStatus || 'not-started',
            notes: row['Примечание'] || existingObject?.notes || '',
            messengerLink: row['Ссылка на мессенджер'] || existingObject?.messengerLink || '',
            stageId: existingObject?.stageId,
            deliveryStage: row['Этап сдачи'] 
              ? (String(row['Этап сдачи']).replace(/[^\d]/g, '') as '1' | '2' | '3' | '4' | '5')
              : existingObject?.deliveryStage,
            operator: (row['Оператор связи'] as any) || existingObject?.operator || 'МТС',
            connectionType: (row['Тип связи'] as any) || existingObject?.connectionType || 'GSM',
            tariffCost: Number(row['Стоимость тарифа (₽/мес)']) || Number(row['Стоимость тарифа']) || existingObject?.tariffCost || 0,
          };

          if (existingObject) {
            updatedCount++;
          } else {
            createdCount++;
          }

          importedObjects.push(importedObject);
        });

        const finalObjects = project.objects
          .map(obj => {
            const imported = importedObjects.find(imp => imp.id === obj.id);
            return imported || obj;
          })
          .concat(
            importedObjects.filter(imp => !existingObjectsMap.has(imp.id))
          );

        setProjects(projects.map(p => 
          p.id === projectId 
            ? { ...p, objects: finalObjects }
            : p
        ));

        alert(`Импорт завершен!\nОбновлено: ${updatedCount} объектов\nСоздано: ${createdCount} новых объектов`);
      } catch (error) {
        console.error('Ошибка импорта:', error);
        alert('Ошибка при обработке файла. Проверьте формат данных.');
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const filterObjects = (objects: ProjectObject[]) => {
    let filtered = objects;
    
    if (selectedStageFilter !== 'all') {
      if (selectedStageFilter === 'no-stage') {
        filtered = filtered.filter(obj => !obj.stageId);
      } else {
        filtered = filtered.filter(obj => obj.stageId === selectedStageFilter);
      }
    }
    
    if (deliveryStageFilter !== 'all') {
      if (deliveryStageFilter === 'no-delivery-stage') {
        filtered = filtered.filter(obj => !obj.deliveryStage);
      } else {
        filtered = filtered.filter(obj => obj.deliveryStage === deliveryStageFilter);
      }
    }
    
    if (statusFilter === 'all') return filtered;
    
    return filtered.filter((obj) => {
      switch (statusFilter) {
        case 'completed':
          return obj.constructionWork && obj.commissioningWork && obj.executiveDocumentation;
        case 'in-progress':
          return (obj.constructionWork || obj.commissioningWork) && 
                 !(obj.constructionWork && obj.commissioningWork && obj.executiveDocumentation);
        case 'not-started':
          return !obj.constructionWork && !obj.commissioningWork;
        case 'with-permits':
          return obj.inspection && obj.poleInstallationPermit && obj.powerConnectionPermit;
        case 'no-permits':
          return !obj.inspection || !obj.poleInstallationPermit || !obj.powerConnectionPermit;
        default:
          return true;
      }
    });
  };

  const getDeliveryStageCount = (objects: ProjectObject[], stage: '1' | '2' | '3' | '4' | '5' | 'none') => {
    if (stage === 'none') {
      return objects.filter(obj => !obj.deliveryStage).length;
    }
    return objects.filter(obj => obj.deliveryStage === stage).length;
  };

  const handleToggleObject = (objectId: string) => {
    const newSelected = new Set(selectedObjects);
    if (newSelected.has(objectId)) {
      newSelected.delete(objectId);
    } else {
      newSelected.add(objectId);
    }
    setSelectedObjects(newSelected);
  };

  const handleSelectAll = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const filteredObjects = filterObjects(project.objects);
    const allSelected = filteredObjects.every(obj => selectedObjects.has(obj.id));

    if (allSelected) {
      const newSelected = new Set(selectedObjects);
      filteredObjects.forEach(obj => newSelected.delete(obj.id));
      setSelectedObjects(newSelected);
    } else {
      const newSelected = new Set(selectedObjects);
      filteredObjects.forEach(obj => newSelected.add(obj.id));
      setSelectedObjects(newSelected);
    }
  };

  const handleBulkStatusChange = () => {
    if (selectedObjects.size === 0) return;

    setProjects(projects.map(project => ({
      ...project,
      objects: project.objects.map(obj =>
        selectedObjects.has(obj.id)
          ? { ...obj, workStatus: bulkStatus }
          : obj
      )
    })));

    setSelectedObjects(new Set());
    setIsBulkStatusDialogOpen(false);
  };

  const clearSelection = () => {
    setSelectedObjects(new Set());
  };

  const handleBulkViolationsChange = () => {
    if (selectedObjects.size === 0) return;

    setProjects(projects.map(project => ({
      ...project,
      objects: project.objects.map(obj =>
        selectedObjects.has(obj.id)
          ? { ...obj, violationTypes: bulkViolations }
          : obj
      )
    })));

    setSelectedObjects(new Set());
    setBulkViolations([]);
    setIsBulkViolationsDialogOpen(false);
  };

  const handleAddStage = () => {
    if (!currentProjectId || !newStage.name) {
      return;
    }

    const stage: Stage = {
      id: Date.now().toString(),
      name: newStage.name,
      progress: newStage.progress || 0,
      startDate: newStage.startDate || '',
      endDate: newStage.endDate || '',
      status: newStage.status || 'pending',
    };

    if (editingStage) {
      setProjects(
        projects.map((p) =>
          p.id === currentProjectId
            ? {
                ...p,
                stages: p.stages.map((s) =>
                  s.id === editingStage.id ? { ...stage, id: editingStage.id } : s
                ),
              }
            : p
        )
      );
    } else {
      setProjects(
        projects.map((p) =>
          p.id === currentProjectId ? { ...p, stages: [...p.stages, stage] } : p
        )
      );
    }

    setIsStageDialogOpen(false);
    setEditingStage(null);
    setNewStage({
      name: '',
      progress: 0,
      startDate: '',
      endDate: '',
      status: 'pending',
    });
  };

  const handleDeleteStage = (projectId: string, stageId: string) => {
    setProjects(
      projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              stages: p.stages.filter((s) => s.id !== stageId),
              objects: p.objects.filter((obj) => obj.stageId !== stageId),
            }
          : p
      )
    );
  };

  const openAddStageDialog = (projectId: string) => {
    setCurrentProjectId(projectId);
    setEditingStage(null);
    setNewStage({
      name: '',
      progress: 0,
      startDate: '',
      endDate: '',
      status: 'pending',
    });
    setIsStageDialogOpen(true);
  };

  const openEditStageDialog = (projectId: string, stage: Stage) => {
    setCurrentProjectId(projectId);
    setEditingStage(stage);
    setNewStage({
      name: stage.name,
      progress: stage.progress,
      startDate: stage.startDate,
      endDate: stage.endDate,
      status: stage.status,
    });
    setIsStageDialogOpen(true);
  };

  const filterObjectsByStage = (objects: ProjectObject[], stageId: string) => {
    if (stageId === 'all') return objects;
    if (stageId === 'no-stage') return objects.filter(obj => !obj.stageId);
    return objects.filter(obj => obj.stageId === stageId);
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
                {projects.length} проектов
              </Badge>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Icon name="Plus" size={16} />
                    Добавить проект
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Новый проект</DialogTitle>
                    <DialogDescription>
                      Заполните информацию о строительном проекте
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Название проекта</Label>
                      <Input
                        id="name"
                        placeholder="Например: Мост через реку Дон"
                        value={newProject.name}
                        onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="type">Тип проекта</Label>
                      <Select
                        value={newProject.type}
                        onValueChange={(value) => setNewProject({ ...newProject, type: value as 'road' | 'bridge' | 'utility' })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите тип" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="road">Дорога</SelectItem>
                          <SelectItem value="bridge">Мост</SelectItem>
                          <SelectItem value="utility">Коммуникации</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="budget">Бюджет (₽)</Label>
                      <Input
                        id="budget"
                        type="number"
                        placeholder="0"
                        value={newProject.budget || ''}
                        onChange={(e) => setNewProject({ ...newProject, budget: Number(e.target.value) })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="startDate">Дата начала</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={newProject.startDate}
                          onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="endDate">Дата окончания</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={newProject.endDate}
                          onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Отмена
                    </Button>
                    <Button onClick={handleAddProject}>
                      Создать проект
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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
                {projects.length > 0 ? Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / projects.length) : 0}%
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
                {projects.filter((p) => p.status === 'at-risk' || p.status === 'delayed').length}
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
              {projects.map((project, index) => (
                <Card
                  key={project.id}
                  id={`project-${project.id}`}
                  className="animate-scale-in hover:shadow-lg transition-all border-border hover:border-primary/40"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div 
                        className="flex items-start gap-4 flex-1 cursor-pointer"
                        onClick={() => setSelectedProject(selectedProject?.id === project.id ? null : project)}
                      >
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
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-primary/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`/?project=${project.id}`, '_blank', 'noopener,noreferrer');
                          }}
                          title="Открыть в новом окне"
                        >
                          <Icon name="ExternalLink" size={18} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProject(project.id);
                          }}
                        >
                          <Icon name="Trash2" size={18} />
                        </Button>
                        <Icon
                          name={selectedProject?.id === project.id ? 'ChevronUp' : 'ChevronDown'}
                          className="text-muted-foreground cursor-pointer"
                          size={20}
                          onClick={() => setSelectedProject(selectedProject?.id === project.id ? null : project)}
                        />
                      </div>
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
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold flex items-center gap-2">
                            <Icon name="ListChecks" size={18} />
                            Этапы строительства
                          </h4>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openAddStageDialog(project.id)}
                            className="gap-2"
                          >
                            <Icon name="Plus" size={14} />
                            Добавить этап
                          </Button>
                        </div>
                        <div className="space-y-3">
                          {project.stages.map((stage) => (
                            <div
                              key={stage.id}
                              className="p-4 rounded-lg bg-muted/30 border border-border hover:border-primary/30 transition-colors"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-start gap-3 flex-1">
                                  <div
                                    className={`mt-1 h-2 w-2 rounded-full ${
                                      stage.status === 'completed'
                                        ? 'bg-green-500'
                                        : stage.status === 'in-progress'
                                        ? 'bg-blue-500 animate-pulse'
                                        : 'bg-gray-500'
                                    }`}
                                  />
                                  <div className="flex-1">
                                    <p className="font-medium mb-1">{stage.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(stage.startDate).toLocaleDateString('ru-RU')} -{' '}
                                      {new Date(stage.endDate).toLocaleDateString('ru-RU')}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
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
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => openEditStageDialog(project.id, stage)}
                                  >
                                    <Icon name="Pencil" size={14} />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                    onClick={() => handleDeleteStage(project.id, stage.id)}
                                  >
                                    <Icon name="Trash2" size={14} />
                                  </Button>
                                </div>
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

                        <div className="pt-6 border-t border-border space-y-4">
                          <h4 className="font-semibold flex items-center gap-2 mb-3">
                            <Icon name="Layers" size={18} />
                            Этапы сдачи объектов
                          </h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                            <div 
                              className="p-3 rounded-lg bg-muted/30 border border-border hover:border-primary/40 transition-all cursor-pointer"
                              onClick={() => setDeliveryStageFilter('1')}
                            >
                              <p className="text-xs text-muted-foreground mb-1">1 этап</p>
                              <p className="text-2xl font-bold">{getDeliveryStageCount(project.objects, '1')}</p>
                            </div>
                            <div 
                              className="p-3 rounded-lg bg-muted/30 border border-border hover:border-primary/40 transition-all cursor-pointer"
                              onClick={() => setDeliveryStageFilter('2')}
                            >
                              <p className="text-xs text-muted-foreground mb-1">2 этап</p>
                              <p className="text-2xl font-bold">{getDeliveryStageCount(project.objects, '2')}</p>
                            </div>
                            <div 
                              className="p-3 rounded-lg bg-muted/30 border border-border hover:border-primary/40 transition-all cursor-pointer"
                              onClick={() => setDeliveryStageFilter('3')}
                            >
                              <p className="text-xs text-muted-foreground mb-1">3 этап</p>
                              <p className="text-2xl font-bold">{getDeliveryStageCount(project.objects, '3')}</p>
                            </div>
                            <div 
                              className="p-3 rounded-lg bg-muted/30 border border-border hover:border-primary/40 transition-all cursor-pointer"
                              onClick={() => setDeliveryStageFilter('4')}
                            >
                              <p className="text-xs text-muted-foreground mb-1">4 этап</p>
                              <p className="text-2xl font-bold">{getDeliveryStageCount(project.objects, '4')}</p>
                            </div>
                            <div 
                              className="p-3 rounded-lg bg-muted/30 border border-border hover:border-primary/40 transition-all cursor-pointer"
                              onClick={() => setDeliveryStageFilter('5')}
                            >
                              <p className="text-xs text-muted-foreground mb-1">5 этап</p>
                              <p className="text-2xl font-bold">{getDeliveryStageCount(project.objects, '5')}</p>
                            </div>
                            <div 
                              className="p-3 rounded-lg bg-muted/30 border border-border hover:border-primary/40 transition-all cursor-pointer"
                              onClick={() => setDeliveryStageFilter('no-delivery-stage')}
                            >
                              <p className="text-xs text-muted-foreground mb-1">Без этапа</p>
                              <p className="text-2xl font-bold">{getDeliveryStageCount(project.objects, 'none')}</p>
                            </div>
                          </div>
                        </div>

                        <div className="pt-6 border-t border-border space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <h4 className="font-semibold flex items-center gap-2">
                              <Icon name="MapPin" size={18} />
                              Объекты проекта
                            </h4>
                            <div className="flex flex-wrap items-center gap-2">
                              <Select value={selectedStageFilter} onValueChange={setSelectedStageFilter}>
                                <SelectTrigger className="w-[200px]">
                                  <SelectValue placeholder="Фильтр по этапу" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">Все этапы</SelectItem>
                                  <SelectItem value="no-stage">Без этапа</SelectItem>
                                  {project.stages.map((stage) => (
                                    <SelectItem key={stage.id} value={stage.id}>
                                      {stage.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Select value={deliveryStageFilter} onValueChange={setDeliveryStageFilter}>
                                <SelectTrigger className="w-[200px]">
                                  <SelectValue placeholder="Этап сдачи" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">Все этапы сдачи</SelectItem>
                                  <SelectItem value="no-delivery-stage">Без этапа сдачи</SelectItem>
                                  <SelectItem value="1">1 этап ({getDeliveryStageCount(project.objects, '1')})</SelectItem>
                                  <SelectItem value="2">2 этап ({getDeliveryStageCount(project.objects, '2')})</SelectItem>
                                  <SelectItem value="3">3 этап ({getDeliveryStageCount(project.objects, '3')})</SelectItem>
                                  <SelectItem value="4">4 этап ({getDeliveryStageCount(project.objects, '4')})</SelectItem>
                                  <SelectItem value="5">5 этап ({getDeliveryStageCount(project.objects, '5')})</SelectItem>
                                </SelectContent>
                              </Select>
                              <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[200px]">
                                  <SelectValue placeholder="Фильтр по статусу" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">Все объекты</SelectItem>
                                  <SelectItem value="completed">Завершенные</SelectItem>
                                  <SelectItem value="in-progress">В работе</SelectItem>
                                  <SelectItem value="not-started">Не начаты</SelectItem>
                                  <SelectItem value="with-permits">С разрешениями</SelectItem>
                                  <SelectItem value="no-permits">Без разрешений</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => exportToExcel(project.id)}
                                className="gap-2"
                                disabled={!project.objects || project.objects.length === 0}
                              >
                                <Icon name="Download" size={14} />
                                Экспорт Excel
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const input = document.createElement('input');
                                  input.type = 'file';
                                  input.accept = '.xlsx,.xls';
                                  input.onchange = (e) => {
                                    const file = (e.target as HTMLInputElement).files?.[0];
                                    if (file) {
                                      handleImportObjects(project.id, file);
                                    }
                                  };
                                  input.click();
                                }}
                                className="gap-2"
                              >
                                <Icon name="Upload" size={14} />
                                Импорт Excel
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => openAddObjectDialog(project.id)}
                                className="gap-2"
                              >
                                <Icon name="Plus" size={14} />
                                Добавить объект
                              </Button>
                            </div>
                          </div>

                          {selectedObjects.size > 0 && (
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-primary/10 rounded-lg border border-primary/20">
                              <div className="flex items-center gap-2">
                                <Icon name="CheckSquare" size={18} className="text-primary" />
                                <span className="text-sm font-medium">
                                  Выбрано объектов: {selectedObjects.size}
                                </span>
                              </div>
                              <div className="flex-1" />
                              <div className="flex flex-wrap items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setIsBulkStatusDialogOpen(true)}
                                  className="gap-2"
                                >
                                  <Icon name="Edit" size={14} />
                                  Изменить статус
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setBulkViolations([]);
                                    setIsBulkViolationsDialogOpen(true);
                                  }}
                                  className="gap-2"
                                >
                                  <Icon name="AlertTriangle" size={14} />
                                  Назначить нарушения
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => exportToExcel(project.id, true)}
                                  className="gap-2"
                                >
                                  <Icon name="Download" size={14} />
                                  Экспорт выбранных
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={clearSelection}
                                  className="gap-2"
                                >
                                  <Icon name="X" size={14} />
                                  Отменить
                                </Button>
                              </div>
                            </div>
                          )}

                          {project.objects && project.objects.length > 0 && (
                            <>
                              {filterObjects(project.objects).length > 0 ? (
                                <div className="overflow-x-auto rounded-lg border border-border">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="w-[50px]">
                                      <Checkbox
                                        checked={filterObjects(project.objects).length > 0 && filterObjects(project.objects).every(obj => selectedObjects.has(obj.id))}
                                        onCheckedChange={() => handleSelectAll(project.id)}
                                      />
                                    </TableHead>
                                    <TableHead className="min-w-[150px]">Объект</TableHead>
                                    <TableHead className="min-w-[150px]">Этап</TableHead>
                                    <TableHead className="min-w-[120px]">Этап сдачи</TableHead>
                                    <TableHead className="min-w-[120px]">Регион</TableHead>
                                    <TableHead className="min-w-[120px]">Район</TableHead>
                                    <TableHead className="min-w-[150px]">Локация</TableHead>
                                    <TableHead className="min-w-[140px]">Координаты</TableHead>
                                    <TableHead className="min-w-[110px]">Обследование</TableHead>
                                    <TableHead className="min-w-[150px]">ТУ на установку опор</TableHead>
                                    <TableHead className="min-w-[180px]">ТУ на подключение к электропитанию</TableHead>
                                    <TableHead className="min-w-[140px]">Другие разрешения</TableHead>
                                    <TableHead className="min-w-[150px]">Номер оборудования</TableHead>
                                    <TableHead className="min-w-[100px]">Количество</TableHead>
                                    <TableHead className="min-w-[160px]">Свидетельство о поверке</TableHead>
                                    <TableHead className="min-w-[180px]">Исполнительная документация</TableHead>
                                    <TableHead className="min-w-[180px]">Строительно-монтажные работы</TableHead>
                                    <TableHead className="min-w-[180px]">Пуско-наладочные работы</TableHead>
                                    <TableHead className="min-w-[90px]">ПОДД</TableHead>
                                    <TableHead className="min-w-[140px]">Выгрузка в Паутину</TableHead>
                                    <TableHead className="min-w-[140px]">Фиксация нарушений</TableHead>
                                    <TableHead className="min-w-[180px]">Типы нарушений КоАП</TableHead>
                                    <TableHead className="min-w-[250px]">Ссылка на документацию</TableHead>
                                    <TableHead className="min-w-[150px]">Статус работ</TableHead>
                                    <TableHead className="min-w-[200px]">Примечание</TableHead>
                                    <TableHead className="min-w-[200px]">Мессенджер</TableHead>
                                    <TableHead className="min-w-[140px]">Оператор связи</TableHead>
                                    <TableHead className="min-w-[160px]">Тип связи</TableHead>
                                    <TableHead className="min-w-[140px]">Стоимость тарифа</TableHead>
                                    <TableHead className="w-[100px]">Действия</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {filterObjects(project.objects).map((obj) => (
                                    <TableRow key={obj.id} className={selectedObjects.has(obj.id) ? 'bg-primary/5' : ''}>
                                      <TableCell>
                                        <Checkbox
                                          checked={selectedObjects.has(obj.id)}
                                          onCheckedChange={() => handleToggleObject(obj.id)}
                                        />
                                      </TableCell>
                                      <TableCell className="font-medium">{obj.name}</TableCell>
                                      <TableCell>
                                        {obj.stageId ? (
                                          <Badge variant="outline" className="text-xs">
                                            {project.stages.find(s => s.id === obj.stageId)?.name || 'Этап удален'}
                                          </Badge>
                                        ) : (
                                          <span className="text-xs text-muted-foreground">-</span>
                                        )}
                                      </TableCell>
                                      <TableCell>
                                        <Badge 
                                          variant={obj.deliveryStage ? 'default' : 'secondary'}
                                          className="text-xs cursor-pointer hover:opacity-80 transition-opacity"
                                          onClick={() => {
                                            const stages: Array<'1' | '2' | '3' | '4' | '5' | undefined> = ['1', '2', '3', '4', '5', undefined];
                                            const currentIndex = obj.deliveryStage ? stages.indexOf(obj.deliveryStage) : -1;
                                            const nextStage = stages[(currentIndex + 1) % stages.length];
                                            
                                            setProjects(projects.map(p => 
                                              p.id === project.id 
                                                ? {
                                                    ...p,
                                                    objects: p.objects.map(o => 
                                                      o.id === obj.id 
                                                        ? { ...o, deliveryStage: nextStage }
                                                        : o
                                                    )
                                                  }
                                                : p
                                            ));
                                          }}
                                        >
                                          {obj.deliveryStage ? `${obj.deliveryStage} этап` : '-'}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>{obj.region}</TableCell>
                                      <TableCell>{obj.district}</TableCell>
                                      <TableCell>{obj.location}</TableCell>
                                      <TableCell className="font-mono text-xs">{obj.coordinates}</TableCell>
                                      <TableCell>
                                        <Badge 
                                          variant={obj.inspection ? 'default' : 'secondary'} 
                                          className="text-xs cursor-pointer hover:opacity-80 transition-opacity"
                                          onClick={() => {
                                            setProjects(projects.map(p => 
                                              p.id === project.id 
                                                ? {
                                                    ...p,
                                                    objects: p.objects.map(o => 
                                                      o.id === obj.id 
                                                        ? { ...o, inspection: !o.inspection }
                                                        : o
                                                    )
                                                  }
                                                : p
                                            ));
                                          }}
                                        >
                                          {obj.inspection ? 'Выполнено' : 'Не выполнено'}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        <Badge 
                                          variant={obj.poleInstallationPermit ? 'default' : 'secondary'} 
                                          className="text-xs cursor-pointer hover:opacity-80 transition-opacity"
                                          onClick={() => {
                                            setProjects(projects.map(p => 
                                              p.id === project.id 
                                                ? {
                                                    ...p,
                                                    objects: p.objects.map(o => 
                                                      o.id === obj.id 
                                                        ? { ...o, poleInstallationPermit: !o.poleInstallationPermit }
                                                        : o
                                                    )
                                                  }
                                                : p
                                            ));
                                          }}
                                        >
                                          {obj.poleInstallationPermit ? 'Получено' : 'Не получено'}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        <Badge 
                                          variant={obj.powerConnectionPermit ? 'default' : 'secondary'} 
                                          className="text-xs cursor-pointer hover:opacity-80 transition-opacity"
                                          onClick={() => {
                                            setProjects(projects.map(p => 
                                              p.id === project.id 
                                                ? {
                                                    ...p,
                                                    objects: p.objects.map(o => 
                                                      o.id === obj.id 
                                                        ? { ...o, powerConnectionPermit: !o.powerConnectionPermit }
                                                        : o
                                                    )
                                                  }
                                                : p
                                            ));
                                          }}
                                        >
                                          {obj.powerConnectionPermit ? 'Получено' : 'Не получено'}
                                        </Badge>
                                      </TableCell>
                                      <TableCell className="text-xs">{obj.otherPermits || '-'}</TableCell>
                                      <TableCell className="font-mono text-xs">{obj.equipmentNumber}</TableCell>
                                      <TableCell>{obj.quantity}</TableCell>
                                      <TableCell>
                                        <Badge 
                                          variant={obj.verificationCertificate ? 'default' : 'secondary'} 
                                          className="text-xs cursor-pointer hover:opacity-80 transition-opacity"
                                          onClick={() => {
                                            setProjects(projects.map(p => 
                                              p.id === project.id 
                                                ? {
                                                    ...p,
                                                    objects: p.objects.map(o => 
                                                      o.id === obj.id 
                                                        ? { ...o, verificationCertificate: !o.verificationCertificate }
                                                        : o
                                                    )
                                                  }
                                                : p
                                            ));
                                          }}
                                        >
                                          {obj.verificationCertificate ? 'Есть' : 'Нет'}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        <Badge 
                                          variant={obj.executiveDocumentation ? 'default' : 'secondary'} 
                                          className="text-xs cursor-pointer hover:opacity-80 transition-opacity"
                                          onClick={() => {
                                            setProjects(projects.map(p => 
                                              p.id === project.id 
                                                ? {
                                                    ...p,
                                                    objects: p.objects.map(o => 
                                                      o.id === obj.id 
                                                        ? { ...o, executiveDocumentation: !o.executiveDocumentation }
                                                        : o
                                                    )
                                                  }
                                                : p
                                            ));
                                          }}
                                        >
                                          {obj.executiveDocumentation ? 'Готово' : 'Не готово'}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        <Badge 
                                          variant={obj.constructionWork ? 'default' : 'secondary'} 
                                          className="text-xs cursor-pointer hover:opacity-80 transition-opacity"
                                          onClick={() => {
                                            setProjects(projects.map(p => 
                                              p.id === project.id 
                                                ? {
                                                    ...p,
                                                    objects: p.objects.map(o => 
                                                      o.id === obj.id 
                                                        ? { ...o, constructionWork: !o.constructionWork }
                                                        : o
                                                    )
                                                  }
                                                : p
                                            ));
                                          }}
                                        >
                                          {obj.constructionWork ? 'Завершено' : 'Не завершено'}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        <Badge 
                                          variant={obj.commissioningWork ? 'default' : 'secondary'} 
                                          className="text-xs cursor-pointer hover:opacity-80 transition-opacity"
                                          onClick={() => {
                                            setProjects(projects.map(p => 
                                              p.id === project.id 
                                                ? {
                                                    ...p,
                                                    objects: p.objects.map(o => 
                                                      o.id === obj.id 
                                                        ? { ...o, commissioningWork: !o.commissioningWork }
                                                        : o
                                                    )
                                                  }
                                                : p
                                            ));
                                          }}
                                        >
                                          {obj.commissioningWork ? 'Завершено' : 'Не завершено'}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        <Badge 
                                          variant={obj.trafficArrangement ? 'default' : 'secondary'} 
                                          className="text-xs cursor-pointer hover:opacity-80 transition-opacity"
                                          onClick={() => {
                                            setProjects(projects.map(p => 
                                              p.id === project.id 
                                                ? {
                                                    ...p,
                                                    objects: p.objects.map(o => 
                                                      o.id === obj.id 
                                                        ? { ...o, trafficArrangement: !o.trafficArrangement }
                                                        : o
                                                    )
                                                  }
                                                : p
                                            ));
                                          }}
                                        >
                                          {obj.trafficArrangement ? 'Да' : 'Нет'}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        <Badge 
                                          variant={obj.webUpload ? 'default' : 'secondary'} 
                                          className="text-xs cursor-pointer hover:opacity-80 transition-opacity"
                                          onClick={() => {
                                            setProjects(projects.map(p => 
                                              p.id === project.id 
                                                ? {
                                                    ...p,
                                                    objects: p.objects.map(o => 
                                                      o.id === obj.id 
                                                        ? { ...o, webUpload: !o.webUpload }
                                                        : o
                                                    )
                                                  }
                                                : p
                                            ));
                                          }}
                                        >
                                          {obj.webUpload ? 'Выполнено' : 'Не выполнено'}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        <Badge 
                                          variant={obj.violationRecording ? 'default' : 'secondary'} 
                                          className="text-xs cursor-pointer hover:opacity-80 transition-opacity"
                                          onClick={() => {
                                            setProjects(projects.map(p => 
                                              p.id === project.id 
                                                ? {
                                                    ...p,
                                                    objects: p.objects.map(o => 
                                                      o.id === obj.id 
                                                        ? { ...o, violationRecording: !o.violationRecording }
                                                        : o
                                                    )
                                                  }
                                                : p
                                            ));
                                          }}
                                        >
                                          {obj.violationRecording ? 'Да' : 'Нет'}
                                        </Badge>
                                      </TableCell>
                                      <TableCell className="text-xs">
                                        {obj.violationTypes && obj.violationTypes.length > 0 ? (
                                          <div className="flex flex-wrap gap-1">
                                            {obj.violationTypes.map((v, i) => (
                                              <Badge key={i} variant="outline" className="text-xs">
                                                {v}
                                              </Badge>
                                            ))}
                                          </div>
                                        ) : (
                                          '-'
                                        )}
                                      </TableCell>
                                      <TableCell className="text-xs max-w-[250px]">
                                        {obj.documentationUrl ? (
                                          <a
                                            href={obj.documentationUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary hover:underline flex items-center gap-1"
                                          >
                                            <Icon name="ExternalLink" size={12} />
                                            {obj.documentationUrl}
                                          </a>
                                        ) : (
                                          '-'
                                        )}
                                      </TableCell>
                                      <TableCell>
                                        <Badge 
                                          variant={getWorkStatusColor(obj.workStatus || 'not-started')} 
                                          className="text-xs cursor-pointer hover:opacity-80 transition-opacity"
                                          onClick={() => {
                                            const currentStatus = obj.workStatus || 'not-started';
                                            const statuses: Array<'not-started' | 'in-progress' | 'paused' | 'completed'> = ['not-started', 'in-progress', 'paused', 'completed'];
                                            const currentIndex = statuses.indexOf(currentStatus);
                                            const nextStatus = statuses[(currentIndex + 1) % statuses.length];
                                            
                                            setProjects(projects.map(p => 
                                              p.id === project.id 
                                                ? {
                                                    ...p,
                                                    objects: p.objects.map(o => 
                                                      o.id === obj.id 
                                                        ? { ...o, workStatus: nextStatus }
                                                        : o
                                                    )
                                                  }
                                                : p
                                            ));
                                          }}
                                        >
                                          {getWorkStatusText(obj.workStatus || 'not-started')}
                                        </Badge>
                                      </TableCell>
                                      <TableCell className="text-xs max-w-[200px]">{obj.notes || '-'}</TableCell>
                                      <TableCell className="text-xs max-w-[200px]">
                                        {obj.messengerLink ? (
                                          <a 
                                            href={obj.messengerLink} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-primary hover:underline flex items-center gap-1"
                                          >
                                            <Icon name="MessageCircle" size={14} />
                                            Открыть
                                          </a>
                                        ) : '-'}
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex gap-1">
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => openEditObjectDialog(project.id, obj)}
                                          >
                                            <Icon name="Pencil" size={14} />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive hover:text-destructive"
                                            onClick={() => handleDeleteObject(project.id, obj.id)}
                                          >
                                            <Icon name="Trash2" size={14} />
                                          </Button>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                              ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                  <Icon name="Filter" className="mx-auto mb-2" size={32} />
                                  <p>Нет объектов, соответствующих выбранному фильтру</p>
                                </div>
                              )}
                            </>
                          )}
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
                  {projects.map((project) => {
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
                    const count = projects.filter((p) => p.type === type).length;
                    const percentage = projects.length > 0 ? (count / projects.length) * 100 : 0;
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
                    const count = projects.filter((p) => p.status === status).length;
                    const percentage = projects.length > 0 ? (count / projects.length) * 100 : 0;
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
                        {formatCurrency(projects.reduce((acc, p) => acc + p.budget, 0))}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Израсходовано</p>
                      <p className="text-3xl font-bold text-primary">
                        {formatCurrency(projects.reduce((acc, p) => acc + p.spent, 0))}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Остаток</p>
                      <p className="text-3xl font-bold text-secondary">
                        {formatCurrency(
                          projects.reduce((acc, p) => acc + (p.budget - p.spent), 0)
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="mt-6">
                    <Progress
                      value={
                        projects.reduce((acc, p) => acc + p.budget, 0) > 0
                          ? (projects.reduce((acc, p) => acc + p.spent, 0) /
                              projects.reduce((acc, p) => acc + p.budget, 0)) *
                            100
                          : 0
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

      <Dialog open={isObjectDialogOpen} onOpenChange={setIsObjectDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingObject ? 'Редактировать объект' : 'Новый объект'}</DialogTitle>
            <DialogDescription>
              Заполните информацию об объекте строительства
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="obj-name">Название объекта *</Label>
                <Input
                  id="obj-name"
                  placeholder="Например: Участок км 10-15"
                  value={newObject.name}
                  onChange={(e) => setNewObject({ ...newObject, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="stage">Этап проекта</Label>
                <Select 
                  value={newObject.stageId || 'no-stage'} 
                  onValueChange={(value) => setNewObject({ ...newObject, stageId: value === 'no-stage' ? undefined : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите этап" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-stage">Без этапа</SelectItem>
                    {currentProjectId && projects.find(p => p.id === currentProjectId)?.stages.map((stage) => (
                      <SelectItem key={stage.id} value={stage.id}>
                        {stage.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="delivery-stage">Этап сдачи объекта</Label>
                <Select 
                  value={newObject.deliveryStage || 'none'} 
                  onValueChange={(value) => setNewObject({ ...newObject, deliveryStage: value === 'none' ? undefined : value as '1' | '2' | '3' | '4' | '5' })}
                >
                  <SelectTrigger id="delivery-stage">
                    <SelectValue placeholder="Выберите этап сдачи" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Не указан</SelectItem>
                    <SelectItem value="1">1 этап</SelectItem>
                    <SelectItem value="2">2 этап</SelectItem>
                    <SelectItem value="3">3 этап</SelectItem>
                    <SelectItem value="4">4 этап</SelectItem>
                    <SelectItem value="5">5 этап</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="region">Регион</Label>
                <Input
                  id="region"
                  placeholder="Московская область"
                  value={newObject.region}
                  onChange={(e) => setNewObject({ ...newObject, region: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="district">Район</Label>
                <Input
                  id="district"
                  placeholder="Балашихинский"
                  value={newObject.district}
                  onChange={(e) => setNewObject({ ...newObject, district: e.target.value })}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="location">Локация</Label>
                <Input
                  id="location"
                  placeholder="М-12, км 10-15"
                  value={newObject.location}
                  onChange={(e) => setNewObject({ ...newObject, location: e.target.value })}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="coordinates">Координаты</Label>
                <Input
                  id="coordinates"
                  placeholder="55.7558° N, 37.6173° E"
                  value={newObject.coordinates}
                  onChange={(e) => setNewObject({ ...newObject, coordinates: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="equipment">Номер оборудования</Label>
                <Input
                  id="equipment"
                  placeholder="CAM-M12-001"
                  value={newObject.equipmentNumber}
                  onChange={(e) => setNewObject({ ...newObject, equipmentNumber: e.target.value })}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="quantity">Количество</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={newObject.quantity}
                  onChange={(e) => setNewObject({ ...newObject, quantity: Number(e.target.value) })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="other-permits">Другие разрешения</Label>
                <Input
                  id="other-permits"
                  placeholder="Разрешение на земляные работы"
                  value={newObject.otherPermits}
                  onChange={(e) => setNewObject({ ...newObject, otherPermits: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-4 p-4 border border-border rounded-lg">
              <h4 className="font-semibold text-sm">Статусы выполнения</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="inspection"
                    checked={newObject.inspection}
                    onCheckedChange={(checked) => setNewObject({ ...newObject, inspection: !!checked })}
                  />
                  <Label htmlFor="inspection" className="cursor-pointer">Обследование</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="pole-permit"
                    checked={newObject.poleInstallationPermit}
                    onCheckedChange={(checked) => setNewObject({ ...newObject, poleInstallationPermit: !!checked })}
                  />
                  <Label htmlFor="pole-permit" className="cursor-pointer">ТУ на установку опор</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="power-permit"
                    checked={newObject.powerConnectionPermit}
                    onCheckedChange={(checked) => setNewObject({ ...newObject, powerConnectionPermit: !!checked })}
                  />
                  <Label htmlFor="power-permit" className="cursor-pointer">ТУ на подключение к электропитанию</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="verification"
                    checked={newObject.verificationCertificate}
                    onCheckedChange={(checked) => setNewObject({ ...newObject, verificationCertificate: !!checked })}
                  />
                  <Label htmlFor="verification" className="cursor-pointer">Свидетельство о поверке</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="executive-docs"
                    checked={newObject.executiveDocumentation}
                    onCheckedChange={(checked) => setNewObject({ ...newObject, executiveDocumentation: !!checked })}
                  />
                  <Label htmlFor="executive-docs" className="cursor-pointer">Исполнительная документация</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="construction"
                    checked={newObject.constructionWork}
                    onCheckedChange={(checked) => setNewObject({ ...newObject, constructionWork: !!checked })}
                  />
                  <Label htmlFor="construction" className="cursor-pointer">Строительно-монтажные работы</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="commissioning"
                    checked={newObject.commissioningWork}
                    onCheckedChange={(checked) => setNewObject({ ...newObject, commissioningWork: !!checked })}
                  />
                  <Label htmlFor="commissioning" className="cursor-pointer">Пуско-наладочные работы</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="traffic"
                    checked={newObject.trafficArrangement}
                    onCheckedChange={(checked) => setNewObject({ ...newObject, trafficArrangement: !!checked })}
                  />
                  <Label htmlFor="traffic" className="cursor-pointer">ПОДД</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="web-upload"
                    checked={newObject.webUpload}
                    onCheckedChange={(checked) => setNewObject({ ...newObject, webUpload: !!checked })}
                  />
                  <Label htmlFor="web-upload" className="cursor-pointer">Выгрузка в Паутину</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="violations"
                    checked={newObject.violationRecording}
                    onCheckedChange={(checked) => setNewObject({ ...newObject, violationRecording: !!checked })}
                  />
                  <Label htmlFor="violations" className="cursor-pointer">Фиксация нарушений</Label>
                </div>
              </div>
            </div>

            <div className="grid gap-4 p-4 border border-border rounded-lg bg-muted/30">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Icon name="FileText" size={16} />
                Дополнительная информация
              </h4>
              
              <div className="grid gap-2">
                <Label htmlFor="work-status">Статус работ</Label>
                <Select
                  value={newObject.workStatus || 'not-started'}
                  onValueChange={(value) => setNewObject({ ...newObject, workStatus: value as any })}
                >
                  <SelectTrigger id="work-status">
                    <SelectValue placeholder="Выберите статус" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not-started">Не взято в работу</SelectItem>
                    <SelectItem value="in-progress">В работе</SelectItem>
                    <SelectItem value="paused">Приостановлено</SelectItem>
                    <SelectItem value="completed">Выполнено</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="violation-types">Типы нарушений КоАП ПДД</Label>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {newObject.violationTypes && newObject.violationTypes.length > 0 && (
                      newObject.violationTypes.map((v, i) => (
                        <Badge key={i} variant="secondary" className="gap-1">
                          {v}
                          <button
                            onClick={() => setNewObject({
                              ...newObject,
                              violationTypes: newObject.violationTypes?.filter((_, idx) => idx !== i)
                            })}
                            className="ml-1 hover:text-destructive"
                          >
                            <Icon name="X" size={12} />
                          </button>
                        </Badge>
                      ))
                    )}
                  </div>
                  <Select
                    value=""
                    onValueChange={(value) => {
                      if (value && !newObject.violationTypes?.includes(value)) {
                        setNewObject({
                          ...newObject,
                          violationTypes: [...(newObject.violationTypes || []), value]
                        });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Добавить нарушение" />
                    </SelectTrigger>
                    <SelectContent>
                      {KOAP_VIOLATIONS.map((violation) => (
                        <SelectItem key={violation.code} value={violation.code}>
                          {violation.code} — {violation.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="documentation-url">Ссылка на документацию</Label>
                <Input
                  id="documentation-url"
                  type="url"
                  placeholder="https://docs.example.com/project-123"
                  value={newObject.documentationUrl}
                  onChange={(e) => setNewObject({ ...newObject, documentationUrl: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Примечание</Label>
              <Textarea
                id="notes"
                placeholder="Дополнительная информация об объекте"
                rows={3}
                value={newObject.notes}
                onChange={(e) => setNewObject({ ...newObject, notes: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="messenger-link">Ссылка на мессенджер</Label>
              <Input
                id="messenger-link"
                type="url"
                placeholder="https://t.me/username или https://wa.me/79001234567"
                value={newObject.messengerLink}
                onChange={(e) => setNewObject({ ...newObject, messengerLink: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Telegram, WhatsApp или другой мессенджер</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetObjectForm}>
              Отмена
            </Button>
            <Button onClick={editingObject ? handleUpdateObject : handleAddObject}>
              {editingObject ? 'Сохранить изменения' : 'Добавить объект'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isBulkStatusDialogOpen} onOpenChange={setIsBulkStatusDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Массовое изменение статуса</DialogTitle>
            <DialogDescription>
              Изменить статус работ для {selectedObjects.size} выбранных объектов
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="bulk-status">Новый статус</Label>
              <Select
                value={bulkStatus}
                onValueChange={(value) => setBulkStatus(value as any)}
              >
                <SelectTrigger id="bulk-status">
                  <SelectValue placeholder="Выберите статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not-started">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">Не взято в работу</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="in-progress">
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="text-xs">В работе</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="paused">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">Приостановлено</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="completed">
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="text-xs bg-green-500">Выполнено</Badge>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="p-4 bg-muted/50 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground">
                <Icon name="Info" size={14} className="inline mr-1" />
                Статус будет обновлен для всех выбранных объектов одновременно
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkStatusDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleBulkStatusChange}>
              <Icon name="Check" size={16} className="mr-2" />
              Применить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isBulkViolationsDialogOpen} onOpenChange={setIsBulkViolationsDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Массовое назначение нарушений КоАП</DialogTitle>
            <DialogDescription>
              Назначить типы нарушений для {selectedObjects.size} выбранных объектов
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Выбранные нарушения</Label>
              <div className="flex flex-wrap gap-2 mb-2 min-h-[40px] p-3 border border-border rounded-lg bg-muted/30">
                {bulkViolations.length > 0 ? (
                  bulkViolations.map((v, i) => (
                    <Badge key={i} variant="secondary" className="gap-1">
                      {v}
                      <button
                        onClick={() => setBulkViolations(bulkViolations.filter((_, idx) => idx !== i))}
                        className="ml-1 hover:text-destructive"
                      >
                        <Icon name="X" size={12} />
                      </button>
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">Нарушения не выбраны</span>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bulk-violation-select">Добавить нарушение</Label>
              <Select
                value=""
                onValueChange={(value) => {
                  if (value && !bulkViolations.includes(value)) {
                    setBulkViolations([...bulkViolations, value]);
                  }
                }}
              >
                <SelectTrigger id="bulk-violation-select">
                  <SelectValue placeholder="Выберите нарушение КоАП ПДД" />
                </SelectTrigger>
                <SelectContent>
                  {KOAP_VIOLATIONS.map((violation) => (
                    <SelectItem 
                      key={violation.code} 
                      value={violation.code}
                      disabled={bulkViolations.includes(violation.code)}
                    >
                      <div className="flex items-start gap-2">
                        <span className="font-mono font-semibold">{violation.code}</span>
                        <span className="text-muted-foreground">—</span>
                        <span>{violation.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground">
                <Icon name="Info" size={14} className="inline mr-1" />
                Выбранные нарушения заменят текущие для всех отмеченных объектов
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsBulkViolationsDialogOpen(false);
              setBulkViolations([]);
            }}>
              Отмена
            </Button>
            <Button onClick={handleBulkViolationsChange} disabled={bulkViolations.length === 0}>
              <Icon name="Check" size={16} className="mr-2" />
              Применить ({bulkViolations.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isStageDialogOpen} onOpenChange={setIsStageDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingStage ? 'Редактировать этап' : 'Новый этап'}</DialogTitle>
            <DialogDescription>
              Заполните информацию об этапе проекта
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="stage-name">Название этапа *</Label>
              <Input
                id="stage-name"
                placeholder="Например: Прокладка коммуникаций"
                value={newStage.name}
                onChange={(e) => setNewStage({ ...newStage, name: e.target.value })}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="stage-start">Дата начала</Label>
                <Input
                  id="stage-start"
                  type="date"
                  value={newStage.startDate}
                  onChange={(e) => setNewStage({ ...newStage, startDate: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="stage-end">Дата окончания</Label>
                <Input
                  id="stage-end"
                  type="date"
                  value={newStage.endDate}
                  onChange={(e) => setNewStage({ ...newStage, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="stage-progress">Прогресс (%)</Label>
                <Input
                  id="stage-progress"
                  type="number"
                  min="0"
                  max="100"
                  value={newStage.progress}
                  onChange={(e) => setNewStage({ ...newStage, progress: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="stage-status">Статус</Label>
                <Select 
                  value={newStage.status} 
                  onValueChange={(value) => setNewStage({ ...newStage, status: value as 'completed' | 'in-progress' | 'pending' })}
                >
                  <SelectTrigger id="stage-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Ожидание</SelectItem>
                    <SelectItem value="in-progress">В работе</SelectItem>
                    <SelectItem value="completed">Завершен</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsStageDialogOpen(false);
              setEditingStage(null);
            }}>
              Отмена
            </Button>
            <Button onClick={handleAddStage} disabled={!newStage.name}>
              <Icon name="Check" size={16} className="mr-2" />
              {editingStage ? 'Сохранить' : 'Добавить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;