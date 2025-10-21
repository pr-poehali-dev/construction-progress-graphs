import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface Project {
  status: 'on-track' | 'at-risk' | 'delayed';
  budget: number;
  spent: number;
  objects: any[];
}

interface ProjectStatsProps {
  projects: Project[];
}

export function ProjectStats({ projects }: ProjectStatsProps) {
  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
  const totalSpent = projects.reduce((sum, p) => sum + p.spent, 0);
  const activeProjects = projects.filter(p => p.status !== 'delayed').length;
  const totalObjects = projects.reduce((sum, p) => sum + p.objects.length, 0);

  const stats = [
    {
      title: 'Всего проектов',
      value: projects.length,
      icon: 'folder',
      color: 'text-blue-600',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Активные',
      value: activeProjects,
      icon: 'activity',
      color: 'text-green-600',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'Общий бюджет',
      value: `${(totalBudget / 1000000000).toFixed(2)} млрд ₽`,
      icon: 'wallet',
      color: 'text-purple-600',
      bgColor: 'bg-purple-500/10'
    },
    {
      title: 'Использовано',
      value: `${(totalSpent / 1000000000).toFixed(2)} млрд ₽`,
      icon: 'trending-up',
      color: 'text-orange-600',
      bgColor: 'bg-orange-500/10'
    },
    {
      title: 'Объектов',
      value: totalObjects,
      icon: 'map-pin',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-500/10'
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-6">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <Icon name={stat.icon} className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
