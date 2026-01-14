import { Gamepad2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getAvailableGames } from '@/types/gameSchemas';

interface GameSelectorProps {
  value: string;
  onChange: (gameName: string) => void;
  disabled?: boolean;
}

export function GameSelector({ value, onChange, disabled }: GameSelectorProps) {
  const availableGames = getAvailableGames();

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <Gamepad2 className="h-4 w-4 text-primary" />
        Chọn Game <span className="text-destructive">*</span>
      </Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Chọn game..." />
        </SelectTrigger>
        <SelectContent>
          {availableGames.map((game) => (
            <SelectItem key={game} value={game}>
              {game}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
