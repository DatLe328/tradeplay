import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Gift, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/stores/languageStore';

export const WELCOME_POPUP_KEY = 'playtogether-welcome-shown';

export function WelcomePopup() {
  const { language } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasShown = localStorage.getItem(WELCOME_POPUP_KEY);
    if (!hasShown) {
      // Delay popup for better UX
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem(WELCOME_POPUP_KEY, 'true');
  };

  const content = {
    vi: {
      title: '🎉 Chào mừng bạn đến với',
      shopName: 'TienCoTruong Shop!',
      description: 'Hiện tại trang web đang trong quá trình hoàn thiện để đem lại trải nghiệm tốt nhất, mọi người khi mua acc vui lòng liên hệ zalo hoặc telegram',
      features: [
        '🛡️ Lưu ý không nên đăng ký tài khoản lúc này vì tương lai gần có thể sẽ xóa khi hoàn thiện website',
        // '✨ Acc chất lượng, giá tốt nhất',
        // '🛡️ Bảo hành 24h đầu tiên',
        // '💬 Hỗ trợ 24/7 nhiệt tình',
        // '🎁 Nhiều ưu đãi hấp dẫn',
      ],
      button: 'Khám phá ngay!',
    },
    en: {
      title: '🎉 Welcome to',
      shopName: 'PlayTogether Shop!',
      description: '#1 Trusted Play Together account shop in Vietnam! We commit:',
      features: [
        '✨ Quality accounts, best prices',
        '🛡️ 24-hour warranty',
        '💬 24/7 dedicated support',
        '🎁 Many attractive offers',
      ],
      button: 'Explore now!',
    },
  };

  const t = content[language];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="relative bg-card border-2 border-primary/30 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl pointer-events-auto overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[hsl(var(--pastel-pink)/0.5)] to-transparent rounded-full blur-2xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[hsl(var(--pastel-blue)/0.5)] to-transparent rounded-full blur-2xl" />

              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary transition-colors"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>

              {/* Content */}
              <div className="relative text-center space-y-4">
                {/* Icon */}
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-[hsl(var(--pastel-blue))]"
                >
                  <Gift className="h-10 w-10 text-primary" />
                </motion.div>

                {/* Title */}
                <div>
                  <p className="text-lg text-muted-foreground">{t.title}</p>
                  <h2 className="font-gaming text-2xl md:text-3xl font-bold text-gradient">
                    {t.shopName}
                  </h2>
                </div>

                {/* Description */}
                <p className="text-muted-foreground text-sm">
                  {t.description}
                </p>

                {/* Features */}
                <ul className="text-left space-y-2 bg-secondary/50 rounded-2xl p-4">
                  {t.features.map((feature, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </motion.li>
                  ))}
                </ul>
                {/* Contact Links */}
                <div className="flex gap-3 justify-center">
                  <a
                    href="https://zalo.me/0333423113"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0068FF] text-white hover:bg-[#0068FF]/90 transition-colors text-sm font-medium"
                  >
                    <span>💬</span>
                    Zalo
                  </a>
                  <a
                    href="https://t.me/shoptct"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0088CC] text-white hover:bg-[#0088CC]/90 transition-colors text-sm font-medium"
                  >
                    <span>✈️</span>
                    Telegram
                  </a>
                </div>

                {/* CTA Button */}
                <Button
                  onClick={handleClose}
                  className="btn-gaming w-full py-6 text-lg gap-2"
                >
                  <Heart className="h-5 w-5" />
                  {t.button}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
