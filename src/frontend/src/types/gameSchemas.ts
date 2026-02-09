export type FieldType = 'text' | 'number' | 'select' | 'multi-select' | 'boolean';

export interface GameFieldSchema {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  placeholder?: string;
  required?: boolean;
}

export interface GameSchema {
  name: string;
  fields: GameFieldSchema[];
}

export type GameAttributes = Record<string, string | number | boolean | string[]>;

export const gameSchemas: Record<string, GameFieldSchema[]> = {
  "play-together": [
    { key: "level", label: "Level", type: "number", placeholder: "100" },
    { key: "server", label: "Server", type: "select", options: ["VNG"] },
    { key: "gems", label: "Gems", type: "number", placeholder: "10000" },
    { key: "stars", label: "Stars", type: "number", placeholder: "50000" },
  ],
};

export const getAvailableGames = (): string[] => Object.keys(gameSchemas);

export const getGameSchema = (gameName: string): GameFieldSchema[] => {
  return gameSchemas[gameName] || [];
};