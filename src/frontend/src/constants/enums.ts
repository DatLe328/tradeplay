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


// Map với Backend: type OrderStatus int
export const OrderStatus = {
  Pending: 0,
  Paid: 1,
  Completed: 2,
  Cancelled: 3,
  Refunded: 4,
} as const;

export type OrderStatus =
  typeof OrderStatus[keyof typeof OrderStatus];


// Map với Backend: type OrderType int
export const OrderType = {
  BuyAcc: 0,
  Deposit: 1,
} as const;

export type OrderType =
  typeof OrderType[keyof typeof OrderType];


export const AccountStatusLabel: Record<number, string> = {
  [AccountStatus.Draft]: "Bản nháp",
  [AccountStatus.Available]: "Còn hàng",
  [AccountStatus.Reserved]: "Đã đặt cọc",
  [AccountStatus.Sold]: "Đã bán",
  [AccountStatus.Deleted]: "Đã xóa",
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