import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { getAvailableGames } from "@/types/gameSchemas";

interface GameSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function GameSelector({ value, onChange }: GameSelectorProps) {
  const games = getAvailableGames();

  return (
    <div className="space-y-2">
      <Label htmlFor="game">Game <span className="text-destructive">*</span></Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Chọn game" />
        </SelectTrigger>
        <SelectContent>
          {games.map((game) => (
            <SelectItem key={game} value={game}>
              {game}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}