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

export type AccountStatus = typeof AccountStatus[keyof typeof AccountStatus];

export const OrderStatus = {
  Pending: 0,
  Paid: 1,
  Completed: 2,
  Cancelled: 3,
  Refunded: 4,
} as const;

export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];

export const OrderType = {
  BuyAcc: 0,
  Deposit: 1,
} as const;

export type OrderType = typeof OrderType[keyof typeof OrderType];

export const AccountStatusLabelKey: Record<number, string> = {
  [AccountStatus.Draft]: "account.status.draft",
  [AccountStatus.Available]: "account.status.available",
  [AccountStatus.Reserved]: "account.status.reserved",
  [AccountStatus.Sold]: "account.status.sold",
  [AccountStatus.Deleted]: "account.status.deleted",
};

export const OrderStatusLabelKey: Record<number, string> = {
  [OrderStatus.Pending]: "ordersPage.statusPending",
  [OrderStatus.Paid]: "ordersPage.statusPaid",
  [OrderStatus.Completed]: "ordersPage.statusCompleted",
  [OrderStatus.Cancelled]: "ordersPage.statusCancelled",
  [OrderStatus.Refunded]: "ordersPage.statusRefunded",
};

export const NotificationType = {
  OrderStatus: 0,
  AccountSold: 1,
  Promotion: 2,
  System: 3,
  Message: 4,
} as const;

export type NotificationType = typeof NotificationType[keyof typeof NotificationType];

export const NotificationTypeLabelKey: Record<number, string> = {
  [NotificationType.OrderStatus]: "notification.orderStatus",
  [NotificationType.AccountSold]: "notification.accountSold",
  [NotificationType.Promotion]: "notification.promotion",
  [NotificationType.System]: "notification.system",
  [NotificationType.Message]: "notification.message",
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

