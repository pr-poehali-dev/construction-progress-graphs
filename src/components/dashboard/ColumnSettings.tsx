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
  groupId?: string;
}

export interface ColumnGroup {
  id: string;
  label: string;
  collapsed: boolean;
  order: number;
}

interface ColumnSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  columns: ColumnConfig[];
  groups: ColumnGroup[];
  onSave: (columns: ColumnConfig[], groups: ColumnGroup[]) => void;
}

export function ColumnSettings({ isOpen, onClose, columns, groups, onSave }: ColumnSettingsProps) {
  const [localColumns, setLocalColumns] = useState<ColumnConfig[]>([...columns].sort((a, b) => a.order - b.order));
  const [localGroups, setLocalGroups] = useState<ColumnGroup[]>([...groups].sort((a, b) => a.order - b.order));
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState('');

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
    onSave(localColumns, localGroups);
    onClose();
  };

  const toggleGroup = (groupId: string) => {
    setLocalGroups(localGroups.map(g => 
      g.id === groupId ? { ...g, collapsed: !g.collapsed } : g
    ));
  };

  const addGroup = () => {
    const newGroup: ColumnGroup = {
      id: `group-${Date.now()}`,
      label: 'Новая группа',
      collapsed: false,
      order: localGroups.length
    };
    setLocalGroups([...localGroups, newGroup]);
    setEditingGroupId(newGroup.id);
    setNewGroupName(newGroup.label);
  };

  const removeGroup = (groupId: string) => {
    setLocalGroups(localGroups.filter(g => g.id !== groupId));
    setLocalColumns(localColumns.map(col => 
      col.groupId === groupId ? { ...col, groupId: undefined } : col
    ));
  };

  const renameGroup = (groupId: string, newName: string) => {
    setLocalGroups(localGroups.map(g => 
      g.id === groupId ? { ...g, label: newName } : g
    ));
  };

  const assignToGroup = (columnId: string, groupId: string | undefined) => {
    setLocalColumns(localColumns.map(col => 
      col.id === columnId ? { ...col, groupId } : col
    ));
  };

  const getGroupColumns = (groupId: string) => {
    return localColumns.filter(col => col.groupId === groupId);
  };

  const getUngroupedColumns = () => {
    return localColumns.filter(col => !col.groupId);
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
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Настройка колонок</DialogTitle>
          <DialogDescription>
            Группируйте колонки, выбирайте видимые и меняйте порядок
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Видимых колонок: {visibleCount} из {localColumns.length}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={addGroup}>
                <Icon name="FolderPlus" size={14} className="mr-2" />
                Добавить группу
              </Button>
              <Button variant="ghost" size="sm" onClick={handleReset}>
                <Icon name="RotateCcw" size={14} className="mr-2" />
                Сбросить
              </Button>
            </div>
          </div>

          <ScrollArea className="h-[450px] rounded-md border p-4">
            <div className="space-y-3">
              {localGroups.map((group) => {
                const groupColumns = getGroupColumns(group.id);
                return (
                  <div key={group.id} className="rounded-lg border bg-muted/30">
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-t-lg border-b">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => toggleGroup(group.id)}
                      >
                        <Icon 
                          name={group.collapsed ? "ChevronRight" : "ChevronDown"} 
                          size={16} 
                        />
                      </Button>
                      {editingGroupId === group.id ? (
                        <input
                          type="text"
                          value={newGroupName}
                          onChange={(e) => setNewGroupName(e.target.value)}
                          onBlur={() => {
                            renameGroup(group.id, newGroupName);
                            setEditingGroupId(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              renameGroup(group.id, newGroupName);
                              setEditingGroupId(null);
                            }
                          }}
                          className="flex-1 px-2 py-1 text-sm border rounded text-foreground bg-background"
                          autoFocus
                        />
                      ) : (
                        <span 
                          className="flex-1 font-medium text-sm cursor-pointer text-foreground"
                          onClick={() => {
                            setEditingGroupId(group.id);
                            setNewGroupName(group.label);
                          }}
                        >
                          {group.label} ({groupColumns.length})
                        </span>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-destructive"
                        onClick={() => removeGroup(group.id)}
                      >
                        <Icon name="Trash2" size={14} />
                      </Button>
                    </div>
                    {!group.collapsed && (
                      <div className="p-2 space-y-1">
                        {groupColumns.map((column, index) => (
                          <div
                            key={column.id}
                            className="flex items-center gap-2 p-2 rounded bg-card hover:bg-accent transition-colors text-foreground"
                          >
                            <Checkbox
                              id={`${group.id}-${column.id}`}
                              checked={column.visible}
                              onCheckedChange={() => handleToggle(column.id)}
                            />
                            <label
                              htmlFor={`${group.id}-${column.id}`}
                              className="flex-1 text-sm cursor-pointer text-foreground"
                            >
                              {column.label}
                            </label>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs"
                              onClick={() => assignToGroup(column.id, undefined)}
                            >
                              Убрать из группы
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="space-y-2">
                {getUngroupedColumns().length > 0 && (
                  <div className="text-xs text-muted-foreground font-medium mb-2 mt-4">
                    Колонки без группы
                  </div>
                )}
                {getUngroupedColumns().map((column, index) => (
                  <div
                    key={column.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center gap-3 p-3 rounded-lg border bg-card cursor-move hover:bg-accent transition-colors text-foreground ${
                      draggedIndex === index ? 'opacity-50' : ''
                    }`}
                  >
                    <Icon name="GripVertical" size={16} className="text-muted-foreground" />
                    <Checkbox
                      id={column.id}
                      checked={column.visible}
                      onCheckedChange={() => handleToggle(column.id)}
                    />
                    <label
                      htmlFor={column.id}
                      className="flex-1 text-sm cursor-pointer text-foreground"
                    >
                      {column.label}
                    </label>
                    {localGroups.length > 0 && (
                      <select
                        className="text-xs border rounded px-2 py-1 text-foreground bg-background"
                        value=""
                        onChange={(e) => {
                          if (e.target.value) {
                            assignToGroup(column.id, e.target.value);
                          }
                        }}
                      >
                        <option value="">В группу...</option>
                        {localGroups.map(g => (
                          <option key={g.id} value={g.id}>{g.label}</option>
                        ))}
                      </select>
                    )}
                    <span className="text-xs text-muted-foreground">#{index + 1}</span>
                  </div>
                ))}
              </div>
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