import { Gamepad2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { GameList } from "@/constants/enums";

interface GameSelectorProps {
	value: string;
	onChange: (categoryId: string) => void;
	disabled?: boolean;
}

export function GameSelector({ value, onChange, disabled }: GameSelectorProps) {
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
					{GameList.map((game) => (
						<SelectItem key={game.id} value={game.id.toString()}>
							{game.name}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
