import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
}

interface ProjectCardProps {
  project: Project;
  onSelect: (project: Project) => void;
}

export function ProjectCard({ project, onSelect }: ProjectCardProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'road': return 'construction';
      case 'bridge': return 'bridge';
      case 'utility': return 'factory';
      default: return 'folder';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'at-risk': return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
      case 'delayed': return 'bg-red-500/10 text-red-700 border-red-500/20';
      default: return '';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'on-track': return 'По плану';
      case 'at-risk': return 'Риски';
      case 'delayed': return 'Задержка';
      default: return '';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onSelect(project)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icon name={getTypeIcon(project.type)} className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{project.name}</CardTitle>
              <CardDescription>
                {new Date(project.startDate).toLocaleDateString('ru-RU')} - {new Date(project.endDate).toLocaleDateString('ru-RU')}
              </CardDescription>
            </div>
          </div>
          <Badge className={getStatusColor(project.status)}>{getStatusText(project.status)}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Прогресс</span>
              <span className="font-semibold">{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-2" />
          </div>
          <div className="flex items-center justify-between pt-2 border-t">
            <div>
              <p className="text-xs text-muted-foreground">Бюджет</p>
              <p className="text-sm font-semibold">{(project.budget / 1000000).toFixed(1)} млн ₽</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Использовано</p>
              <p className="text-sm font-semibold">{(project.spent / 1000000).toFixed(1)} млн ₽</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
