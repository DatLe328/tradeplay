import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Menu, X, User, ShoppingBag, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '@/stores/themeStore';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/stores/languageStore';

const navLinks = [
  { to: '/', label: 'Trang Chủ' },
  { to: '/accounts', label: 'Acc Game' },
  { to: '/guide', label: 'Hướng Dẫn' },
  { to: '/warranty', label: 'Bảo Hành' },
  { to: '/orders', label: 'Đơn Hàng' },
];

export function Header() {
  const location = useLocation();
  const { theme, toggleTheme } = useThemeStore();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-primary/20 bg-background/90 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 rounded-2xl bg-gradient-to-br from-primary/20 to-[hsl(var(--pastel-blue))] group-hover:scale-110 transition-all duration-300">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <span className="font-gaming text-xl font-bold text-gradient hidden sm:block">
              PlayTogether Shop
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                  location.pathname === link.to
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {user?.system_role === 'admin' && (
              <Link
                to="/admin"
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                  location.pathname.startsWith('/admin')
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                Admin
              </Link>
            )}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-lg"
            >
              <AnimatePresence mode="wait" initial={false}>
                {theme === 'dark' ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon className="h-5 w-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/orders">
                  <Button variant="ghost" size="icon" className="rounded-lg">
                    <ShoppingBag className="h-5 w-5" />
                  </Button>
                </Link>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary">
                  <User className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">{user?.first_name} {user?.last_name}</span>
                </div>
                <Button variant="outline" size="sm" onClick={logout}>
                  Đăng xuất
                </Button>
              </div>
            ) : (
              <Link to="/auth" className="hidden md:block">
                <Button className="btn-gaming">Đăng nhập</Button>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-lg"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay - floating with acrylic effect */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 top-16 z-40 bg-black/60 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            
            {/* Menu Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="absolute left-0 right-0 top-16 z-50 md:hidden mx-4 mt-2 rounded-2xl border border-border/50 bg-background/90 backdrop-blur-xl shadow-xl"
            >
              <nav className="p-4 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-xl font-semibold transition-colors ${
                      location.pathname === link.to
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                {user?.system_role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 rounded-xl font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  >
                    Admin
                  </Link>
                )}
                {!isAuthenticated && (
                  <Link
                    to="/auth"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 pt-2"
                  >
                    <Button className="btn-gaming w-full">{t('login')}</Button>
                  </Link>
                )}
                {isAuthenticated && (
                  <div className="pt-2 space-y-2">
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-secondary/50">
                      <User className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold">{user?.first_name} {user?.last_name}</span>
                    </div>
                    <Button variant="outline" className="w-full" onClick={logout}>
                      {t('logout')}
                    </Button>
                  </div>
                )}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}