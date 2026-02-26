import { motion, AnimatePresence } from 'framer-motion';
import { useLanguageStore } from '@/stores/languageStore-old';
import { Button } from '@/components/ui/button';

export function LanguageToggle() {
  const { language, toggleLanguage } = useLanguageStore();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleLanguage}
      className="rounded-lg w-10 h-10"
      title={language === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={language}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 10, opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="text-sm font-bold"
        >
          {language === 'vi' ? 'VI' : 'EN'}
        </motion.span>
      </AnimatePresence>
    </Button>
  );
}