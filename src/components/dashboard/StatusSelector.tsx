import { useState, useRef, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { loadStatusOptions, getStatusOption, WorkStatus } from '@/lib/statusConfig';

interface StatusSelectorProps {
  value: WorkStatus;
  onChange: (newStatus: WorkStatus) => void;
}

export function StatusSelector({ value, onChange }: StatusSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const statusOptions = loadStatusOptions();
  const currentStatus = getStatusOption(value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleStatusChange = (newStatus: WorkStatus) => {
    onChange(newStatus);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <Badge
        className={`${currentStatus.bgClass} cursor-pointer hover:opacity-80 transition-opacity`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {currentStatus.label}
      </Badge>

      {isOpen && (
        <div className="absolute z-50 mt-1 min-w-[150px] rounded-md border bg-popover shadow-lg">
          <div className="p-1 space-y-1">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleStatusChange(option.value)}
                className={`w-full text-left px-3 py-2 rounded-sm text-sm hover:bg-accent transition-colors ${
                  option.value === value ? 'bg-accent' : ''
                }`}
              >
                <Badge className={`${option.bgClass}/10 ${option.textClass} ${option.borderClass}`}>
                  {option.label}
                </Badge>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
