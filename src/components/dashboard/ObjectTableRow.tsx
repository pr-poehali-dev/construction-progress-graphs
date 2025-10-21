import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

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

interface ObjectTableRowProps {
  obj: ProjectObject;
  onEdit: (obj: ProjectObject) => void;
  onExport: (obj: ProjectObject) => void;
}

export function ObjectTableRow({ obj, onEdit, onExport }: ObjectTableRowProps) {
  const getWorkStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'in-progress': return 'bg-blue-500/10 text-blue-700 border-blue-500/20';
      case 'paused': return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
      case 'not-started': return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
      default: return '';
    }
  };

  const getWorkStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Завершено';
      case 'in-progress': return 'В работе';
      case 'paused': return 'Приостановлено';
      case 'not-started': return 'Не начато';
      default: return '';
    }
  };

  return (
    <TableRow>
      <TableCell className="font-medium">{obj.name}</TableCell>
      <TableCell>{obj.region}</TableCell>
      <TableCell>{obj.district}</TableCell>
      <TableCell>
        <div className="max-w-xs truncate" title={obj.location}>{obj.location}</div>
      </TableCell>
      <TableCell>
        <div className="max-w-xs truncate font-mono text-xs" title={obj.coordinates}>{obj.coordinates}</div>
      </TableCell>
      <TableCell>
        <Checkbox checked={obj.inspection} disabled />
      </TableCell>
      <TableCell>
        <Checkbox checked={obj.poleInstallationPermit} disabled />
      </TableCell>
      <TableCell>
        <Checkbox checked={obj.powerConnectionPermit} disabled />
      </TableCell>
      <TableCell>
        <div className="max-w-xs truncate" title={obj.otherPermits}>{obj.otherPermits || '-'}</div>
      </TableCell>
      <TableCell className="font-mono text-xs">{obj.equipmentNumber}</TableCell>
      <TableCell>{obj.quantity}</TableCell>
      <TableCell>
        <Checkbox checked={obj.verificationCertificate} disabled />
      </TableCell>
      <TableCell>
        <Checkbox checked={obj.executiveDocumentation} disabled />
      </TableCell>
      <TableCell>
        <Checkbox checked={obj.constructionWork} disabled />
      </TableCell>
      <TableCell>
        <Checkbox checked={obj.commissioningWork} disabled />
      </TableCell>
      <TableCell>
        <Checkbox checked={obj.trafficArrangement} disabled />
      </TableCell>
      <TableCell>
        <Checkbox checked={obj.webUpload} disabled />
      </TableCell>
      <TableCell>
        <Checkbox checked={obj.violationRecording} disabled />
      </TableCell>
      <TableCell>
        <div className="max-w-xs">
          {obj.violationTypes.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {obj.violationTypes.map((v, i) => (
                <Badge key={i} variant="outline" className="text-xs">{v}</Badge>
              ))}
            </div>
          ) : '-'}
        </div>
      </TableCell>
      <TableCell>
        {obj.documentationUrl ? (
          <a href={obj.documentationUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
            <Icon name="external-link" className="h-3 w-3" />
            Открыть
          </a>
        ) : '-'}
      </TableCell>
      <TableCell>
        <Badge className={getWorkStatusColor(obj.workStatus)}>{getWorkStatusText(obj.workStatus)}</Badge>
      </TableCell>
      <TableCell>
        <div className="max-w-xs truncate" title={obj.notes}>{obj.notes || '-'}</div>
      </TableCell>
      <TableCell>
        {obj.messengerLink ? (
          <a href={obj.messengerLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
            <Icon name="message-circle" className="h-3 w-3" />
            Открыть
          </a>
        ) : '-'}
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(obj)}>
            <Icon name="pencil" className="h-3 w-3 mr-1" />
            Изменить
          </Button>
          <Button variant="outline" size="sm" onClick={() => onExport(obj)}>
            <Icon name="download" className="h-3 w-3 mr-1" />
            Экспорт
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
