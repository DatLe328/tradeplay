import { motion } from "framer-motion";
import { Cloud, Construction } from "lucide-react";

export default function AdminDashboard() {
	return (
		<div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				className="space-y-4"
			>
				<div className="flex justify-center">
					<div className="p-4 rounded-full bg-primary/10">
						<Cloud className="h-12 w-12 text-primary animate-pulse" />
					</div>
				</div>
				
				<h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
					Admin Dashboard
				</h1>
				
				<div className="flex items-center justify-center gap-2 text-muted-foreground">
					<Construction className="h-4 w-4" />
					<p className="text-sm sm:text-base">
						Hệ thống thống kê đang được bảo trì để tích hợp Cloudflare API.
					</p>
				</div>

				<p className="text-xs text-muted-foreground/60 italic">
					Các chức năng quản lý Acc và Order vẫn hoạt động bình thường qua menu bên cạnh.
				</p>
			</motion.div>
		</div>
	);
}