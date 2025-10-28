export type WorkStatus = 'yes' | 'no' | 'in-progress' | 'paused' | 'completed';

export interface StatusOption {
  value: WorkStatus;
  label: string;
  color: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
}

const DEFAULT_STATUS_OPTIONS: StatusOption[] = [
  {
    value: 'yes',
    label: 'Да',
    color: 'green',
    bgClass: 'bg-green-500',
    textClass: 'text-green-700',
    borderClass: 'border-green-500/20',
  },
  {
    value: 'no',
    label: 'Нет',
    color: 'red',
    bgClass: 'bg-red-500',
    textClass: 'text-red-700',
    borderClass: 'border-red-500/20',
  },
  {
    value: 'in-progress',
    label: 'В работе',
    color: 'blue',
    bgClass: 'bg-blue-500',
    textClass: 'text-blue-700',
    borderClass: 'border-blue-500/20',
  },
  {
    value: 'paused',
    label: 'Приостановлено',
    color: 'orange',
    bgClass: 'bg-orange-500',
    textClass: 'text-orange-700',
    borderClass: 'border-orange-500/20',
  },
  {
    value: 'completed',
    label: 'Выполнено',
    color: 'emerald',
    bgClass: 'bg-emerald-500',
    textClass: 'text-emerald-700',
    borderClass: 'border-emerald-500/20',
  },
];

let cachedStatusOptions: StatusOption[] | null = null;

export const loadStatusOptions = (): StatusOption[] => {
  if (cachedStatusOptions) return cachedStatusOptions;
  
  try {
    const saved = localStorage.getItem('status-options');
    if (saved) {
      cachedStatusOptions = JSON.parse(saved);
      return cachedStatusOptions!;
    }
  } catch (error) {
    console.error('Ошибка загрузки настроек статусов:', error);
  }
  
  cachedStatusOptions = DEFAULT_STATUS_OPTIONS;
  return cachedStatusOptions;
};

export const saveStatusOptions = (options: StatusOption[]): void => {
  try {
    localStorage.setItem('status-options', JSON.stringify(options));
    cachedStatusOptions = options;
  } catch (error) {
    console.error('Ошибка сохранения настроек статусов:', error);
  }
};

export const resetStatusOptions = (): void => {
  try {
    localStorage.removeItem('status-options');
    cachedStatusOptions = DEFAULT_STATUS_OPTIONS;
  } catch (error) {
    console.error('Ошибка сброса настроек статусов:', error);
  }
};

export const STATUS_OPTIONS = loadStatusOptions();

export const getStatusOption = (status: WorkStatus): StatusOption => {
  const options = loadStatusOptions();
  return options.find(opt => opt.value === status) || options[0];
};

export const getStatusColor = (status: WorkStatus): string => {
  return getStatusOption(status).bgClass;
};

export const getStatusLabel = (status: WorkStatus): string => {
  return getStatusOption(status).label;
};

export const getStatusBadgeClass = (status: WorkStatus): string => {
  const option = getStatusOption(status);
  return `${option.bgClass}/10 ${option.textClass} ${option.borderClass}`;
};