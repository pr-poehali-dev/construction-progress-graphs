import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';

interface Stage {
  id: string;
  name: string;
  progress: number;
  startDate: string;
  endDate: string;
  status: 'completed' | 'in-progress' | 'pending';
}

interface StageTimelineProps {
  stages: Stage[];
}

export function StageTimeline({ stages }: StageTimelineProps) {
  const getStageStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'in-progress': return 'bg-blue-500/10 text-blue-700 border-blue-500/20';
      case 'pending': return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
      default: return '';
    }
  };

  const getStageStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Завершен';
      case 'in-progress': return 'В работе';
      case 'pending': return 'Ожидание';
      default: return '';
    }
  };

  const getStageIcon = (status: string) => {
    switch (status) {
      case 'completed': return 'check-circle';
      case 'in-progress': return 'loader';
      case 'pending': return 'clock';
      default: return 'circle';
    }
  };

  return (
    <div className="space-y-4">
      {stages.map((stage, index) => (
        <div key={stage.id} className="relative pl-8 pb-4">
          {index < stages.length - 1 && (
            <div className="absolute left-3 top-8 bottom-0 w-0.5 bg-border" />
          )}
          <div className="absolute left-0 top-1">
            <div className={`p-1.5 rounded-full ${stage.status === 'completed' ? 'bg-green-500' : stage.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-300'}`}>
              <Icon name={getStageIcon(stage.status)} className="h-3 w-3 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">{stage.name}</h4>
              <Badge className={getStageStatusColor(stage.status)}>{getStageStatusText(stage.status)}</Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              {new Date(stage.startDate).toLocaleDateString('ru-RU')} - {new Date(stage.endDate).toLocaleDateString('ru-RU')}
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Прогресс</span>
                <span className="font-semibold">{stage.progress}%</span>
              </div>
              <Progress value={stage.progress} className="h-2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
