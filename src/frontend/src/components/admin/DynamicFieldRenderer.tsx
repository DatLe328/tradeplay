import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { type GameFieldSchema } from '@/types/gameSchemas';
import { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DynamicFieldRendererProps {
  field: GameFieldSchema;
  value: string | number | boolean | string[] | undefined;
  onChange: (key: string, value: string | number | boolean | string[]) => void;
}

export function DynamicFieldRenderer({ field, value, onChange }: DynamicFieldRendererProps) {
  const [open, setOpen] = useState(false);

  switch (field.type) {
    case 'text':
      return (
        <div className="space-y-2">
          <Label htmlFor={field.key}>
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <Input
            id={field.key}
            type="text"
            value={(value as string) || ''}
            onChange={(e) => onChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
          />
        </div>
      );

    case 'number':
      return (
        <div className="space-y-2">
          <Label htmlFor={field.key}>
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <Input
            id={field.key}
            type="number"
            value={(value as number) || ''}
            onChange={(e) => onChange(field.key, e.target.value ? Number(e.target.value) : '')}
            placeholder={field.placeholder}
            required={field.required}
          />
        </div>
      );

    case 'select':
      return (
        <div className="space-y-2">
          <Label>
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <Select
            value={(value as string) || ''}
            onValueChange={(val) => onChange(field.key, val)}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Chọn ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );

    case 'multi-select':
      const selectedValues = (value as string[]) || [];
      return (
        <div className="space-y-2">
          <Label>
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between h-auto min-h-10"
              >
                <span className="text-muted-foreground">
                  {selectedValues.length > 0
                    ? `Đã chọn ${selectedValues.length} mục`
                    : `Chọn ${field.label.toLowerCase()}`}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <ScrollArea className="h-60">
                <div className="p-2 space-y-1">
                  {field.options?.map((option) => {
                    const isSelected = selectedValues.includes(option);
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            onChange(field.key, selectedValues.filter((v) => v !== option));
                          } else {
                            onChange(field.key, [...selectedValues, option]);
                          }
                        }}
                        className={cn(
                          "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors text-left",
                          isSelected
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-secondary"
                        )}
                      >
                        <div
                          className={cn(
                            "h-4 w-4 rounded border flex items-center justify-center",
                            isSelected
                              ? "bg-primary border-primary"
                              : "border-muted-foreground"
                          )}
                        >
                          {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                        </div>
                        {option}
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>
          
          {/* Selected Tags */}
          {selectedValues.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {selectedValues.map((item) => (
                <Badge
                  key={item}
                  variant="secondary"
                  className="gap-1 pr-1"
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => onChange(field.key, selectedValues.filter((v) => v !== item))}
                    className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      );

    case 'boolean':
      return (
        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <Label htmlFor={field.key} className="cursor-pointer">
            {field.label}
          </Label>
          <Switch
            id={field.key}
            checked={(value as boolean) || false}
            onCheckedChange={(checked) => onChange(field.key, checked)}
          />
        </div>
      );

    default:
      return null;
  }
}
