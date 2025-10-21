import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
  operator: 'МТС' | 'Мегафон' | 'Билайн' | 'Ростелеком' | 'Другой';
  connectionType: 'GSM' | 'Оптический канал' | 'WI-FI' | 'Другое';
  tariffCost: number;
}

interface Stage {
  id: string;
  name: string;
}

interface ObjectEditDialogProps {
  object: ProjectObject | null;
  stages: Stage[];
  violationOptions: { code: string; description: string }[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (obj: ProjectObject) => void;
}

export function ObjectEditDialog({ object, stages, violationOptions, isOpen, onClose, onSave }: ObjectEditDialogProps) {
  const [editedObject, setEditedObject] = useState<ProjectObject | null>(object);
  const [newViolation, setNewViolation] = useState('');

  if (!editedObject) return null;

  const handleSave = () => {
    onSave(editedObject);
    onClose();
  };

  const handleAddViolation = () => {
    if (newViolation && !editedObject.violationTypes.includes(newViolation)) {
      setEditedObject({
        ...editedObject,
        violationTypes: [...editedObject.violationTypes, newViolation]
      });
      setNewViolation('');
    }
  };

  const handleRemoveViolation = (code: string) => {
    setEditedObject({
      ...editedObject,
      violationTypes: editedObject.violationTypes.filter(v => v !== code)
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Редактирование объекта</DialogTitle>
          <DialogDescription>Измените параметры объекта проекта</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Название</Label>
              <Input
                id="name"
                value={editedObject.name}
                onChange={(e) => setEditedObject({ ...editedObject, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="equipmentNumber">Номер оборудования</Label>
              <Input
                id="equipmentNumber"
                value={editedObject.equipmentNumber}
                onChange={(e) => setEditedObject({ ...editedObject, equipmentNumber: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="region">Регион</Label>
              <Input
                id="region"
                value={editedObject.region}
                onChange={(e) => setEditedObject({ ...editedObject, region: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="district">Район</Label>
              <Input
                id="district"
                value={editedObject.district}
                onChange={(e) => setEditedObject({ ...editedObject, district: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Количество</Label>
              <Input
                id="quantity"
                type="number"
                value={editedObject.quantity}
                onChange={(e) => setEditedObject({ ...editedObject, quantity: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Местоположение</Label>
            <Input
              id="location"
              value={editedObject.location}
              onChange={(e) => setEditedObject({ ...editedObject, location: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="coordinates">Координаты</Label>
            <Input
              id="coordinates"
              value={editedObject.coordinates}
              onChange={(e) => setEditedObject({ ...editedObject, coordinates: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stageId">Этап проекта</Label>
              <Select
                value={editedObject.stageId || ''}
                onValueChange={(value) => setEditedObject({ ...editedObject, stageId: value })}
              >
                <SelectTrigger id="stageId">
                  <SelectValue placeholder="Выберите этап" />
                </SelectTrigger>
                <SelectContent>
                  {stages.map((stage) => (
                    <SelectItem key={stage.id} value={stage.id}>
                      {stage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="workStatus">Статус работ</Label>
              <Select
                value={editedObject.workStatus}
                onValueChange={(value: any) => setEditedObject({ ...editedObject, workStatus: value })}
              >
                <SelectTrigger id="workStatus">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not-started">Не начато</SelectItem>
                  <SelectItem value="in-progress">В работе</SelectItem>
                  <SelectItem value="paused">Приостановлено</SelectItem>
                  <SelectItem value="completed">Завершено</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Разрешительная документация</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="inspection"
                  checked={editedObject.inspection}
                  onCheckedChange={(checked) => setEditedObject({ ...editedObject, inspection: checked as boolean })}
                />
                <label htmlFor="inspection" className="text-sm cursor-pointer">Обследование</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="poleInstallationPermit"
                  checked={editedObject.poleInstallationPermit}
                  onCheckedChange={(checked) => setEditedObject({ ...editedObject, poleInstallationPermit: checked as boolean })}
                />
                <label htmlFor="poleInstallationPermit" className="text-sm cursor-pointer">Разрешение на установку опор</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="powerConnectionPermit"
                  checked={editedObject.powerConnectionPermit}
                  onCheckedChange={(checked) => setEditedObject({ ...editedObject, powerConnectionPermit: checked as boolean })}
                />
                <label htmlFor="powerConnectionPermit" className="text-sm cursor-pointer">Разрешение на подключение к сети</label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="otherPermits">Другие разрешения</Label>
            <Input
              id="otherPermits"
              value={editedObject.otherPermits}
              onChange={(e) => setEditedObject({ ...editedObject, otherPermits: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="operator">Оператор связи</Label>
              <Select
                value={editedObject.operator}
                onValueChange={(value: any) => setEditedObject({ ...editedObject, operator: value })}
              >
                <SelectTrigger id="operator">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="МТС">МТС</SelectItem>
                  <SelectItem value="Мегафон">Мегафон</SelectItem>
                  <SelectItem value="Билайн">Билайн</SelectItem>
                  <SelectItem value="Ростелеком">Ростелеком</SelectItem>
                  <SelectItem value="Другой">Другой</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="connectionType">Тип связи</Label>
              <Select
                value={editedObject.connectionType}
                onValueChange={(value: any) => setEditedObject({ ...editedObject, connectionType: value })}
              >
                <SelectTrigger id="connectionType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GSM">GSM</SelectItem>
                  <SelectItem value="Оптический канал">Оптический канал</SelectItem>
                  <SelectItem value="WI-FI">WI-FI</SelectItem>
                  <SelectItem value="Другое">Другое</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tariffCost">Стоимость тарифа (₽/мес)</Label>
              <Input
                id="tariffCost"
                type="number"
                value={editedObject.tariffCost}
                onChange={(e) => setEditedObject({ ...editedObject, tariffCost: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Состояние работ</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="verificationCertificate"
                  checked={editedObject.verificationCertificate}
                  onCheckedChange={(checked) => setEditedObject({ ...editedObject, verificationCertificate: checked as boolean })}
                />
                <label htmlFor="verificationCertificate" className="text-sm cursor-pointer">Сертификат поверки</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="executiveDocumentation"
                  checked={editedObject.executiveDocumentation}
                  onCheckedChange={(checked) => setEditedObject({ ...editedObject, executiveDocumentation: checked as boolean })}
                />
                <label htmlFor="executiveDocumentation" className="text-sm cursor-pointer">Исполнительная документация</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="constructionWork"
                  checked={editedObject.constructionWork}
                  onCheckedChange={(checked) => setEditedObject({ ...editedObject, constructionWork: checked as boolean })}
                />
                <label htmlFor="constructionWork" className="text-sm cursor-pointer">Строительные работы</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="commissioningWork"
                  checked={editedObject.commissioningWork}
                  onCheckedChange={(checked) => setEditedObject({ ...editedObject, commissioningWork: checked as boolean })}
                />
                <label htmlFor="commissioningWork" className="text-sm cursor-pointer">Пуско-наладочные работы</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="trafficArrangement"
                  checked={editedObject.trafficArrangement}
                  onCheckedChange={(checked) => setEditedObject({ ...editedObject, trafficArrangement: checked as boolean })}
                />
                <label htmlFor="trafficArrangement" className="text-sm cursor-pointer">Обустройство движения</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="webUpload"
                  checked={editedObject.webUpload}
                  onCheckedChange={(checked) => setEditedObject({ ...editedObject, webUpload: checked as boolean })}
                />
                <label htmlFor="webUpload" className="text-sm cursor-pointer">Загрузка в сеть</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="violationRecording"
                  checked={editedObject.violationRecording}
                  onCheckedChange={(checked) => setEditedObject({ ...editedObject, violationRecording: checked as boolean })}
                />
                <label htmlFor="violationRecording" className="text-sm cursor-pointer">Фиксация нарушений</label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Типы нарушений (КоАП РФ)</Label>
            <div className="flex gap-2">
              <Select value={newViolation} onValueChange={setNewViolation}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Выберите нарушение" />
                </SelectTrigger>
                <SelectContent>
                  {violationOptions.map((v) => (
                    <SelectItem key={v.code} value={v.code}>
                      {v.code} - {v.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" variant="outline" onClick={handleAddViolation}>
                <Icon name="plus" className="h-4 w-4" />
              </Button>
            </div>
            {editedObject.violationTypes.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {editedObject.violationTypes.map((code) => (
                  <Badge key={code} variant="secondary" className="gap-1">
                    {code}
                    <button
                      type="button"
                      onClick={() => handleRemoveViolation(code)}
                      className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                    >
                      <Icon name="x" className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="documentationUrl">Ссылка на документацию</Label>
              <Input
                id="documentationUrl"
                value={editedObject.documentationUrl}
                onChange={(e) => setEditedObject({ ...editedObject, documentationUrl: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="messengerLink">Ссылка на мессенджер</Label>
              <Input
                id="messengerLink"
                value={editedObject.messengerLink}
                onChange={(e) => setEditedObject({ ...editedObject, messengerLink: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Примечания</Label>
            <Textarea
              id="notes"
              value={editedObject.notes}
              onChange={(e) => setEditedObject({ ...editedObject, notes: e.target.value })}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Отмена</Button>
          <Button onClick={handleSave}>Сохранить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}