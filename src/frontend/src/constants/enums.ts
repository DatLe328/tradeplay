import type { translations } from "@/stores/languageStore-old";

export const SystemRole = {
  User: 0,
  Admin: 1,
} as const;

export type SystemRole = typeof SystemRole[keyof typeof SystemRole];


export const AccountStatus = {
  Draft: 0,
  Available: 1,
  Reserved: 2,
  Sold: 3,
  Deleted: 4,
} as const;

export type AccountStatus =
  typeof AccountStatus[keyof typeof AccountStatus];


export const OrderStatus = {
  Pending: 0,
  Paid: 1,
  Completed: 2,
  Cancelled: 3,
  Refunded: 4,
} as const;

export type OrderStatus =
  typeof OrderStatus[keyof typeof OrderStatus];


export const OrderType = {
  BuyAcc: 0,
  Deposit: 1,
} as const;

export type OrderType =
  typeof OrderType[keyof typeof OrderType];


export const AccountStatusLabelKey: Record<number, keyof typeof translations.vi> = {
  [AccountStatus.Draft]: "statusDraft",
  [AccountStatus.Available]: "statusAvailable",
  [AccountStatus.Reserved]: "statusReserved",
  [AccountStatus.Sold]: "statusSold",
  [AccountStatus.Deleted]: "statusDeleted",
};

export const OrderStatusLabel: Record<number, string> = {
  [OrderStatus.Pending]: "Chờ thanh toán",
  [OrderStatus.Paid]: "Đã thanh toán",
  [OrderStatus.Completed]: "Hoàn thành",
  [OrderStatus.Cancelled]: "Đã hủy",
  [OrderStatus.Refunded]: "Đã hoàn tiền",
};

export const SystemRoleLabel: Record<number, string> = {
  [SystemRole.User]: "Người dùng",
  [SystemRole.Admin]: "Quản trị viên",
};

export const GameID = {
  All: 0,
  PlayTogether: 1,
  LiênQuân: 2,
  FreeFire: 3,
} as const;

export const GameList = [
  { id: GameID.PlayTogether, name: "Play Together", slug: "play-together" },
] as const;

export const getGameName = (id: number | undefined): string => {
  const game = GameList.find(g => g.id === id);
  return game ? game.name : "Game khác";
};

export const NotificationType = {
  OrderStatus: 0,
  AccountSold: 1,
  Promotion: 2,
  System: 3,
  Message: 4,
} as const;

export type NotificationType = typeof NotificationType[keyof typeof NotificationType];

export const NotificationTypeLabel: Record<number, string> = {
  [NotificationType.OrderStatus]: "Trạng thái đơn hàng",
  [NotificationType.AccountSold]: "Tài khoản đã bán",
  [NotificationType.Promotion]: "Khuyến mãi",
  [NotificationType.System]: "Hệ thống",
  [NotificationType.Message]: "Tin nhắn",
};