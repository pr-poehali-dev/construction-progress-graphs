import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { STATUS_OPTIONS, StatusOption, WorkStatus } from '@/lib/statusConfig';

interface StatusManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (statuses: StatusOption[]) => void;
}

export function StatusManager({ isOpen, onClose, onSave }: StatusManagerProps) {
  const [statuses, setStatuses] = useState<StatusOption[]>(STATUS_OPTIONS);
  const [editingId, setEditingId] = useState<WorkStatus | null>(null);
  const [editLabel, setEditLabel] = useState('');

  const handleEditStart = (status: StatusOption) => {
    setEditingId(status.value);
    setEditLabel(status.label);
  };

  const handleEditSave = () => {
    if (editingId) {
      setStatuses(statuses.map(s => 
        s.value === editingId ? { ...s, label: editLabel } : s
      ));
      setEditingId(null);
    }
  };

  const handleSave = () => {
    onSave(statuses);
    onClose();
  };

  const colorOptions = [
    { name: 'Зелёный', value: 'green', bgClass: 'bg-green-500', textClass: 'text-green-700', borderClass: 'border-green-500/20' },
    { name: 'Красный', value: 'red', bgClass: 'bg-red-500', textClass: 'text-red-700', borderClass: 'border-red-500/20' },
    { name: 'Синий', value: 'blue', bgClass: 'bg-blue-500', textClass: 'text-blue-700', borderClass: 'border-blue-500/20' },
    { name: 'Оранжевый', value: 'orange', bgClass: 'bg-orange-500', textClass: 'text-orange-700', borderClass: 'border-orange-500/20' },
    { name: 'Изумрудный', value: 'emerald', bgClass: 'bg-emerald-500', textClass: 'text-emerald-700', borderClass: 'border-emerald-500/20' },
    { name: 'Серый', value: 'gray', bgClass: 'bg-gray-500', textClass: 'text-gray-700', borderClass: 'border-gray-500/20' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Управление статусами выполнения</DialogTitle>
          <DialogDescription>
            Настройте названия и цвета статусов для вашего проекта
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {statuses.map((status) => (
            <div key={status.value} className="flex items-center gap-3 p-3 rounded-lg border bg-card text-foreground">
              {editingId === status.value ? (
                <>
                  <Input
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleEditSave();
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    className="flex-1"
                    autoFocus
                  />
                  <Button size="sm" onClick={handleEditSave}>
                    <Icon name="Check" size={16} />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                    <Icon name="X" size={16} />
                  </Button>
                </>
              ) : (
                <>
                  <Badge className={`${status.bgClass}/10 ${status.textClass} ${status.borderClass} min-w-[120px] justify-center`}>
                    {status.label}
                  </Badge>
                  <div className="flex-1">
                    <select
                      value={status.color}
                      onChange={(e) => {
                        const newColor = colorOptions.find(c => c.value === e.target.value);
                        if (newColor) {
                          setStatuses(statuses.map(s =>
                            s.value === status.value
                              ? { ...s, color: newColor.value, bgClass: newColor.bgClass, textClass: newColor.textClass, borderClass: newColor.borderClass }
                              : s
                          ));
                        }
                      }}
                      className="text-sm border rounded px-3 py-1 bg-background text-foreground"
                    >
                      {colorOptions.map(c => (
                        <option key={c.value} value={c.value}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => handleEditStart(status)}>
                    <Icon name="Pencil" size={16} />
                  </Button>
                </>
              )}
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={handleSave}>
            Сохранить изменения
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
