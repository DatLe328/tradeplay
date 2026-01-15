import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { type GameAccount } from "@/types";
import { formatCurrency } from "@/utils/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, ShoppingCart } from "lucide-react";
import { useTranslation } from '@/stores/languageStore';

interface AccountCardProps {
	account: GameAccount;
	index?: number;
}

export function AccountCard({ account, index = 0 }: AccountCardProps) {
  const { t } = useTranslation();
  const isAvailable = account.status === 'available';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="card-gaming group"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={account.thumbnail}
          alt={account.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Game Badge */}
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
            {account.game_name}
          </Badge>
        </div>

        {/* ID Badge */}
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm font-mono">
            MS: {account.id}
          </Badge>
        </div>

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <h3 className="font-gaming font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
          {account.title}
        </h3>

        {/* Quick Info */}
        <div className="flex flex-wrap gap-2">
          {account.rank && (
            <span className="text-xs px-2 py-1 rounded bg-secondary text-secondary-foreground">
              {account.rank}
            </span>
          )}
          {account.server && (
            <span className="text-xs px-2 py-1 rounded bg-secondary text-secondary-foreground">
              {account.server}
            </span>
          )}
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="font-gaming text-xl font-bold text-primary">
            {formatCurrency(account.price)}
          </span>
          {account.original_price && (
            <span className="text-sm text-muted-foreground line-through">
              {formatCurrency(account.original_price)}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Link to={`/accounts/${account.id}`} className="flex-1">
            <Button variant="outline" className="w-full gap-2">
              <Eye className="h-4 w-4" />
              {t('details')}
            </Button>
          </Link>
          {isAvailable && (
            <Link to={`/accounts/${account.id}`}>
              <Button className="btn-gaming gap-2">
                <ShoppingCart className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}