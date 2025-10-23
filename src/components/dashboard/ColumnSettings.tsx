import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';

export interface ColumnConfig {
  id: string;
  label: string;
  visible: boolean;
  order: number;
}

interface ColumnSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  columns: ColumnConfig[];
  onSave: (columns: ColumnConfig[]) => void;
}

export function ColumnSettings({ isOpen, onClose, columns, onSave }: ColumnSettingsProps) {
  const [localColumns, setLocalColumns] = useState<ColumnConfig[]>([...columns].sort((a, b) => a.order - b.order));
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleToggle = (id: string) => {
    setLocalColumns(localColumns.map(col => 
      col.id === id ? { ...col, visible: !col.visible } : col
    ));
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newColumns = [...localColumns];
    const draggedColumn = newColumns[draggedIndex];
    newColumns.splice(draggedIndex, 1);
    newColumns.splice(index, 0, draggedColumn);

    setLocalColumns(newColumns.map((col, idx) => ({ ...col, order: idx })));
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSave = () => {
    onSave(localColumns);
    onClose();
  };

  const handleReset = () => {
    const resetColumns = columns.map((col, idx) => ({
      ...col,
      visible: true,
      order: idx
    })).sort((a, b) => a.order - b.order);
    setLocalColumns(resetColumns);
  };

  const visibleCount = localColumns.filter(col => col.visible).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Настройка колонок</DialogTitle>
          <DialogDescription>
            Выберите колонки для отображения и измените порядок перетаскиванием
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Видимых колонок: {visibleCount} из {localColumns.length}</span>
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <Icon name="RotateCcw" size={14} className="mr-2" />
              Сбросить
            </Button>
          </div>

          <ScrollArea className="h-[400px] rounded-md border p-4">
            <div className="space-y-2">
              {localColumns.map((column, index) => (
                <div
                  key={column.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center gap-3 p-3 rounded-lg border bg-card cursor-move hover:bg-accent transition-colors ${
                    draggedIndex === index ? 'opacity-50' : ''
                  }`}
                >
                  <Icon name="GripVertical" size={16} className="text-muted-foreground" />
                  <Checkbox
                    id={column.id}
                    checked={column.visible}
                    onCheckedChange={() => handleToggle(column.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <label
                    htmlFor={column.id}
                    className="flex-1 text-sm cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      handleToggle(column.id);
                    }}
                  >
                    {column.label}
                  </label>
                  <span className="text-xs text-muted-foreground">#{index + 1}</span>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button onClick={handleSave}>
              Применить
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
