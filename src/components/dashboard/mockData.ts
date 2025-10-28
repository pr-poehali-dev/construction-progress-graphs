export interface ProjectObject {
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
  workStatus: 'yes' | 'no' | 'in-progress' | 'paused' | 'completed';
  notes: string;
  messengerLink: string;
  stageId?: string;
  deliveryStage?: '1' | '2' | '3' | '4' | '5';
  operator: 'МТС' | 'Мегафон' | 'Билайн' | 'Ростелеком' | 'Другой';
  connectionType: 'GSM' | 'Оптический канал' | 'WI-FI' | 'Другое';
  tariffCost: number;
}

export interface Stage {
  id: string;
  name: string;
  progress: number;
  startDate: string;
  endDate: string;
  status: 'completed' | 'in-progress' | 'pending';
}

export interface Project {
  id: string;
  name: string;
  type: 'road' | 'bridge' | 'utility' | 'traffic-enforcement';
  progress: number;
  budget: number;
  spent: number;
  status: 'on-track' | 'at-risk' | 'delayed';
  startDate: string;
  endDate: string;
  stages: Stage[];
  objects: ProjectObject[];
}

export const KOAP_VIOLATIONS = [
  { code: '12.9 ч.1', description: 'Превышение скорости на 20-40 км/ч' },
  { code: '12.9 ч.2', description: 'Превышение скорости на 40-60 км/ч' },
  { code: '12.9 ч.3', description: 'Превышение скорости на 60-80 км/ч' },
  { code: '12.12 ч.1', description: 'Проезд на запрещающий сигнал светофора' },
  { code: '12.12 ч.2', description: 'Выезд за стоп-линию' },
  { code: '12.15 ч.1', description: 'Нарушение правил расположения ТС на проезжей части' },
  { code: '12.15 ч.2', description: 'Движение по обочине' },
  { code: '12.16 ч.1', description: 'Несоблюдение требований дорожной разметки' },
  { code: '12.19 ч.1', description: 'Нарушение правил остановки и стоянки' },
];

export const mockProjects: Project[] = [
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
        operator: 'МТС',
        connectionType: 'GSM',
        tariffCost: 1200,
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
        workStatus: 'no',
        notes: 'Требуется согласование ТУ',
        messengerLink: '',
        operator: 'Мегафон',
        connectionType: 'Оптический канал',
        tariffCost: 3500,
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
        operator: 'Ростелеком',
        connectionType: 'Оптический канал',
        tariffCost: 5000,
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
        operator: 'Билайн',
        connectionType: 'WI-FI',
        tariffCost: 2000,
      },
    ],
  },
];