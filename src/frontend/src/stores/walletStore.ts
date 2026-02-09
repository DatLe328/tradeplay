import { create } from "zustand";
import { apiRequest } from "@/services/api";

interface Wallet {
	user_id: number;
	balance: number;
	currency: string;
}

interface WalletState {
	balance: number;
	isLoading: boolean;
	fetchBalance: () => Promise<void>;
}

export const useWalletStore = create<WalletState>((set) => ({
	balance: 0,
	isLoading: false,

	fetchBalance: async () => {
		set({ isLoading: true });
		try {
			const res = await apiRequest<{ data: Wallet }>("/wallets/me");
			if (res && res.data) {
				set({ balance: res.data.balance });
			}
		} catch (error: any) {
			console.error("Fetch wallet balance failed", error);
		} finally {
			set({ isLoading: false });
		}
	},
}));
