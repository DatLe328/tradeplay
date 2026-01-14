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
  "Play Together": [
    { key: "level", label: "Level", type: "number", placeholder: "100" },
    { key: "server", label: "Server", type: "select", options: ["Asia", "Global", "Korea", "Japan"] },
    { key: "gems", label: "Gems", type: "number", placeholder: "10000" },
    { key: "stars", label: "Stars", type: "number", placeholder: "50000" },
    // { key: "house_type", label: "Loại nhà", type: "select", options: ["Nhà thường", "Nhà lớn", "Biệt thự", "Lâu đài", "Nhà cây", "Nhà dưới nước", "Nhà trên mây"] },
    // { key: "house_decorated", label: "Nhà đã trang trí", type: "boolean" },
    // { key: "outfits_count", label: "Số outfit", type: "number", placeholder: "50" },
    // { key: "rare_outfits", label: "Outfit hiếm", type: "multi-select", options: ["Limited Edition", "Collab Event", "Season Pass", "VIP Only", "Anniversary", "Halloween", "Christmas", "New Year", "Valentine", "Summer Beach", "K-Pop Collab", "Anime Collab"] },
    // { key: "pets", label: "Pet sở hữu", type: "multi-select", options: ["Chó", "Mèo", "Thỏ", "Hamster", "Cáo", "Gấu", "Sư tử", "Hổ", "Rồng", "Kỳ lân", "Phoenix", "Pet Limited"] },
    // { key: "vehicles", label: "Xe sở hữu", type: "multi-select", options: ["Xe đạp", "Skateboard", "Xe máy", "Ô tô", "Xe bus", "Xe cảnh sát", "Xe cứu thương", "Xe cứu hỏa", "Siêu xe", "Xe bay", "Xe Limited"] },
    // { key: "furniture_rare", label: "Nội thất hiếm", type: "multi-select", options: ["Sofa VIP", "Giường King", "Bàn ăn Luxury", "Tivi 4K", "Bể cá", "Đàn Piano", "DJ Set", "Gaming Setup", "Bếp hiện đại", "Hồ bơi mini"] },
    // { key: "minigame_records", label: "Có kỷ lục minigame", type: "boolean" }
  ],
};

export const getAvailableGames = (): string[] => Object.keys(gameSchemas);

export const getGameSchema = (gameName: string): GameFieldSchema[] => {
  return gameSchemas[gameName] || [];
};