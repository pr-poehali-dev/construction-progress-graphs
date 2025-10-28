import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { ColumnConfig, ColumnGroup } from './ColumnSettings';

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
  operator: 'МТС' | 'Мегафон' | 'Билайн' | 'Ростелеком' | 'Другой';
  connectionType: 'GSM' | 'Оптический канал' | 'WI-FI' | 'Другое';
  tariffCost: number;
}

interface Stage {
  id: string;
  name: string;
}

interface DynamicObjectsTableProps {
  objects: ProjectObject[];
  stages: Stage[];
  columnConfig: ColumnConfig[];
  columnGroups: ColumnGroup[];
  selectedObjects: Set<string>;
  onToggleObject: (objectId: string) => void;
  onSelectAll: () => void;
  onEdit: (object: ProjectObject) => void;
  onDelete: (objectId: string) => void;
}

export function DynamicObjectsTable({
  objects,
  stages,
  columnConfig,
  columnGroups,
  selectedObjects,
  onToggleObject,
  onSelectAll,
  onEdit,
  onDelete,
}: DynamicObjectsTableProps) {
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const visibleColumns = columnConfig
    .filter(col => col.visible)
    .sort((a, b) => a.order - b.order);

  const toggleGroupCollapse = (groupId: string) => {
    const newCollapsed = new Set(collapsedGroups);
    if (newCollapsed.has(groupId)) {
      newCollapsed.delete(groupId);
    } else {
      newCollapsed.add(groupId);
    }
    setCollapsedGroups(newCollapsed);
  };

  const getGroupColumns = (groupId: string) => {
    return visibleColumns.filter(col => col.groupId === groupId);
  };

  const getUngroupedColumns = () => {
    return visibleColumns.filter(col => !col.groupId);
  };

  const getVisibleGroupColumns = (groupId: string) => {
    if (collapsedGroups.has(groupId)) return [];
    return getGroupColumns(groupId);
  };

  const sortedGroups = [...columnGroups].sort((a, b) => a.order - b.order);

  const allVisibleColumns = [
    ...sortedGroups.flatMap(group => getVisibleGroupColumns(group.id)),
    ...getUngroupedColumns()
  ];

  const renderCellContent = (column: ColumnConfig, obj: ProjectObject) => {
    switch (column.id) {
      case 'checkbox':
        return (
          <Checkbox
            checked={selectedObjects.has(obj.id)}
            onCheckedChange={() => onToggleObject(obj.id)}
          />
        );
      case 'name':
        return <span className="font-medium">{obj.name}</span>;
      case 'stage':
        return obj.stageId ? (
          <Badge variant="outline" className="text-xs">
            {stages.find(s => s.id === obj.stageId)?.name || 'Этап удален'}
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        );
      case 'deliveryStage':
        return obj.deliveryStage ? (
          <Badge variant="secondary" className="text-xs">
            {obj.deliveryStage} этап
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        );
      case 'region':
        return obj.region;
      case 'district':
        return obj.district;
      case 'location':
        return obj.location;
      case 'coordinates':
        return obj.coordinates;
      case 'inspection':
        return obj.inspection ? <Badge variant="default" className="bg-green-500">Да</Badge> : <Badge variant="secondary">Нет</Badge>;
      case 'poleInstallationPermit':
        return obj.poleInstallationPermit ? <Badge variant="default" className="bg-green-500">Да</Badge> : <Badge variant="secondary">Нет</Badge>;
      case 'powerConnectionPermit':
        return obj.powerConnectionPermit ? <Badge variant="default" className="bg-green-500">Да</Badge> : <Badge variant="secondary">Нет</Badge>;
      case 'otherPermits':
        return obj.otherPermits || '-';
      case 'equipmentNumber':
        return obj.equipmentNumber;
      case 'quantity':
        return obj.quantity;
      case 'verificationCertificate':
        return obj.verificationCertificate ? <Badge variant="default" className="bg-green-500">Да</Badge> : <Badge variant="secondary">Нет</Badge>;
      case 'executiveDocumentation':
        return obj.executiveDocumentation ? <Badge variant="default" className="bg-green-500">Да</Badge> : <Badge variant="secondary">Нет</Badge>;
      case 'constructionWork':
        return obj.constructionWork ? <Badge variant="default" className="bg-green-500">Да</Badge> : <Badge variant="secondary">Нет</Badge>;
      case 'commissioningWork':
        return obj.commissioningWork ? <Badge variant="default" className="bg-green-500">Да</Badge> : <Badge variant="secondary">Нет</Badge>;
      case 'trafficArrangement':
        return obj.trafficArrangement ? <Badge variant="default" className="bg-green-500">Да</Badge> : <Badge variant="secondary">Нет</Badge>;
      case 'operator':
        return <Badge variant="outline">{obj.operator}</Badge>;
      case 'connectionType':
        return <Badge variant="outline">{obj.connectionType}</Badge>;
      case 'tariffCost':
        return `${obj.tariffCost.toLocaleString('ru-RU')} ₽`;
      case 'webUpload':
        return obj.webUpload ? <Badge variant="default" className="bg-green-500">Да</Badge> : <Badge variant="secondary">Нет</Badge>;
      case 'violationRecording':
        return obj.violationRecording ? <Badge variant="default" className="bg-green-500">Да</Badge> : <Badge variant="secondary">Нет</Badge>;
      case 'violationTypes':
        return obj.violationTypes.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {obj.violationTypes.map(v => (
              <Badge key={v} variant="outline" className="text-xs">{v}</Badge>
            ))}
          </div>
        ) : <span className="text-xs text-muted-foreground">-</span>;
      case 'documentationUrl':
        return obj.documentationUrl ? (
          <a href={obj.documentationUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            <Icon name="ExternalLink" size={16} />
          </a>
        ) : '-';
      case 'workStatus':
        const statusColors = {
          'not-started': 'bg-gray-500',
          'in-progress': 'bg-blue-500',
          'paused': 'bg-orange-500',
          'completed': 'bg-green-500',
        };
        const statusLabels = {
          'not-started': 'Не начато',
          'in-progress': 'В работе',
          'paused': 'Приостановлено',
          'completed': 'Завершено',
        };
        return <Badge className={statusColors[obj.workStatus]}>{statusLabels[obj.workStatus]}</Badge>;
      case 'notes':
        return obj.notes || '-';
      case 'messengerLink':
        return obj.messengerLink ? (
          <a href={obj.messengerLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            <Icon name="MessageCircle" size={16} />
          </a>
        ) : '-';
      case 'actions':
        return (
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" onClick={() => onEdit(obj)}>
              <Icon name="Edit" size={14} />
            </Button>
            <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600" onClick={() => onDelete(obj.id)}>
              <Icon name="Trash2" size={14} />
            </Button>
          </div>
        );
      default:
        return '-';
    }
  };

  const getColumnWidth = (columnId: string) => {
    const widths: Record<string, string> = {
      checkbox: 'w-[50px]',
      name: 'min-w-[150px]',
      stage: 'min-w-[150px]',
      deliveryStage: 'min-w-[120px]',
      region: 'min-w-[120px]',
      district: 'min-w-[120px]',
      location: 'min-w-[150px]',
      coordinates: 'min-w-[140px]',
      inspection: 'min-w-[110px]',
      poleInstallationPermit: 'min-w-[150px]',
      powerConnectionPermit: 'min-w-[180px]',
      otherPermits: 'min-w-[140px]',
      equipmentNumber: 'min-w-[150px]',
      quantity: 'min-w-[100px]',
      verificationCertificate: 'min-w-[160px]',
      executiveDocumentation: 'min-w-[180px]',
      constructionWork: 'min-w-[180px]',
      commissioningWork: 'min-w-[180px]',
      trafficArrangement: 'min-w-[90px]',
      operator: 'min-w-[140px]',
      connectionType: 'min-w-[160px]',
      tariffCost: 'min-w-[140px]',
      webUpload: 'min-w-[140px]',
      violationRecording: 'min-w-[140px]',
      violationTypes: 'min-w-[180px]',
      documentationUrl: 'min-w-[250px]',
      workStatus: 'min-w-[150px]',
      notes: 'min-w-[200px]',
      messengerLink: 'min-w-[200px]',
      actions: 'w-[100px]',
    };
    return widths[columnId] || 'min-w-[100px]';
  };

  const allSelected = objects.length > 0 && objects.every(obj => selectedObjects.has(obj.id));

  const sortedGroups = [...columnGroups].sort((a, b) => a.order - b.order);

  const allVisibleColumns = [
    ...sortedGroups.flatMap(group => getVisibleGroupColumns(group.id)),
    ...getUngroupedColumns()
  ];

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <Table>
        <TableHeader>
          {sortedGroups.length > 0 && (
            <TableRow>
              {visibleColumns.some(col => col.id === 'checkbox') && (
                <TableHead className="w-[50px]" rowSpan={2}>
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={onSelectAll}
                  />
                </TableHead>
              )}
              {sortedGroups.map(group => {
                const groupCols = getGroupColumns(group.id);
                if (groupCols.length === 0) return null;
                const isCollapsed = collapsedGroups.has(group.id);
                return (
                  <TableHead 
                    key={group.id} 
                    colSpan={isCollapsed ? 1 : groupCols.length}
                    className="bg-muted/50 border-x-2 border-muted cursor-pointer hover:bg-muted/70 transition-colors text-center"
                    onClick={() => toggleGroupCollapse(group.id)}
                  >
                    <div className="flex items-center justify-center gap-2 font-semibold">
                      <Icon name={isCollapsed ? "ChevronRight" : "ChevronDown"} size={14} />
                      {group.label}
                      <span className="text-xs font-normal text-muted-foreground">({groupCols.length})</span>
                    </div>
                  </TableHead>
                );
              })}
              {getUngroupedColumns().filter(col => col.id !== 'checkbox').map(column => (
                <TableHead key={column.id} className={getColumnWidth(column.id)} rowSpan={2}>
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          )}
          <TableRow>
            {sortedGroups.length === 0 && visibleColumns.some(col => col.id === 'checkbox') && (
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={onSelectAll}
                />
              </TableHead>
            )}
            {sortedGroups.flatMap(group => {
              const groupCols = getVisibleGroupColumns(group.id);
              return groupCols.map(column => (
                <TableHead key={column.id} className={`${getColumnWidth(column.id)} bg-muted/20`}>
                  {column.label}
                </TableHead>
              ));
            })}
            {sortedGroups.length === 0 && getUngroupedColumns().filter(col => col.id !== 'checkbox').map(column => (
              <TableHead key={column.id} className={getColumnWidth(column.id)}>
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {objects.map(obj => (
            <TableRow key={obj.id} className={selectedObjects.has(obj.id) ? 'bg-primary/5' : ''}>
              {allVisibleColumns.map(column => (
                <TableCell key={column.id}>
                  {renderCellContent(column, obj)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}