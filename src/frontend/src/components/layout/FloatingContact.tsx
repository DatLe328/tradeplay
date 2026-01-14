import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Mail, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const contactLinks = [
  {
    name: "Email",
    icon: Mail,
    href: "mailto:tien9a51011@gmail.com",
    color: "bg-red-500 hover:bg-red-600",
  },
  {
    name: "Zalo",
    icon: () => (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 14.655c-.398.267-.932.178-1.199-.22l-1.63-2.404c-.133-.197-.397-.267-.618-.156l-1.026.514c-.177.089-.354.134-.574.134-.531 0-1.018-.31-1.239-.796l-.708-1.549a.442.442 0 0 0-.398-.267h-.398c-.177 0-.31.133-.31.31v3.054c0 .486-.398.884-.884.884s-.884-.398-.884-.884V8.221c0-.486.398-.884.884-.884h2.122c1.505 0 2.742 1.062 2.742 2.389 0 .796-.442 1.505-1.106 1.946l1.328 1.946c.133.177.31.31.531.31.133 0 .267-.044.354-.133l.752-.575c.354-.267.884-.178 1.151.177.268.398.178.932-.22 1.199l-.67.059z"/>
      </svg>
    ),
    href: "https://zalo.me/0333423113",
    color: "bg-blue-500 hover:bg-blue-600",
  },
  {
    name: "Telegram",
    icon: () => (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
      </svg>
    ),
    href: "https://t.me/shoptct",
    color: "bg-sky-500 hover:bg-sky-600",
  },
];

export function FloatingContact() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-3"
          >
            {contactLinks.map((link, index) => {
              const IconComponent = link.icon;
              return (
                <motion.a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-white shadow-lg transition-transform hover:scale-105 ${link.color}`}
                >
                  <IconComponent className="h-5 w-5" />
                  <span className="text-sm font-medium">{link.name}</span>
                </motion.a>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="lg"
        className="h-14 w-14 rounded-full bg-primary shadow-lg hover:bg-primary/90"
      >
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <MessageCircle className="h-6 w-6" />
          )}
        </motion.div>
      </Button>
    </div>
  );
}